// Les familles de métiers viennent désormais de l'arborescence fermée métier -> spécialités
// (voir lib/specialtyTree.ts), qui remplace l'ancienne liste courte + texte libre.
import { FAMILIES } from "./specialtyTree";

export const CATEGORIES = FAMILIES;

export type Category = string;

export const MAX_PHOTOS = 5;
export const MAX_VIDEOS = 5;
export const SUBSCRIPTION_LABEL = "39 € / an";

/** Catalogue public sur la page d'accueil. Tant que NEXT_PUBLIC_CATALOG_OPEN n'est pas "true" dans Vercel,
 *  l'accueil n'affiche ni la liste d'artistes ni le compteur : seulement l'invitation à s'inscrire (lancement). */
export const CATALOG_OPEN = process.env.NEXT_PUBLIC_CATALOG_OPEN === "true";

/** Interrupteur des paiements (Stripe / PayPal). Tant que la variable d'environnement
 *  NEXT_PUBLIC_PAYMENTS_ENABLED n'est pas "true" dans Vercel, l'abonnement payant est fermé :
 *  l'inscription reste ouverte et la visibilité s'obtient uniquement via un code d'invitation.
 *  À passer à "true" une fois Stripe configuré en mode réel. */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

/** Un profil n'est visible publiquement que si son abonnement Stripe est actif ou en essai
 *  et que la période payée courante n'est pas expirée. */
export function isSubscriptionVisible(artist: {
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
}) {
  if (artist.subscriptionStatus === "free") return true; // compte gratuit « découverte » : visible sans date de fin
  if (!artist.subscriptionStatus || !artist.currentPeriodEnd) return false;
  const okStatus = artist.subscriptionStatus === "active" || artist.subscriptionStatus === "trialing";
  return okStatus && artist.currentPeriodEnd.getTime() > Date.now();
}

/** Compte gratuit « découverte » : le profil est visible, mais seule la première demande de devis est lisible. */
export function isFreeAccount(artist: { subscriptionStatus: string | null }) {
  return artist.subscriptionStatus === "free";
}

/** Nombre de demandes de devis lisibles pour un compte gratuit (les suivantes sont verrouillées). */
export const FREE_READABLE_LEADS = 1;
// Limites du compte gratuit « découverte »
export const FREE_MAX_PHOTOS = 1;
export const FREE_MAX_VIDEOS = 0;
export const FREE_BIO_MAX = 200;
export const BIO_MAX = 600;

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
