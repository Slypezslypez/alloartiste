export type SponsorLogo = {
  imageUrl: string;
  name: string | null;
  linkUrl: string | null;
};

// Le champ SiteSettings.sponsorLogos est stocké en texte JSON brut (colonne TEXT, pas de
// type Json Postgres natif utilisé ailleurs dans ce projet). Ces deux fonctions centralisent
// la lecture/écriture pour éviter toute divergence entre l'admin, l'API et la page d'accueil.
export function parseSponsorLogos(raw: string | null | undefined): SponsorLogo[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && typeof x.imageUrl === "string")
      .map((x) => ({
        imageUrl: x.imageUrl as string,
        name: typeof x.name === "string" && x.name.trim() ? x.name : null,
        linkUrl: typeof x.linkUrl === "string" && x.linkUrl.trim() ? x.linkUrl : null
      }));
  } catch {
    return [];
  }
}

export function stringifySponsorLogos(logos: SponsorLogo[]): string {
  return JSON.stringify(logos);
}
