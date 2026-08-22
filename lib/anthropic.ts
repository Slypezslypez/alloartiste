type ArticleDraft = {
  title: string;
  excerpt: string;
  category: string;
  icon: string;
  readTime: string;
  body: string;
};

function buildPrompt(topic: string) {
  return `Tu écris pour "AlloArtiste", une plateforme belge qui met en relation des artistes (musiciens, danseurs, comédiens, DJs, plasticiens...) avec des organisateurs d'événements.

Rédige un article de conseils pratiques en français sur le sujet suivant : "${topic}".

Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ni après, au format exact :
{
  "title": "titre accrocheur, moins de 90 caractères",
  "excerpt": "résumé en 1 à 2 phrases, moins de 200 caractères",
  "category": "courte catégorie, ex. Conseils carrière ou Conseils organisateurs",
  "icon": "un seul emoji pertinent",
  "readTime": "estimation du type '4 min'",
  "body": "le corps de l'article en 4 à 6 paragraphes séparés par une ligne vide entre chaque. Ton pratique et concret, phrases courtes, pas de titres de section, pas de listes à puces markdown (des numéros inline type '1. ...' sont acceptés si pertinent)."
}`;
}

export async function generateArticleDraft(topic: string): Promise<ArticleDraft> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("La clé ANTHROPIC_API_KEY n'est pas configurée.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1800,
      messages: [{ role: "user", content: buildPrompt(topic) }]
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur de l'API Claude (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = (data.content || []).map((block: any) => block.text || "").join("");
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Réponse de l'IA illisible, réessayez.");
  }
}

export async function generateBioDraft(input: { name: string; category: string; city: string; notes: string }): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("La clé ANTHROPIC_API_KEY n'est pas configurée.");
  }

  const prompt = `Tu écris pour AlloArtiste, une plateforme belge qui met en relation des artistes avec des organisateurs d'événements.

Un·e artiste souhaite une bio professionnelle pour son profil public. Voici ses informations :
- Nom / nom de scène : ${input.name}
- Catégorie : ${input.category}
- Ville : ${input.city || "non précisée"}
- Notes libres décrites par l'artiste : "${input.notes}"

Rédige une bio en français, à la troisième personne, entre 50 et 90 mots (impératif : moins de 550 caractères au total), chaleureuse et professionnelle, qui donne envie de réserver cet·te artiste. Pas de titre, pas de guillemets, juste le texte de la bio directement.

Réponds UNIQUEMENT avec le texte de la bio, sans aucun autre texte avant ou après.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur de l'API Claude (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = (data.content || []).map((block: any) => block.text || "").join("");
  return rawText.trim();
}

export async function generateServicesSuggestions(input: { category: string; bio: string }): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("La clé ANTHROPIC_API_KEY n'est pas configurée.");
  }

  const prompt = `Un·e artiste de catégorie "${input.category}" sur AlloArtiste (plateforme belge de mise en relation avec des organisateurs d'événements) a la bio suivante :
"${input.bio || "non renseignée"}"

Suggère entre 3 et 5 "formules & prestations" courtes et concrètes que cet·te artiste pourrait proposer (ex. type d'événements, formats de prestation). Chaque formule doit faire 2 à 4 mots maximum, en français.

Réponds UNIQUEMENT avec un tableau JSON de chaînes de caractères, sans aucun autre texte, au format exact :
["Formule 1", "Formule 2", "Formule 3"]`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur de l'API Claude (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = (data.content || []).map((block: any) => block.text || "").join("");
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string").slice(0, 5);
    return [];
  } catch {
    throw new Error("Réponse de l'IA illisible, réessayez.");
  }
}
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("La clé ANTHROPIC_API_KEY n'est pas configurée.");
  }

  const prompt = `Un·e artiste s'inscrit sur AlloArtiste, une plateforme belge de mise en relation entre artistes et organisateurs d'événements. Il/elle a tapé la spécialité suivante pour sa catégorie de profil : "${raw}"

Corrige et nettoie ce texte pour en faire un nom de catégorie professionnel et court en français : corrige les fautes d'orthographe, mets une majuscule au début, reste concis (2 à 4 mots maximum), et garde le sens exact voulu par l'artiste sans l'inventer ni le changer.

Réponds UNIQUEMENT avec le nom de catégorie corrigé, sans aucun autre texte, sans guillemets, sans point final.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 60,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur de l'API Claude (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = (data.content || []).map((block: any) => block.text || "").join("");
  return rawText.trim().replace(/^["']|["']$/g, "").slice(0, 60);
}
