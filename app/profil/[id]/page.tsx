import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";
import { ContactForm } from "./ContactForm";
import { ProfileGallery } from "./ProfileGallery";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const artist = await prisma.artist.findUnique({ where: { id: params.id } });
  if (!artist || !isSubscriptionVisible(artist)) notFound();

  // Comptabilise la vue (non bloquant pour l'affichage).
  prisma.artist.update({ where: { id: artist.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const filledStars = Math.round(artist.rating);

  return (
    <>
      <Link className="backlink" href="/">
        ← Retour au catalogue
      </Link>

      <div className="profile-two-col">
        <ProfileGallery photos={artist.photos} artistName={artist.name} isVerified={artist.isVerified} videos={artist.videos} />

        <div className="profile-right-col">
          <div className="profile-info-card">
            <div className="profile-top-row">
              <span className="cat mono">{artist.category}</span>
              {artist.city && <span className="mono profile-city">📍 {artist.city}</span>}
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

            {artist.tagline && <p className="profile-tagline">&ldquo;{artist.tagline}&rdquo;</p>}

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

          <ContactForm artistId={artist.id} artistName={artist.name} />
        </div>
      </div>
    </>
  );
}

function formatUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}
