import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article || !article.published) notFound();

  const paragraphs = article.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <Link className="backlink" href="/actualites">
        ← Retour aux actualités
      </Link>

      <div className="article-layout">
        <div className="article-image-col">
          <div className="article-cover-side" style={article.imageUrl ? {} : { background: article.gradient }}>
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${article.imagePositionX}% ${article.imagePositionY}%` }}
              />
            ) : (
              <span className="blog-icon blog-icon-large">{article.icon}</span>
            )}
          </div>
        </div>

        <div className="article-content-col">
          <span className="blog-cat-badge mono" style={{ position: "static", marginBottom: 14, display: "inline-block" }}>
            {article.category}
          </span>
          <h2 style={{ fontSize: 32, marginTop: 0 }}>{article.title}</h2>
          <p className="sub" style={{ marginBottom: 6 }}>
            L&apos;équipe AlloArtiste ·{" "}
            {new Date(article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
            {article.readTime} de lecture
          </p>

          <div className="article-body">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
