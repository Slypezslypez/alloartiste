import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";
import { ContactForm } from "./ContactForm";
import { ProfileGallery } from "./ProfileGallery";
import { ScrollToHash } from "./ScrollToHash";

export const dynamic = "force-dynamic";

// Mise en cache par requête : évite d'interroger la base deux fois (une pour les métadonnées SEO,
// une pour l'affichage de la page) pour un même chargement.
const getArtist = cache(async (id: string) => prisma.artist.findUnique({ where: { id } }));

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const artist = await getArtist(params.id);
  if (!artist || !isSubscriptionVisible(artist)) {
    return { title: "Profil introuvable — AlloArtiste" };
  }

  const location = artist.city ? `${artist.city}${artist.country && artist.country !== "Belgique" ? `, ${artist.country}` : ""}` : "";
  const description = (
    artist.tagline ||
    artist.bio ||
    `${artist.name}, ${artist.category}${location ? ` à ${location}` : ""}. Contactez directement cet·te artiste sur AlloArtiste.`
  ).slice(0, 160);

  return {
    title: `${artist.name} — ${artist.category}${location ? ` à ${location}` : ""} | AlloArtiste`,
    description,
    openGraph: {
      title: artist.name,
      description,
      images: artist.photos[0] ? [artist.photos[0]] : undefined
    }
  };
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const artist = await getArtist(params.id);
  if (!artist || !isSubscriptionVisible(artist)) notFound();

  // Comptabilise la vue (non bloquant pour l'affichage).
  prisma.artist.update({ where: { id: artist.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const todayMidnightUTC = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
  const unavailableDates = artist.calendarVisible
    ? await prisma.unavailableDate.findMany({
        where: { artistId: artist.id, date: { gte: todayMidnightUTC } },
        orderBy: { date: "asc" }
      })
    : [];
  const unavailableDateStrings = unavailableDates.map((d) => d.date.toISOString().slice(0, 10));

  // Nettoyage au passage : les événements déjà passés sont supprimés, pas besoin de tâche
  // planifiée pour garder la table légère.
  await prisma.event.deleteMany({ where: { artistId: artist.id, date: { lt: new Date() } } });
  const events = await prisma.event.findMany({ where: { artistId: artist.id }, orderBy: { date: "asc" } });

  const filledStars = Math.round(artist.rating);

  return (
    <>
      <ScrollToHash />
      <Link className="backlink" href="/">
        ← Retour au catalogue
      </Link>

      <div className="profile-two-col">
        <ProfileGallery photos={artist.photos} artistName={artist.name} isVerified={artist.isVerified} videos={artist.videos} />

        <div className="profile-right-col">
          <div className="profile-info-card">
            <div className="profile-top-row">
              <span className="cat mono">{artist.category}</span>
              {artist.specialties.map((s) => (
                <span key={s} className="cat mono cat-specialty">
                  {s}
                </span>
              ))}
              {artist.city && (
                <span className="mono profile-city">
                  📍 {artist.city}
                  {artist.country && artist.country !== "Belgique" ? `, ${artist.country}` : ""}
                </span>
              )}
            </div>

            <h1 className="profile-name">{artist.name}</h1>

            {artist.reviewsCount > 0 && (
              <div className="profile-rating-badge">
                <span className="profile-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={n <= filledStars ? "star-filled" : "star-empty"}>
                      ★
                    </span>
                  ))}
                </span>
                <span>{artist.rating.toFixed(1)}</span>
                <span className="dim">{artist.reviewsCount} avis</span>
              </div>
            )}

            {(artist.priceMin != null || artist.priceMax != null) && (
              <p className="profile-price mono">
                {artist.priceMin != null && artist.priceMax != null
                  ? artist.priceMin === artist.priceMax
                    ? `${artist.priceMin} €`
                    : `${artist.priceMin} € - ${artist.priceMax} €`
                  : artist.priceMin != null
                  ? `à partir de ${artist.priceMin} €`
                  : `jusqu'à ${artist.priceMax} €`}
              </p>
            )}

            {artist.tagline && <p className="profile-tagline">&ldquo;{artist.tagline}&rdquo;</p>}

            {events.length > 0 && (
              <>
                <p className="profile-section-label mono" id="evenements">
                  Prochains événements
                </p>
                <div className="profile-events-list">
                  {events.map((ev) => (
                    <div key={ev.id} className="profile-event-item">
                      {ev.imageUrl && (
                        <img src={ev.imageUrl} alt={ev.title} className="profile-event-image" />
                      )}
                      <div className="profile-event-body">
                        <span className="profile-event-date mono">
                          {new Date(ev.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          {" · "}
                          {new Date(ev.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <strong>{ev.title}</strong>
                        {ev.location && <p className="profile-event-location">📍 {ev.location}</p>}
                        {ev.description && <p>{ev.description}</p>}
                        {ev.bookingLink && (
                          <a href={ev.bookingLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline profile-event-book-btn">
                            Réserver / infos
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="profile-section-label mono">Biographie & démarche</p>
            <p className="profile-bio-text">{artist.bio || "Cet·te artiste n'a pas encore ajouté de description."}</p>

            {artist.services.length > 0 && (
              <>
                <p className="profile-section-label mono">Formules & prestations</p>
                <div className="profile-services-row">
                  {artist.services.map((s) => (
                    <span key={s} className="profile-service-pill">
                      <span className="service-check">✓</span> {s}
                    </span>
                  ))}
                </div>
              </>
            )}

            {(artist.website || artist.facebook || artist.instagram || artist.phone) && (
              <>
                <p className="profile-section-label mono">Liens directs</p>
                <div className="profile-links-row">
                  {artist.phone && <span className="profile-link-pill mono">📞 {artist.phone}</span>}
                  {artist.website && (
                    <a href={formatUrl(artist.website)} target="_blank" rel="noopener noreferrer" className="profile-link-pill">
                      🔗 Site web
                    </a>
                  )}
                  {artist.facebook && (
                    <a href={formatUrl(artist.facebook)} target="_blank" rel="noopener noreferrer" className="profile-link-pill">
                      Facebook
                    </a>
                  )}
                  {artist.instagram && (
                    <a href={formatUrl(artist.instagram)} target="_blank" rel="noopener noreferrer" className="profile-link-pill">
                      Instagram
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          <div id="contact">
            <ContactForm
              artistId={artist.id}
              artistName={artist.name}
              unavailableDates={unavailableDateStrings}
              calendarVisible={artist.calendarVisible}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function formatUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}
