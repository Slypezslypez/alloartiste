import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(2).max(140).optional(),
  date: z.coerce.date().optional(),
  description: z.string().max(400).optional().nullable()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event || event.artistId !== artist.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const updated = await prisma.event.update({ where: { id: event.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event || event.artistId !== artist.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  await prisma.event.delete({ where: { id: event.id } });
  return NextResponse.json({ ok: true });
}
