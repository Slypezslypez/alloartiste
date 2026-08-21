import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/email";
import { isSubscriptionVisible } from "@/lib/categories";

const schema = z.object({
  senderName: z.string().min(2).max(80),
  senderEmail: z.string().email(),
  senderPhone: z.string().max(30).optional(),
  eventDate: z.string().max(40).optional(),
  message: z.string().min(10).max(3000)
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await prisma.artist.findUnique({ where: { id: params.id } });
  if (!artist || !isSubscriptionVisible(artist)) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });

  // On enregistre la demande de contact ("lead") pour que l'artiste la retrouve dans son espace,
  // même si l'envoi d'email venait à échouer.
  await prisma.lead.create({
    data: {
      artistId: artist.id,
      senderName: parsed.data.senderName,
      senderEmail: parsed.data.senderEmail,
      senderPhone: parsed.data.senderPhone || null,
      eventDate: parsed.data.eventDate || null,
      message: parsed.data.message
    }
  });

  sendContactEmail({
    artistName: artist.name,
    artistEmail: artist.email,
    senderName: parsed.data.senderName,
    senderEmail: parsed.data.senderEmail,
    message: parsed.data.message
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
