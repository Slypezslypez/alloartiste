import { FREE_READABLE_LEADS } from "./categories";

type LeadLike = {
  id: string;
  createdAt: Date | string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  eventDate: string | null;
  message: string;
};

/**
 * Compte gratuit « découverte » : seules les FREE_READABLE_LEADS premières demandes (les plus anciennes)
 * sont lisibles. Pour les autres, le contenu est retiré CÔTÉ SERVEUR avant d'être envoyé au navigateur
 * (rien de sensible ne circule), et `locked: true` permet d'afficher l'invitation à s'abonner.
 * Si `isFree` est faux (abonné ou en essai), les demandes sont renvoyées telles quelles.
 */
export function lockLeadsForFreeAccount<T extends LeadLike>(leads: T[], isFree: boolean): (T & { locked: boolean })[] {
  if (!isFree) return leads.map((l) => ({ ...l, locked: false }));
  const readableIds = new Set(
    [...leads]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, FREE_READABLE_LEADS)
      .map((l) => l.id)
  );
  return leads.map((l) =>
    readableIds.has(l.id)
      ? { ...l, locked: false }
      : { ...l, senderName: "Demande réservée aux abonnés", senderEmail: "", senderPhone: null, eventDate: null, message: "", locked: true }
  );
}
