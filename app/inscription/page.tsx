import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { InscriptionForm } from "./InscriptionForm";

// La liste des métiers déjà utilisés évolue rarement : régénérée toutes les 5 minutes plutôt que
// d'interroger la base à chaque visite du formulaire d'inscription.
export const revalidate = 300;

export default async function InscriptionPage() {
  const artists = await prisma.artist.findMany({ select: { category: true }, distinct: ["category"] });
  const customCategories = artists.map((a) => a.category).filter((c) => !CATEGORIES.includes(c as any));

  // Métiers de base (sans "Autre") + ceux déjà créés par d'autres artistes + "Autre" tout à la fin.
  const allCategories = [...CATEGORIES.filter((c) => c !== "Autre"), ...Array.from(new Set(customCategories)).sort(), "Autre"];

  return <InscriptionForm categories={allCategories} />;
}
