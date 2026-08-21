import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible, CATEGORIES } from "@/lib/categories";
import { CatalogClient } from "./CatalogClient";

export const dynamic = "force-dynamic"; // toujours à jour (abonnements qui expirent, nouveaux artistes)

const CATEGORY_ICONS: Record<string, string> = {
  "Musicien·ne": "🎸",
  "Chanteur·se": "🎤",
  "Danseur·se": "💃",
  "Comédien·ne": "🎭",
  DJ: "🎧",
  Humoriste: "😂",
  "Peintre / Plasticien·ne": "🎨",
  Photographe: "📷",
  Autre: "✨"
};

export default async function HomePage() {
  const all = await prisma.artist.findMany({ orderBy: { createdAt: "desc" } });
  const visibleRaw = all.filter(isSubscriptionVisible);
  const visible = visibleRaw.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category,
    city: a.city,
    photos: a.photos,
    rating: a.rating,
    reviewsCount: a.reviewsCount,
    isVerified: a.isVerified,
    createdAt: a.createdAt.toISOString()
  }));

  const spotlight = visible.filter((a) => a.photos.length > 0).slice(0, 2);

  return (
    <>
      <section className="marquee">
        <div className="marquee-grid">
          <div>
            <div className="eyebrow mono">Annuaire d&apos;artistes pour producteurs & organisateurs</div>
            <h1>
              TROUVEZ <em>L&apos;ARTISTE</em>
              <br />
              QU&apos;IL VOUS FAUT
            </h1>
            <p>
              Musiciens, danseurs, comédiens, DJs, plasticiens... chaque profil présente jusqu&apos;à 5 photos et 5
              vidéos pour se montrer sous son meilleur jour. Contactez directement l&apos;artiste pour un devis.
            </p>
            <div className="ctas">
              <Link className="btn btn-gold" href="/inscription">
                Je m&apos;inscris
              </Link>
              <a className="btn btn-outline" href="#catalogue">
                Découvrir les artistes
              </a>
            </div>

            <div className="stats-row-hero">
              <div>
                <span className="stat-num">{visible.length}+</span>
                <span className="stat-cap mono">Artistes belges</span>
              </div>
              <div>
                <span className="stat-num">0%</span>
                <span className="stat-cap mono">Commission</span>
              </div>
              <div>
                <span className="stat-num">Direct</span>
                <span className="stat-cap mono">Organisateur → Artiste</span>
              </div>
            </div>
          </div>

          {spotlight.length > 0 && (
            <div className="marquee-photos">
              {spotlight.map((a) => (
                <Link key={a.id} href={`/profil/${a.id}`} className="spotlight-card">
                  <img src={a.photos[0]} alt={a.name} />
                  <div className="spotlight-overlay">
                    <span className="spotlight-cat mono">{a.category}</span>
                    <span className="spotlight-name">{a.name}</span>
                    <span className="spotlight-city mono">
                      {a.city || "Belgique"}
                      {a.reviewsCount > 0 ? ` · ★ ${a.rating.toFixed(1)}` : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="quick-disciplines">
        <p className="quick-title mono">Rechercher par discipline</p>
        <div className="quick-pills">
          {CATEGORIES.map((c) => (
            <a key={c} href="#catalogue" className="quick-pill">
              <span>{CATEGORY_ICONS[c] || "✨"}</span> {c}
            </a>
          ))}
        </div>
      </div>

      <CatalogClient artists={visible} />
    </>
  );
}
