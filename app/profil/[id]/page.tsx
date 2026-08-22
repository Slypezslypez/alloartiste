import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";
import { ContactForm } from "./ContactForm";
import { VideoEmbed } from "./VideoEmbed";

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

      <div className="profile-title-row">
        <h1>
          {artist.name}
          {artist.isVerified && (
            <span className="verified-check" title="Profil vérifié" style={{ fontSize: 28 }}>
              ✓
            </span>
          )}
        </h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="cat mono">{artist.category}</span>
          {artist.city && <span className="mono" style={{ color: "var(--muted)", fontSize: 13 }}>📍 {artist.city}</span>}
          {artist.reviewsCount > 0 && (
            <span className="rating">
              ★ {artist.rating.toFixed(1)} <span className="dim">({artist.reviewsCount} avis)</span>
            </span>
          )}
        </div>
      </div>

      <div className="profile-hero">
        <img className="main" src={artist.photos[0] || undefined} alt={`Photo principale de ${artist.name}`} />

        <div className="bio-panel">
          <span className="bio-quote">❝</span>
          <p className="bio-label mono">À propos</p>
          <p className="bio-text">{artist.bio || "Cet·te artiste n'a pas encore ajouté de description."}</p>
        </div>
      </div>

      <div className="profile-actions-row">
        {(artist.website || artist.facebook || artist.instagram || artist.phone) && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13 }}>
            {artist.phone && <span className="mono" style={{ color: "var(--muted)" }}>📞 {artist.phone}</span>}
            {artist.website && (
              <a href={formatUrl(artist.website)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>
                🔗 Site web
              </a>
            )}
            {artist.facebook && (
              <a href={formatUrl(artist.facebook)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>
                Facebook
              </a>
            )}
            {artist.instagram && (
              <a href={formatUrl(artist.instagram)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)" }}>
                Instagram
              </a>
            )}
          </div>
        )}

        <ContactForm artistId={artist.id} artistName={artist.name} />
      </div>

      {artist.photos.length > 0 && (
        <>
          <h2 className="section-title">Photos</h2>
          <div className="gallery">
            {artist.photos.map((p) => (
              <img key={p} src={p} alt={`Photo de ${artist.name}`} />
            ))}
          </div>
        </>
      )}

      {artist.videos.length > 0 && (
        <>
          <h2 className="section-title">Vidéos</h2>
          <div className="videos">
            {artist.videos.map((v) => (
              <VideoEmbed key={v} url={v} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function formatUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}
