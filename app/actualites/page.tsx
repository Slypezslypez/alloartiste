import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ActualitesPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <div className="panel">
        <div className="eyebrow mono">Professions & métiers de la scène</div>
        <h2>Conseils, Guides & Actualités</h2>
        <p className="sub">Des ressources pratiques pour les artistes et les organisateurs d&apos;événements en Belgique.</p>
      </div>

      {articles.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Aucun article publié pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {articles.map((a) => (
            <Link key={a.id} href={`/actualites/${a.slug}`} className="blog-card">
              <div className="blog-cover" style={a.imageUrl ? {} : { background: a.gradient }}>
                {a.imageUrl ? (
                  <img src={a.imageUrl} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span className="blog-icon">{a.icon}</span>
                )}
                <span className="blog-cat-badge mono">{a.category}</span>
              </div>
              <div className="blog-card-body">
                <div className="blog-byline mono">
                  L&apos;équipe AlloArtiste · {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
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
      )}
    </>
  );
}
