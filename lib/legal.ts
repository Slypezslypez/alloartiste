// Informations légales de l'exploitant du site, affichées sur les pages "Mentions légales",
// "Conditions Générales d'Utilisation" et "Politique de confidentialité".
//
// À COMPLÉTER quand la structure juridique qui exploite le site est connue (ex. la société de Lisa :
// dénomination, adresse, numéro d'entreprise BCE, numéro de TVA, email de contact).
// Tant qu'un champ reste vide ("") il n'est simplement pas affiché sur le site.
// Aucune autre modification de code n'est nécessaire : il suffit de remplir ces lignes.
export const LEGAL = {
  operatorName: "", // ex. "Lisa Pezzuto SRL" (dénomination ou nom de l'exploitant)
  legalForm: "", // ex. "Société à responsabilité limitée" (laisser vide si indépendant)
  address: "", // adresse du siège ou du domicile professionnel
  enterpriseNumber: "", // numéro d'entreprise (BCE), ex. "0123.456.789"
  vatNumber: "", // numéro de TVA, ex. "BE 0123.456.789"
  contactEmail: "" // adresse email de contact et pour les demandes RGPD
};

/** Date de dernière mise à jour des textes légaux. À modifier à chaque vraie modification des conditions. */
export const LEGAL_LAST_UPDATE = "23 octobre 2026";

/** Vrai si l'exploitant est suffisamment identifié pour être affiché. */
export function hasOperatorIdentity() {
  return LEGAL.operatorName.trim().length > 0;
}
