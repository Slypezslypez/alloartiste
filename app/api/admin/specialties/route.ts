import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// Liste tous les termes de spécialité en usage, groupés par famille, avec le nombre d'artistes
// concernés — sert à l'admin pour repérer et corriger les termes maladroits (fautes, doublons,
// formulations trop proches) sans devoir ouvrir chaque profil un par un.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const groups = await prisma.artist.groupBy({
    by: ["category", "specialty"],
    where: { specialty: { not: null } },
    _count: { _all: true }
  });

  const result = groups
    .map((g) => ({ category: g.category, specialty: g.specialty as string, count: g._count._all }))
    .sort((a, b) => a.category.localeCompare(b.category, "fr") || a.specialty.localeCompare(b.specialty, "fr"));

  return NextResponse.json(result);
}
