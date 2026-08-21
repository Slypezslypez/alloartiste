import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, ARTICLES } from "@/lib/articles";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <>
      <Link className="backlink" href="/actualites">
        ← Retour aux actualités
      </Link>

      <div className="blog-cover blog-cover-large" style={{ background: article.gradient }}>
        <span className="blog-icon blog-icon-large">{article.icon}</span>
      </div>

      <div className="panel" style={{ marginTop: -60, position: "relative", zIndex: 2 }}>
        <span className="blog-cat-badge mono" style={{ position: "static", marginBottom: 14, display: "inline-block" }}>
          {article.category}
        </span>
        <h2 style={{ fontSize: 32 }}>{article.title}</h2>
        <p className="sub" style={{ marginBottom: 6 }}>
          L&apos;équipe La Coulisse · {article.date} · {article.readTime} de lecture
        </p>

        <div className="article-body">
          {article.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </>
  );
}
