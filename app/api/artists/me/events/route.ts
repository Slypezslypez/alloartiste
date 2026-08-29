import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(2).max(140),
  date: z.coerce.date(),
  description: z.string().max(400).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  imageUrl: z.string().url().or(z.literal("")).optional().nullable(),
  bookingLink: z.string().url().or(z.literal("")).optional().nullable()
});

export async function GET() {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  // Les événements déjà passés sont supprimés au passage : pas de tâche planifiée à gérer,
  // la table ne grossit jamais avec de vieilles dates.
  await prisma.event.deleteMany({ where: { artistId: artist.id, date: { lt: new Date() } } });

  const events = await prisma.event.findMany({ where: { artistId: artist.id }, orderBy: { date: "asc" } });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const event = await prisma.event.create({
    data: {
      artistId: artist.id,
      title: parsed.data.title,
      date: parsed.data.date,
      description: parsed.data.description || null,
      location: parsed.data.location || null,
      imageUrl: parsed.data.imageUrl || null,
      bookingLink: parsed.data.bookingLink || null
    }
  });
  return NextResponse.json(event);
}
