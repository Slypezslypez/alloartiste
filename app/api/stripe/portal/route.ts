import { NextResponse } from "next/server";
import { getCurrentArtist } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const artist = await getCurrentArtist();
  if (!artist || !artist.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement à gérer." }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: artist.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
  });

  return NextResponse.json({ url: session.url });
}
