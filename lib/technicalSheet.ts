// La fiche technique (rider) est stockée en JSON texte dans la colonne existante Artist.technicalNeeds
// (même principe que SiteSettings.sponsorLogos) — évite une nouvelle migration pour de simples champs
// texte structurés. Ce fichier centralise la forme des données, côté client comme côté serveur.

export type TechnicalSheetData = {
  onStageCount: string; // nombre de personnes sur scène (texte libre : "2", "3 à 5"...)
  stageSize: string; // dimensions minimales de la scène souhaitées
  soundNeeds: string; // sonorisation : nombre de micros, entrées console, retours...
  lightNeeds: string; // besoins lumière
  powerNeeds: string; // alimentation électrique
  technicalContact: string; // nom / téléphone du référent technique (régisseur, tourneur...)
};

export const EMPTY_TECHNICAL_SHEET: TechnicalSheetData = {
  onStageCount: "",
  stageSize: "",
  soundNeeds: "",
  lightNeeds: "",
  powerNeeds: "",
  technicalContact: ""
};

export function parseTechnicalSheet(raw: string | null | undefined): TechnicalSheetData {
  if (!raw) return { ...EMPTY_TECHNICAL_SHEET };
  try {
    const parsed = JSON.parse(raw);
    return { ...EMPTY_TECHNICAL_SHEET, ...parsed };
  } catch {
    return { ...EMPTY_TECHNICAL_SHEET };
  }
}

export function isTechnicalSheetEmpty(data: TechnicalSheetData): boolean {
  return Object.values(data).every((v) => !v || !v.trim());
}
