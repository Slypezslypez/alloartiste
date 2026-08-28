import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { InscriptionForm } from "./InscriptionForm";

export const dynamic = "force-dynamic";

export default async function InscriptionPage() {
  const artists = await prisma.artist.findMany({ select: { category: true }, distinct: ["category"] });
  const customCategories = artists.map((a) => a.category).filter((c) => !CATEGORIES.includes(c as any));

  // Métiers de base (sans "Autre") + ceux déjà créés par d'autres artistes + "Autre" tout à la fin.
  const allCategories = [...CATEGORIES.filter((c) => c !== "Autre"), ...Array.from(new Set(customCategories)).sort(), "Autre"];

  return <InscriptionForm categories={allCategories} />;
}
