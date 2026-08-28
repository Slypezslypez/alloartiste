import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const schema = z.object({
  category: z.string().min(1),
  oldSpecialty: z.string().min(1),
  newSpecialty: z.string().min(1).max(60)
});

// Renomme un terme de spécialité pour tous les artistes concernés en une seule fois — utile pour
// corriger une faute ou fusionner deux formulations proches (ex. "bassiste de studio" -> "Bassiste").
// Chaque artiste ayant jusqu'à 3 spécialités (tableau), on remplace juste le terme concerné dans
// son tableau, en évitant les doublons si le nouveau terme y figurait déjà.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const { category, oldSpecialty, newSpecialty } = parsed.data;
  const trimmedNew = newSpecialty.trim();

  const artists = await prisma.artist.findMany({
    where: { category, specialties: { has: oldSpecialty } },
    select: { id: true, specialties: true }
  });

  let count = 0;
  for (const a of artists) {
    const updatedSpecialties = Array.from(new Set(a.specialties.map((s) => (s === oldSpecialty ? trimmedNew : s))));
    await prisma.artist.update({ where: { id: a.id }, data: { specialties: updatedSpecialties } });
    count += 1;
  }

  return NextResponse.json({ ok: true, count });
}
