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

  return (
    <>
      <Link className="backlink" href="/">
        ← Retour au catalogue
      </Link>

      <div className="profile-hero">
        <img className="main" src={artist.photos[0] || undefined} alt={`Photo principale de ${artist.name}`} />
        <div className="profile-info">
          <h1>{artist.name}</h1>
          <span className="cat mono">{artist.category}</span>
          <p className="bio">{artist.bio || "Cet·te artiste n'a pas encore ajouté de description."}</p>
          <ContactForm artistId={artist.id} artistName={artist.name} />
        </div>
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
