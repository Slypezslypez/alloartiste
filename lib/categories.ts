export const CATEGORIES = [
  "Artiste de rue",
  "Chanteur·se",
  "Comédien·ne",
  "Danseur·se",
  "DJ",
  "Humoriste",
  "Musicien·ne",
  "Peintre / Plasticien·ne",
  "Photographe",
  "Autre"
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MAX_PHOTOS = 5;
export const MAX_VIDEOS = 5;
export const SUBSCRIPTION_LABEL = "33 € / an";

/** Un profil n'est visible publiquement que si son abonnement Stripe est actif ou en essai
 *  et que la période payée courante n'est pas expirée. */
export function isSubscriptionVisible(artist: {
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
}) {
  if (!artist.subscriptionStatus || !artist.currentPeriodEnd) return false;
  const okStatus = artist.subscriptionStatus === "active" || artist.subscriptionStatus === "trialing";
  return okStatus && artist.currentPeriodEnd.getTime() > Date.now();
}

/** Un profil est considéré "Nouveau" pendant les 14 jours suivant sa création. */
export function isNewArrival(createdAt: Date | string) {
  const t = new Date(createdAt).getTime();
  return Date.now() - t < 14 * 24 * 60 * 60 * 1000;
}

export const BELGIAN_CITIES = [
  "Bruxelles",
  "Anvers",
  "Gand",
  "Charleroi",
  "Liège",
  "Bruges",
  "Namur",
  "Louvain",
  "Mons",
  "Courcelles",
  "Tournai",
  "La Louvière",
  "Wavre",
  "Verviers",
  "Arlon",
  "Ostende",
  "Autre"
] as const;

export const FRENCH_CITIES = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Montpellier",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Le Havre",
  "Saint-Étienne",
  "Toulon",
  "Grenoble",
  "Autre"
] as const;

/** Pays pris en charge pour l'inscription et la recherche d'artistes. */
export const COUNTRIES = ["Belgique", "France"] as const;
export type Country = (typeof COUNTRIES)[number];

/** Liste de villes proposée dans le menu déroulant, selon le pays choisi. */
export const CITIES_BY_COUNTRY: Record<Country, readonly string[]> = {
  Belgique: BELGIAN_CITIES,
  France: FRENCH_CITIES
};
