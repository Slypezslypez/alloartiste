import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

const schema = z.object({ accepted: z.literal(true) });

export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Vous devez accepter les Conditions Générales d'Utilisation." }, { status: 400 });
  }

  let customerId = artist.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: artist.email,
      name: artist.name,
      metadata: { artistId: artist.id }
    });
    customerId = customer.id;
    await prisma.artist.update({ where: { id: artist.id }, data: { stripeCustomerId: customerId } });
  }

  // Trace de l'acceptation des CGU au moment de la démarche d'abonnement.
  await prisma.artist.update({ where: { id: artist.id }, data: { termsAcceptedAt: new Date() } });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID as string, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?abonnement=ok`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?abonnement=annule`,
    metadata: { artistId: artist.id }
  });

  return NextResponse.json({ url: session.url });
}
