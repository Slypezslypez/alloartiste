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
