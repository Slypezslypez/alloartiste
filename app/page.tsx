import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible, CATALOG_OPEN } from "@/lib/categories";
import { getSiteSettings } from "@/lib/settings";
import { CatalogClient } from "./CatalogClient";
import { PromoCarousel } from "./PromoCarousel";

// Régénérée automatiquement toutes les 60 secondes (au lieu d'interroger la base à chaque visite) :
// un artiste dont l'abonnement expire peut rester visible jusqu'à 60s de plus, ce qui est acceptable
// vu le gain de rapidité pour tous les visiteurs.
export const revalidate = 60;

export default async function HomePage() {
  const [all, settings, upcomingEvents] = await Promise.all([
    prisma.artist.findMany({ orderBy: { createdAt: "desc" } }),
    getSiteSettings(),
    // On ne récupère que l'artistId : la vignette ne montre plus qu'un bouton "Mes événements",
    // le détail (image, lieu, heure, réservation) est affiché sur la fiche publique.
    prisma.event.findMany({ where: { date: { gte: new Date() } }, select: { artistId: true }, distinct: ["artistId"] })
  ]);

  const artistsWithUpcomingEvent = new Set(upcomingEvents.map((ev) => ev.artistId));

  const visibleRaw = all.filter(isSubscriptionVisible);
  const visible = visibleRaw.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category,
    city: a.city,
    country: a.country,
    photos: a.photos,
    videos: a.videos,
    priceMin: a.priceMin,
    priceMax: a.priceMax,
    rating: a.rating,
    reviewsCount: a.reviewsCount,
    isVerified: a.isVerified,
    createdAt: a.createdAt.toISOString(),
    specialties: a.specialties,
    hasUpcomingEvent: artistsWithUpcomingEvent.has(a.id)
  }));

  // Photos mises en avant : sélection manuelle depuis l'admin si définie, sinon automatique.
  const withPhotos = visible.filter((a) => a.photos.length > 0);
  const manualPicks = [settings.spotlightArtistId1, settings.spotlightArtistId2]
    .filter((id): id is string => !!id)
    .map((id) => withPhotos.find((a) => a.id === id))
    .filter((a): a is (typeof withPhotos)[number] => !!a);
  const spotlight = manualPicks.length > 0 ? [...manualPicks, ...withPhotos.filter((a) => !manualPicks.includes(a))].slice(0, 4) : withPhotos.slice(0, 4);

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
              {CATALOG_OPEN && (
                <a className="btn btn-outline" href="#catalogue">
                  Découvrir les artistes
                </a>
              )}
            </div>

            <div className="stats-row-hero">
              {CATALOG_OPEN && (
                <div>
                  <span className="stat-num">{visible.length}+</span>
                  <span className="stat-cap mono">Artistes belges</span>
                </div>
              )}
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

          <PromoCarousel spotlight={CATALOG_OPEN ? spotlight : []} promoImages={settings.promoImages} />
        </div>
      </section>

      {CATALOG_OPEN ? (
        <CatalogClient artists={visible} />
      ) : (
        <section className="panel" style={{ maxWidth: 720, margin: "40px auto", textAlign: "center" }}>
          <h2>Soyez les premiers !</h2>
          <p className="sub">
            L&apos;annuaire ouvre bientôt au public. Les premiers artistes s&apos;inscrivent en ce moment : créez votre profil dès
            maintenant et profitez de 3 mois gratuits, puis 39 € par an, sans commission.
          </p>
          <div className="ctas" style={{ justifyContent: "center", marginTop: 18 }}>
            <Link className="btn btn-gold" href="/inscription">
              Je m&apos;inscris
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
