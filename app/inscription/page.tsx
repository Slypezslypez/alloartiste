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

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          maxWidth: 720,
          margin: "0 auto 18px",
          padding: "12px 16px",
          border: "1px solid var(--line, rgba(201,146,44,0.35))",
          borderRadius: 14
        }}
      >
        <img
          src="/carlos.jpg"
          alt="Carlos Vaquera"
          width={72}
          height={72}
          style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
        <div>
          <strong style={{ display: "block", fontSize: 17 }}>Carlos Vaquera</strong>
          <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>Parrain d&apos;AlloArtiste</span>
        </div>
      </div>
      <InscriptionForm categories={allCategories} />
    </>
  );
}
