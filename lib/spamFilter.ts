// Filtre anti-spam pour le formulaire de contact général (sans compte, accessible à tous).
// Les robots sont ignorés silencieusement (on répond "ok" sans rien enregistrer) pour qu'ils ne
// cherchent pas à contourner le filtre ; les messages contenant un lien sont refusés avec une
// explication, car un vrai visiteur doit pouvoir comprendre pourquoi.

export type SpamVerdict = "ok" | "bot" | "link";

const DISPOSABLE_TLDS = [".my.id", ".xyz", ".top", ".click", ".online", ".site", ".icu", ".buzz"];
const DISPOSABLE_DOMAINS = ["probox", "mailinator", "guerrillamail", "tempmail", "10minutemail", "yopmail", "sharklasers", "trashmail"];

const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|online|site|xyz|top|click|info|biz|io|co|me|ly|link|app)\/)/i;

function looksRandom(word: string): boolean {
  // Longue chaîne sans espace avec alternance anormale majuscules/minuscules (ex. « ihBFAGpRTYrAJOdh »).
  if (word.length < 12) return false;
  if (/\s/.test(word)) return false;
  let switches = 0;
  for (let i = 1; i < word.length; i++) {
    const a = word[i - 1];
    const b = word[i];
    const aUp = a !== a.toLowerCase();
    const bUp = b !== b.toLowerCase();
    if (/[a-zA-Z]/.test(a) && /[a-zA-Z]/.test(b) && aUp !== bUp) switches++;
  }
  return switches >= 5;
}

export function checkContactSpam(input: {
  name: string;
  email: string;
  message: string;
  honeypot?: string | null;
  elapsedMs?: number | null;
}): SpamVerdict {
  // 1. Champ piège rempli (invisible pour un humain) ou formulaire envoyé en moins de 3 secondes.
  if (input.honeypot && input.honeypot.trim() !== "") return "bot";
  if (typeof input.elapsedMs === "number" && input.elapsedMs < 3000) return "bot";

  // 2. Nom généré au hasard.
  if (looksRandom(input.name.trim())) return "bot";

  // 3. Message sans espace (chaîne aléatoire) ou aléatoire.
  const msg = input.message.trim();
  if (looksRandom(msg)) return "bot";

  // 4. Adresse e-mail suspecte : Gmail avec beaucoup de points, domaine jetable.
  const [local = "", domain = ""] = input.email.toLowerCase().split("@");
  const dots = (local.match(/\./g) || []).length;
  if ((domain === "gmail.com" || domain === "googlemail.com") && dots >= 4) return "bot";
  if (DISPOSABLE_DOMAINS.some((d) => domain.includes(d))) return "bot";
  if (DISPOSABLE_TLDS.some((t) => domain.endsWith(t))) return "bot";

  // 5. Lien dans le message : refusé (démarchage, phishing).
  if (LINK_RE.test(msg)) return "link";

  return "ok";
}
