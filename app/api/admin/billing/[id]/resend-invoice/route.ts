import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendInvoiceEmail } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const artist = await prisma.artist.findUnique({ where: { id: params.id } });
  if (!artist || !artist.stripeCustomerId) {
    return NextResponse.json({ error: "Aucun abonnement Stripe pour cet artiste." }, { status: 400 });
  }

  const invoices = await stripe.invoices.list({ customer: artist.stripeCustomerId, limit: 1 });
  const invoice = invoices.data[0];
  if (!invoice || !invoice.hosted_invoice_url) {
    return NextResponse.json({ error: "Aucune facture trouvée pour cet artiste." }, { status: 404 });
  }

  try {
    await sendInvoiceEmail(artist.name, artist.email, invoice.hosted_invoice_url, invoice.number || undefined);
  } catch (err) {
    console.error("Échec de l'envoi de la facture:", err);
    return NextResponse.json({ error: "Échec de l'envoi de l'email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: invoice.hosted_invoice_url });
}
