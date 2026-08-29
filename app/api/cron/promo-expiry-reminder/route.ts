import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPromoExpiryReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const REMINDER_WINDOW_DAYS = 7;

// Appelée une fois par jour par le cron Vercel (voir vercel.json). Repère les artistes dont l'accès
// gratuit obtenu via un code promo se termine dans les 7 prochains jours, et leur envoie un rappel
// unique (grâce à expiryReminderSentAt, qui empêche tout renvoi une fois fait).
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const pendingCodes = await prisma.inviteCode.findMany({
    where: { usedAt: { not: null }, usedByArtistId: { not: null }, expiryReminderSentAt: null }
  });
  if (pendingCodes.length === 0) {
    return NextResponse.json({ checked: 0, sent: 0 });
  }

  const artistIds = pendingCodes.map((c) => c.usedByArtistId as string);
  const artists = await prisma.artist.findMany({
    where: { id: { in: artistIds } },
    select: { id: true, name: true, email: true, subscriptionStatus: true, currentPeriodEnd: true }
  });
  const artistById = new Map(artists.map((a) => [a.id, a]));

  const now = Date.now();
  const windowEnd = now + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  let sent = 0;
  for (const code of pendingCodes) {
    const artist = artistById.get(code.usedByArtistId as string);
    if (!artist || !artist.currentPeriodEnd || artist.subscriptionStatus !== "active") continue;

    const expiryTime = artist.currentPeriodEnd.getTime();
    if (expiryTime < now || expiryTime > windowEnd) continue; // pas encore dans la fenêtre, ou déjà expiré

    try {
      await sendPromoExpiryReminderEmail(artist.name, artist.email, artist.currentPeriodEnd);
      await prisma.inviteCode.update({ where: { id: code.id }, data: { expiryReminderSentAt: new Date() } });
      sent++;
    } catch {
      // On retentera au prochain passage du cron (expiryReminderSentAt reste null).
    }
  }

  return NextResponse.json({ checked: pendingCodes.length, sent });
}
