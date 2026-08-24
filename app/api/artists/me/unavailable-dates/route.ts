import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide.") });

function toMidnightUTC(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/** Ajoute une date d'indisponibilité (idempotent : pas d'erreur si déjà bloquée). */
export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Date invalide." }, { status: 400 });

  await prisma.unavailableDate
    .create({ data: { artistId: artist.id, date: toMidnightUTC(parsed.data.date) } })
    .catch(() => {}); // déjà bloquée : rien à faire

  const dates = await prisma.unavailableDate.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "asc" }
  });
  return NextResponse.json({ dates: dates.map((d) => d.date.toISOString().slice(0, 10)) });
}

/** Retire une date d'indisponibilité. */
export async function DELETE(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Date invalide." }, { status: 400 });

  await prisma.unavailableDate.deleteMany({
    where: { artistId: artist.id, date: toMidnightUTC(parsed.data.date) }
  });

  const dates = await prisma.unavailableDate.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "asc" }
  });
  return NextResponse.json({ dates: dates.map((d) => d.date.toISOString().slice(0, 10)) });
}
