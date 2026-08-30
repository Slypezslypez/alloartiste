import type { SponsorLogo } from "@/lib/sponsors";

// Bandeau discret ("invisible" : pas de fond ni de cadre visible) de logos sponsors qui
// défilent en continu. N'affiche rien si la liste est vide. Masqué sur mobile (voir CSS) :
// demandé explicitement, ce bandeau n'a de sens que sur un écran assez large.
export function SponsorsBar({ sponsors }: { sponsors: SponsorLogo[] }) {
  if (sponsors.length === 0) return null;

  // La piste est dupliquée une fois pour permettre une boucle de défilement continue
  // (translation de 0 à -50%) sans saut visible au raccord.
  const track = [...sponsors, ...sponsors];

  return (
    <div className="sponsors-bar" aria-label="Nos sponsors">
      <div className="sponsors-track-wrap">
        <div className="sponsors-track">
          {track.map((s, i) =>
            s.linkUrl ? (
              <a key={i} href={s.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="sponsor-logo-link" title={s.name || undefined}>
                <img src={s.imageUrl} alt={s.name || "Sponsor"} className="sponsor-img" />
              </a>
            ) : (
              <span key={i} className="sponsor-logo-item" title={s.name || undefined}>
                <img src={s.imageUrl} alt={s.name || "Sponsor"} className="sponsor-img" />
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
