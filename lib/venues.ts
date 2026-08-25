// Recherche de salles de spectacle à proximité d'une ville, via des services gratuits :
// Nominatim pour géocoder la ville (nom -> coordonnées), Overpass pour interroger
// OpenStreetMap et trouver les théâtres / centres culturels / salles de concert alentour.
// Aucune clé API ni facturation nécessaire. Les résultats dépendent de la richesse des
// données OpenStreetMap locales (généralement bonnes en ville, plus inégales en zone rurale).

type Coordinates = { lat: number; lon: number };

export type NearbyVenue = {
  id: string;
  name: string;
  type: string;
  address: string | null;
  distanceKm: number;
  lat: number;
  lon: number;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "AlloArtiste/1.0 (https://alloartiste.be)";

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a: Coordinates, b: Coordinates) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Convertit "Bruxelles" + "Belgique" en coordonnées GPS. Mis en cache 24h : la ville
// d'un artiste change rarement, inutile de re-géocoder à chaque visite de la page.
export async function geocodeCity(city: string, country: string): Promise<Coordinates | null> {
  if (!city.trim()) return null;
  const query = `${city}, ${country}`;
  const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 }
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;
    const lat = parseFloat(results[0].lat);
    const lon = parseFloat(results[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
}

const TYPE_LABELS: Record<string, string> = {
  theatre: "Théâtre",
  arts_centre: "Centre culturel",
  concert_hall: "Salle de concert",
  music_venue: "Salle de spectacle"
};

// Cherche les salles de spectacle dans un rayon donné (par défaut 30 km) autour d'un point.
export async function findNearbyVenues(origin: Coordinates, radiusKm = 30): Promise<NearbyVenue[]> {
  const radiusM = Math.round(radiusKm * 1000);
  const amenities = Object.keys(TYPE_LABELS);
  const clauses = amenities
    .map(
      (a) =>
        `node["amenity"="${a}"](around:${radiusM},${origin.lat},${origin.lon});way["amenity"="${a}"](around:${radiusM},${origin.lat},${origin.lon});`
    )
    .join("");
  const query = `[out:json][timeout:20];(${clauses});out center tags;`;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain", "User-Agent": USER_AGENT },
      body: query,
      next: { revalidate: 60 * 60 * 24 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const elements: any[] = Array.isArray(data.elements) ? data.elements : [];

    const venues: NearbyVenue[] = [];
    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name;
      if (!name) continue; // lieux sans nom : pas exploitables pour l'artiste

      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null) continue;

      const streetPart = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
      const address = [streetPart, tags["addr:city"]].filter(Boolean).join(", ") || null;

      venues.push({
        id: `${el.type}/${el.id}`,
        name,
        type: TYPE_LABELS[tags.amenity] || "Salle de spectacle",
        address,
        distanceKm: Math.round(haversineKm(origin, { lat, lon }) * 10) / 10,
        lat,
        lon
      });
    }

    // Dédoublonnage : OSM référence parfois le même lieu en node ET en way.
    const seen = new Set<string>();
    const unique = venues.filter((v) => {
      const key = v.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 25);
  } catch {
    return [];
  }
}
