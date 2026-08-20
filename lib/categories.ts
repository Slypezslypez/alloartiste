export const CATEGORIES = [
  "Musicien·ne",
  "Chanteur·se",
  "Danseur·se",
  "Comédien·ne",
  "DJ",
  "Humoriste",
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
