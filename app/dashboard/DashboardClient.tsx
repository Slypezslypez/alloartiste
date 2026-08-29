import { redirect } from "next/navigation";
import { getCurrentArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");
  if (!artist.emailVerified) redirect("/verifier-email");

  // Filet de sécurité : si un événement Stripe a été manqué (ou date d'avant l'ajout d'un champ
  // suivi ici), on re-synchronise directement avec Stripe à chaque ouverture de l'espace membre,
  // plutôt que de dépendre uniquement du webhook.
  if (artist.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(artist.stripeSubscriptionId);
      if (
        sub.status !== artist.subscriptionStatus ||
        sub.cancel_at_period_end !== artist.cancelAtPeriodEnd ||
        sub.current_period_end * 1000 !== artist.currentPeriodEnd?.getTime()
      ) {
        artist = await prisma.artist.update({
          where: { id: artist.id },
          data: {
            subscriptionStatus: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end
          }
        });
      }
    } catch {
      // Si Stripe est momentanément indisponible, on affiche simplement les dernières données connues.
    }
  }

  const leads = await prisma.lead.findMany({
    where: { artistId: artist.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const unavailableDates = await prisma.unavailableDate.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "asc" }
  });

  const { passwordHash, ...safe } = artist;
  return (
    <DashboardClient
      initialArtist={JSON.parse(JSON.stringify(safe))}
      initialLeads={JSON.parse(JSON.stringify(leads))}
      initialUnavailableDates={unavailableDates.map((d) => d.date.toISOString().slice(0, 10))}
    />
  );
}
