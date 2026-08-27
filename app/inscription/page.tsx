import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { InscriptionForm } from "./InscriptionForm";

export const dynamic = "force-dynamic";

export default async function InscriptionPage() {
  const artists = await prisma.artist.findMany({ select: { category: true, specialty: true } });
  const customCategories = artists.map((a) => a.category).filter((c) => !CATEGORIES.includes(c as any));

  // Catégories de base (sans "Autre") + celles déjà créées par d'autres artistes + "Autre" tout à la fin.
  const allCategories = [...CATEGORIES.filter((c) => c !== "Autre"), ...Array.from(new Set(customCategories)).sort(), "Autre"];

  // Spécialités déjà utilisées, groupées par famille : sert de suggestions (pas de liste fermée).
  const specialtiesByCategory: Record<string, string[]> = {};
  for (const a of artists) {
    if (!a.specialty) continue;
    if (!specialtiesByCategory[a.category]) specialtiesByCategory[a.category] = [];
    if (!specialtiesByCategory[a.category].includes(a.specialty)) specialtiesByCategory[a.category].push(a.specialty);
  }
  for (const key of Object.keys(specialtiesByCategory)) specialtiesByCategory[key].sort();

  return <InscriptionForm categories={allCategories} specialtiesByCategory={specialtiesByCategory} />;
}
