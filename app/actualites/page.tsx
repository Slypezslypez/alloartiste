const ARTICLES = [
  {
    slug: "reussir-sa-fiche-artiste",
    title: "5 conseils pour une fiche artiste qui donne envie de réserver",
    excerpt:
      "Vos photos, votre bio, vos vidéos : chaque détail compte pour convaincre un organisateur en quelques secondes. Voici ce qui fait vraiment la différence.",
    category: "Conseils artistes",
    readTime: "4 min"
  },
  {
    slug: "bien-briefer-un-artiste",
    title: "Organisateurs : comment bien briefer un artiste avant l'événement",
    excerpt:
      "Lieu, horaires, matériel technique, public attendu... un bon brief évite 90% des malentendus le jour J.",
    category: "Conseils organisateurs",
    readTime: "5 min"
  },
  {
    slug: "tarifer-sa-prestation",
    title: "Comment fixer le prix de sa prestation artistique",
    excerpt:
      "Entre le temps de préparation, le déplacement et le matériel, voici une méthode simple pour arriver à un tarif juste.",
    category: "Conseils artistes",
    readTime: "6 min"
  },
  {
    slug: "checklist-avant-evenement",
    title: "La checklist à cocher avant chaque événement",
    excerpt: "Contrat, acompte, plan d'accès, contact sur place... la liste qui évite le stress de dernière minute.",
    category: "Conseils organisateurs",
    readTime: "3 min"
  }
];

export default function ActualitesPage() {
  return (
    <>
      <div className="panel">
        <h2>Actualités & Conseils</h2>
        <p className="sub">Des ressources pratiques pour les artistes et les organisateurs d&apos;événements en Belgique.</p>
      </div>

      <div className="blog-grid">
        {ARTICLES.map((a) => (
          <article key={a.slug} className="blog-card">
            <span className="cat mono">{a.category}</span>
            <h3>{a.title}</h3>
            <p>{a.excerpt}</p>
            <span className="blog-meta mono">{a.readTime} de lecture</span>
          </article>
        ))}
      </div>
    </>
  );
}
