import { revalidatePath } from "next/cache";

// Les pages publiques sont mises en cache longtemps (6 h) pour que la base de données puisse
// se mettre en veille. Ces fonctions forcent leur mise à jour dès qu'une vraie modification a lieu.

/** Modification d'un profil artiste : accueil + fiche concernée. */
export function refreshPublic(artistId?: string) {
  try {
    revalidatePath("/");
    if (artistId) revalidatePath(`/profil/${artistId}`);
  } catch {
    // Sans conséquence : le cache expirera de lui-même.
  }
}

/** Articles / actualités. */
export function refreshArticles() {
  try {
    revalidatePath("/");
    revalidatePath("/actualites");
    revalidatePath("/actualites/[slug]", "page");
  } catch {}
}

/** Modification administrative ou paiement : on rafraîchit tout le site public. */
export function refreshAllPublic() {
  try {
    revalidatePath("/", "layout");
  } catch {}
}
