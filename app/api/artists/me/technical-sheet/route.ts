import { NextResponse } from "next/server";
import { getCurrentArtist } from "@/lib/auth";
import { createBrandedPdf, drawFieldLine, drawWrappedText, finishPdf } from "@/lib/pdfDocs";
import { slugify } from "@/lib/slugify";

// Génère à la volée la fiche technique PDF de l'artiste connecté, à partir des informations déjà
// renseignées dans son profil (aucune donnée stockée séparément pour ce document).
export async function GET() {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const cursor = await createBrandedPdf("Fiche technique");

  drawFieldLine(cursor, "Nom / nom de scène", artist.name);
  drawFieldLine(cursor, "Métier", [artist.category, ...(artist.specialties || [])].filter(Boolean).join(" · "));
  drawFieldLine(cursor, "Localisation", [artist.city, artist.country].filter(Boolean).join(", "));

  const priceLabel =
    artist.priceMin != null && artist.priceMax != null
      ? `${artist.priceMin} € - ${artist.priceMax} €`
      : artist.priceMin != null
        ? `à partir de ${artist.priceMin} €`
        : artist.priceMax != null
          ? `jusqu'à ${artist.priceMax} €`
          : "";
  if (priceLabel) drawFieldLine(cursor, "Fourchette de prix indicative", priceLabel);

  if (artist.bio) drawFieldLine(cursor, "Présentation", artist.bio);

  if (artist.services && artist.services.length > 0) {
    drawFieldLine(cursor, "Formules & prestations", artist.services.join(" · "));
  }

  const contactParts = [
    artist.phone ? `Tél. ${artist.phone}` : null,
    artist.email,
    artist.website || null
  ].filter(Boolean);
  drawFieldLine(cursor, "Contact", contactParts.join("  •  "));

  if (artist.technicalNeeds && artist.technicalNeeds.trim()) {
    drawFieldLine(cursor, "Besoins techniques", artist.technicalNeeds);
  }

  cursor.y -= 10;
  drawWrappedText(cursor, `Document généré automatiquement depuis alloartiste.be le ${new Date().toLocaleDateString("fr-BE")}.`, {
    size: 9,
    color: undefined
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
