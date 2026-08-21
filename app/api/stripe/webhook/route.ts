import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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
            currentPeriodEnd: getPeriodEnd(sub)
          }
        });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        await updateByCustomer(sub);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await updateByCustomer(sub);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        await updateByCustomer(sub);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

/** Récupère la date de fin de période, quelle que soit la version de l'API Stripe utilisée. */
function getPeriodEnd(sub: Stripe.Subscription): Date {
  const fromItem = (sub as any).items?.data?.[0]?.current_period_end;
  const fromRoot = (sub as any).current_period_end;
  const timestamp = fromItem ?? fromRoot;
  if (typeof timestamp === "number") {
    return new Date(timestamp * 1000);
  }
  // Filet de sécurité : si Stripe ne renvoie aucune date exploitable, on retombe sur un an.
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
}

async function updateByCustomer(sub: Stripe.Subscription) {
  await prisma.artist.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: {
      subscriptionStatus: sub.status,
      currentPeriodEnd: getPeriodEnd(sub)
    }
  });
}
