import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";

const schema = z.object({ status: z.enum(["new", "replied", "archived"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.artistId !== artist.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const updated = await prisma.lead.update({ where: { id: lead.id }, data: { status: parsed.data.status } });
  return NextResponse.json(updated);
}

// Suppression définitive d'une demande (et de tout son fil de conversation, en cascade).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.artistId !== artist.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  await prisma.lead.delete({ where: { id: lead.id } });
  return NextResponse.json({ ok: true });
}
