import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";
import { CATEGORIES } from "@/lib/categories";

export async function GET() {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const { passwordHash, ...safe } = artist;
  return NextResponse.json(safe);
}

const schema = z.object({
  name: z.string().min(2).max(60).optional(),
  category: z.enum(CATEGORIES).optional(),
  bio: z.string().max(600).optional()
});

export async function PATCH(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const updated = await prisma.artist.update({ where: { id: artist.id }, data: parsed.data });
  const { passwordHash, ...safe } = updated;
  return NextResponse.json(safe);
}
