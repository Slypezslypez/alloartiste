import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, isSubscriptionVisible } from "@/lib/categories";

export const dynamic = "force-dynamic"; // toujours à jour (abonnements qui expirent, nouveaux artistes)

export default async function HomePage({ searchParams }: { searchParams: { categorie?: string } }) {
  const all = await prisma.artist.findMany({ orderBy: { createdAt: "desc" } });
  const visible = all.filter(isSubscriptionVisible);

  const activeCategory = searchParams.categorie || "Tous";
  const filtered = activeCategory === "Tous" ? visible : visible.filter((a) => a.category === activeCategory);

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
            Créer mon profil — 33€/an
          </Link>
          <a className="btn btn-outline" href="#catalogue">
            Voir les artistes
          </a>
        </div>
      </section>

      <div id="catalogue">
        <h2 className="section-title">Le catalogue</h2>
        <div className="filters">
          <Link className={`chip ${activeCategory === "Tous" ? "active" : ""}`} href="/">
            Tous
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c} className={`chip ${activeCategory === c ? "active" : ""}`} href={`/?categorie=${encodeURIComponent(c)}`}>
              {c}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <p style={{ fontFamily: "Bebas Neue", fontSize: 30 }}>La scène est vide, pour l&apos;instant.</p>
            <p>Soyez le·la premier·ère artiste à rejoindre le catalogue.</p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((a) => (
              <Link key={a.id} className="ticket" href={`/profil/${a.id}`}>
                <img className="photo" src={a.photos[0] || placeholder()} alt={`Photo de ${a.name}`} />
                <div className="perf" />
                <div className="stub">
                  <p className="name">{a.name}</p>
                  <span className="cat mono">{a.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function placeholder() {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="375"><rect width="100%" height="100%" fill="%23170a15"/></svg>`)
  );
}
