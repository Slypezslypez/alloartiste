import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAllResources } from "@/lib/resourceMonitor";
import { sendResourceAlertEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const ALERT_THRESHOLD_PERCENT = 80;
const MIN_DAYS_BETWEEN_ALERTS = 3;

// Appelée une fois par jour par le cron Vercel (voir vercel.json). Vérifie le stockage R2, le
// temps de calcul Neon et le stockage de la base de données ; envoie un email à l'administrateur
// (adresse CONTACT_RECEIVER_EMAIL / EMAIL_FROM) si au moins une ressource dépasse 80% de son
// quota gratuit, en évitant de renvoyer le même avertissement plus d'une fois tous les 3 jours.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const resources = await checkAllResources();

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  let sentAt: Record<string, string> = {};
  try {
    sentAt = settings?.resourceAlertsSentAt ? JSON.parse(settings.resourceAlertsSentAt) : {};
  } catch {
    sentAt = {};
  }

  const now = Date.now();
  const overThreshold = resources.filter((r) => r.ok && r.percent !== null && r.percent >= ALERT_THRESHOLD_PERCENT);

  const toAlert = overThreshold.filter((r) => {
    const last = sentAt[r.key] ? new Date(sentAt[r.key]).getTime() : 0;
    return now - last >= MIN_DAYS_BETWEEN_ALERTS * 24 * 60 * 60 * 1000;
  });

  let emailSent = false;
  if (toAlert.length > 0) {
    try {
      await sendResourceAlertEmail(toAlert);
      emailSent = true;
      const nextSentAt = { ...sentAt };
      for (const r of toAlert) nextSentAt[r.key] = new Date(now).toISOString();
      await prisma.siteSettings.update({
        where: { id: "singleton" },
        data: { resourceAlertsSentAt: JSON.stringify(nextSentAt) }
      });
    } catch {
      // On retentera au prochain passage du cron (resourceAlertsSentAt n'est pas mis à jour).
    }
  }

  return NextResponse.json({ resources, overThreshold: overThreshold.map((r) => r.key), emailSent });
}
