import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";
import { CatalogClient } from "./CatalogClient";

export const dynamic = "force-dynamic"; // toujours à jour (abonnements qui expirent, nouveaux artistes)

export default async function HomePage() {
  const all = await prisma.artist.findMany({ orderBy: { createdAt: "desc" } });
  const visible = all.filter(isSubscriptionVisible).map((a) => ({
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

  return (
    <>
      <section className="marquee">
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
            Créer mon profil
          </Link>
          <a className="btn btn-outline" href="#catalogue">
            Voir les artistes
          </a>
        </div>
      </section>

      <CatalogClient artists={visible} />
    </>
  );
}
