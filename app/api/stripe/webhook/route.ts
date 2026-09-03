import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendPaymentFailedAlertEmail } from "@/lib/email";

// Stripe a besoin du corps brut (non parsé) pour vérifier la signature.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature as string, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const artistId = session.metadata?.artistId;
      if (artistId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await prisma.artist.update({
          where: { id: artistId },
          data: {
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end
          }
        });
      }
      break;
    }

    // Renouvellement annuel réussi (ou tout paiement de la souscription).
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        await updateByCustomer(sub);
      }
      break;
    }

    // Mise à jour générique (changement de statut, annulation programmée, etc.)
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await updateByCustomer(sub);
      break;
    }

    // Échec de paiement du renouvellement — le profil redeviendra invisible
    // automatiquement puisque currentPeriodEnd ne sera pas repoussé. On prévient
    // aussi l'administrateur par email pour qu'il ne découvre pas ça trop tard.
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        await updateByCustomer(sub);

        const artist = await prisma.artist.findFirst({
          where: { stripeSubscriptionId: sub.id },
          select: { name: true, email: true }
        });
        if (artist) {
          try {
            await sendPaymentFailedAlertEmail({
              artistName: artist.name,
              artistEmail: artist.email,
              amount: invoice.amount_due != null ? `${(invoice.amount_due / 100).toFixed(2)} ${(invoice.currency || "eur").toUpperCase()}` : undefined,
              attemptCount: invoice.attempt_count || undefined,
              nextAttemptDate: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null
            });
          } catch {
            // Ne bloque jamais le traitement du webhook si l'envoi d'email échoue.
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function updateByCustomer(sub: Stripe.Subscription) {
  await prisma.artist.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: {
      subscriptionStatus: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end
    }
  });
}
