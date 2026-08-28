import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// Liste tous les termes de spécialité en usage, groupés par famille, avec le nombre d'artistes
// concernés — sert à l'admin pour repérer et corriger les termes maladroits (fautes, doublons,
// formulations trop proches) sans devoir ouvrir chaque profil un par un.
// Chaque artiste peut avoir jusqu'à 3 spécialités : on les déplie ici pour compter chaque terme.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const artists = await prisma.artist.findMany({ select: { category: true, specialties: true } });

  const counts = new Map<string, { category: string; specialty: string; count: number }>();
  for (const a of artists) {
    for (const s of a.specialties) {
      const key = `${a.category}::${s}`;
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { category: a.category, specialty: s, count: 1 });
    }
  }

  const result = Array.from(counts.values()).sort(
    (a, b) => a.category.localeCompare(b.category, "fr") || a.specialty.localeCompare(b.specialty, "fr")
  );

  return NextResponse.json(result);
}
