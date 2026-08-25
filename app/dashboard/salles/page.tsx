import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentArtist } from "@/lib/auth";
import { geocodeCity, findNearbyVenues } from "@/lib/venues";

export const dynamic = "force-dynamic";

export default async function SallesPage() {
  const artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");

  const coords = artist.city ? await geocodeCity(artist.city, artist.country) : null;
  const venues = coords ? await findNearbyVenues(coords, 30) : [];

  return (
    <>
      <Link className="backlink" href="/dashboard">
        ← Retour à mon espace
      </Link>
      <h2 className="section-title">Salles à proximité</h2>
      <p className="sub" style={{ marginTop: -8, marginBottom: 24 }}>
        {artist.city
          ? `Théâtres, salles de concert et centres culturels dans un rayon de 30 km autour de ${artist.city}.`
          : "Renseignez votre ville depuis votre profil pour voir les salles à proximité."}
      </p>

      {artist.city && !coords && (
        <p className="hint">
          Impossible de localiser « {artist.city} » pour le moment. Vérifiez l&apos;orthographe de votre ville dans
          votre profil, ou réessayez un peu plus tard.
        </p>
      )}

      {coords && venues.length === 0 && (
        <p className="hint">Aucune salle référencée dans les données OpenStreetMap autour de {artist.city} pour l&apos;instant.</p>
      )}

      {venues.length > 0 && (
        <div className="lead-list">
          {venues.map((v) => (
            <div key={v.id} className="lead-card">
              <div className="lead-header">
                <div>
                  <strong>{v.name}</strong>{" "}
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                    {v.type}
                  </span>
                  {v.address && <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>{v.address}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="admin-tag tag-active">{v.distanceKm} km</span>
                  <a
                    className="btn btn-outline"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    href={`https://www.openstreetmap.org/?mlat=${v.lat}&mlon=${v.lon}#map=16/${v.lat}/${v.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir sur la carte
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
