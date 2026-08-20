import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/email";
import { isSubscriptionVisible } from "@/lib/categories";

const schema = z.object({
  senderName: z.string().min(2).max(80),
  senderEmail: z.string().email(),
  message: z.string().min(10).max(3000)
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await prisma.artist.findUnique({ where: { id: params.id } });
  if (!artist || !isSubscriptionVisible(artist)) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });

  await sendContactEmail({
    artistName: artist.name,
    artistEmail: artist.email,
    senderName: parsed.data.senderName,
    senderEmail: parsed.data.senderEmail,
    message: parsed.data.message
  });

  return NextResponse.json({ ok: true });
}
