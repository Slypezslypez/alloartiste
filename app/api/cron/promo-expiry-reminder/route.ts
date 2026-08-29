import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPromoExpiryReminderEmail, sendPromoExpiredEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const REMINDER_WINDOW_DAYS = 7;

// Appelée une fois par jour par le cron Vercel (voir vercel.json). Gère deux rappels distincts pour
// les artistes ayant obtenu un accès gratuit via un code promo, chacun envoyé une seule fois :
// 1. avant l'échéance (dans les 7 jours qui précèdent), pour prévenir que ça se termine bientôt ;
// 2. après l'échéance, s'il n'a pas renouvelé, pour l'inviter à s'abonner et redevenir visible.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const candidateCodes = await prisma.inviteCode.findMany({
    where: {
      usedAt: { not: null },
      usedByArtistId: { not: null },
      OR: [{ expiryReminderSentAt: null }, { expiredReminderSentAt: null }]
    }
  });
  if (candidateCodes.length === 0) {
    return NextResponse.json({ checked: 0, sentBefore: 0, sentAfter: 0 });
  }

  const artistIds = candidateCodes.map((c) => c.usedByArtistId as string);
  const artists = await prisma.artist.findMany({
    where: { id: { in: artistIds } },
    select: { id: true, name: true, email: true, subscriptionStatus: true, currentPeriodEnd: true }
  });
  const artistById = new Map(artists.map((a) => [a.id, a]));

  const now = Date.now();
  const windowEnd = now + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  let sentBefore = 0;
  let sentAfter = 0;
  for (const code of candidateCodes) {
    const artist = artistById.get(code.usedByArtistId as string);
    if (!artist || !artist.currentPeriodEnd || artist.subscriptionStatus !== "active") continue;

    const expiryTime = artist.currentPeriodEnd.getTime();

    if (code.expiryReminderSentAt === null && expiryTime >= now && expiryTime <= windowEnd) {
      try {
        await sendPromoExpiryReminderEmail(artist.name, artist.email, artist.currentPeriodEnd);
        await prisma.inviteCode.update({ where: { id: code.id }, data: { expiryReminderSentAt: new Date() } });
        sentBefore++;
      } catch {
        // On retentera au prochain passage du cron (expiryReminderSentAt reste null).
      }
      continue;
    }

    if (code.expiredReminderSentAt === null && expiryTime < now) {
      try {
        await sendPromoExpiredEmail(artist.name, artist.email);
        await prisma.inviteCode.update({ where: { id: code.id }, data: { expiredReminderSentAt: new Date() } });
        sentAfter++;
      } catch {
        // On retentera au prochain passage du cron (expiredReminderSentAt reste null).
      }
    }
  }

  return NextResponse.json({ checked: candidateCodes.length, sentBefore, sentAfter });
}
