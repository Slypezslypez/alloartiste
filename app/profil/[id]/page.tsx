import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";
import { ContactForm } from "./ContactForm";
import { VideoEmbed } from "./VideoEmbed";
import { ProfileGallery } from "./ProfileGallery";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const artist = await prisma.artist.findUnique({ where: { id: params.id } });
  if (!artist || !isSubscriptionVisible(artist)) notFound();

  // Comptabilise la vue (non bloquant pour l'affichage).
  prisma.artist.update({ where: { id: artist.id }, data: { views: { increment: 1 } } }).catch(() => {});

  return (
    <>
      <Link className="backlink" href="/">
        ← Retour au catalogue
      </Link>

      <div className="profile-two-col">
        <ProfileGallery photos={artist.photos} artistName={artist.name} isVerified={artist.isVerified} />

        <div className="profile-right-col">
          <div className="profile-top-row">
            <span className="cat mono">{artist.category}</span>
            {artist.city && <span className="mono profile-city">📍 {artist.city}</span>}
          </div>

          <h1 className="profile-name">{artist.name}</h1>

          {artist.reviewsCount > 0 && (
            <div className="profile-rating-badge">
              <span>★ {artist.rating.toFixed(1)}</span>
              <span className="dim">{artist.reviewsCount} avis</span>
            </div>
          )}

          <p className="profile-section-label mono">Biographie</p>
          <p className="profile-bio-text">{artist.bio || "Cet·te artiste n'a pas encore ajouté de description."}</p>

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

          {artist.videos.length > 0 && (
            <>
              <p className="profile-section-label mono">Vidéos & extraits ({artist.videos.length})</p>
              <div className="videos" style={{ marginBottom: 24 }}>
                {artist.videos.map((v) => (
                  <VideoEmbed key={v} url={v} />
                ))}
              </div>
            </>
          )}

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
