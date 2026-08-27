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
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const { category, oldSpecialty, newSpecialty } = parsed.data;
  const updated = await prisma.artist.updateMany({
    where: { category, specialty: oldSpecialty },
    data: { specialty: newSpecialty.trim() }
  });

  return NextResponse.json({ ok: true, count: updated.count });
}
