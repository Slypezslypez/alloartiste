import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible, CATEGORIES } from "@/lib/categories";
import { getSiteSettings } from "@/lib/settings";
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
  const [all, settings] = await Promise.all([
    prisma.artist.findMany({ orderBy: { createdAt: "desc" } }),
    getSiteSettings()
  ]);

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

  // Photos mises en avant : sélection manuelle depuis l'admin si définie, sinon automatique.
  const withPhotos = visible.filter((a) => a.photos.length > 0);
  const manualPicks = [settings.spotlightArtistId1, settings.spotlightArtistId2]
    .filter((id): id is string => !!id)
    .map((id) => withPhotos.find((a) => a.id === id))
    .filter((a): a is (typeof withPhotos)[number] => !!a);
  const spotlight = manualPicks.length > 0 ? [...manualPicks, ...withPhotos.filter((a) => !manualPicks.includes(a))].slice(0, 4) : withPhotos.slice(0, 4);

  // Pills "Rechercher par discipline" : catégories de base + celles créées par les artistes.
  const customCategories = Array.from(new Set(visible.map((a) => a.category).filter((c) => !CATEGORIES.includes(c as any)))).sort();
  const quickCategories = [...CATEGORIES.filter((c) => c !== "Autre"), ...customCategories];

  return (
    <>
      <section className="marquee">
        <div className="marquee-grid">
          <div>
            <div className="eyebrow mono">Annuaire d&apos;artistes pour producteurs & organisateurs</div>
            <h1>
              {settings.heroLine1} <em>{settings.heroEmphasis}</em>
              <br />
              {settings.heroLine2}
            </h1>
            <p>{settings.heroSubtitle}</p>
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
                <span className="stat-num">{settings.statCommissionValue}</span>
                <span className="stat-cap mono">{settings.statCommissionLabel}</span>
              </div>
              <div>
                <span className="stat-num">{settings.statDirectValue}</span>
                <span className="stat-cap mono">{settings.statDirectLabel}</span>
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
          {quickCategories.map((c) => (
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
