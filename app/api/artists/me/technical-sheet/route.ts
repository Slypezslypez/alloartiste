import { NextResponse } from "next/server";
import { getCurrentArtist } from "@/lib/auth";
import { createBrandedPdf, drawFieldLine, drawWrappedText, finishPdf } from "@/lib/pdfDocs";
import { slugify } from "@/lib/slugify";
import { parseTechnicalSheet, isTechnicalSheetEmpty } from "@/lib/technicalSheet";

// Génère à la volée la fiche technique (rider) PDF de l'artiste connecté : uniquement les
// informations techniques utiles à une salle ou un régisseur (scène, son, lumière, alimentation,
// contact technique) — pas la bio, le prix ni les formules, qui n'ont pas leur place ici.
export async function GET() {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const sheet = parseTechnicalSheet(artist.technicalNeeds);
  if (isTechnicalSheetEmpty(sheet)) {
    return NextResponse.json(
      { error: "Aucune information technique renseignée. Complétez la section « Fiche technique » de votre profil." },
      { status: 400 }
    );
  }

  const cursor = await createBrandedPdf("Fiche technique");

  drawFieldLine(cursor, "Nom / nom de scène", artist.name);
  drawFieldLine(cursor, "Métier", [artist.category, ...(artist.specialties || [])].filter(Boolean).join(" · "));

  if (sheet.onStageCount) drawFieldLine(cursor, "Personnes sur scène", sheet.onStageCount);
  if (sheet.stageSize) drawFieldLine(cursor, "Espace scénique minimum", sheet.stageSize);
  if (sheet.soundNeeds) drawFieldLine(cursor, "Sonorisation", sheet.soundNeeds);
  if (sheet.lightNeeds) drawFieldLine(cursor, "Lumière", sheet.lightNeeds);
  if (sheet.powerNeeds) drawFieldLine(cursor, "Alimentation électrique", sheet.powerNeeds);
  if (sheet.technicalContact) drawFieldLine(cursor, "Contact technique", sheet.technicalContact);

  drawFieldLine(cursor, "Contact artiste", [artist.phone ? `Tél. ${artist.phone}` : null, artist.email].filter(Boolean).join("  •  "));

  cursor.y -= 10;
  drawWrappedText(cursor, `Document généré automatiquement depuis alloartiste.be le ${new Date().toLocaleDateString("fr-BE")}.`, {
    size: 9
  });

  const bytes = await finishPdf(cursor);
  const filename = `fiche-technique-${slugify(artist.name)}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`
    }
  });
}
