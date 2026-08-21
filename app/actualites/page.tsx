import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

export default function ActualitesPage() {
  return (
    <>
      <div className="panel">
        <div className="eyebrow mono">Professions & métiers de la scène</div>
        <h2>Conseils, Guides & Actualités</h2>
        <p className="sub">Des ressources pratiques pour les artistes et les organisateurs d&apos;événements en Belgique.</p>
      </div>

      <div className="blog-grid">
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={`/actualites/${a.slug}`} className="blog-card">
            <div className="blog-cover" style={{ background: a.gradient }}>
              <span className="blog-icon">{a.icon}</span>
              <span className="blog-cat-badge mono">{a.category}</span>
            </div>
            <div className="blog-card-body">
              <div className="blog-byline mono">
                L&apos;équipe La Coulisse · {a.date}
              </div>
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
              <div className="blog-footer">
                <span className="blog-meta mono">{a.readTime} de lecture</span>
                <span className="blog-read-link">Lire l&apos;article →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
