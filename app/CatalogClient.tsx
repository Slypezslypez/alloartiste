"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, COUNTRIES, isNewArrival } from "@/lib/categories";
import { SPECIALTY_TREE } from "@/lib/specialtyTree";

type ArtistCard = {
  id: string;
  name: string;
  category: string;
  city: string;
  country: string;
  photos: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  createdAt: string; // ISO
  specialty: string | null;
  nextEvent: { title: string; date: string } | null;
};

type SortOption = "newest" | "alpha" | "rating";

export function CatalogClient({ artists }: { artists: ArtistCard[] }) {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("Tous");
  const [city, setCity] = useState("Toutes");
  const [category, setCategory] = useState("Tous");
  const [specialty, setSpecialty] = useState("Toutes");
  const [sort, setSort] = useState<SortOption>("newest");
  const specialtyOptions = category === "Tous" ? [] : SPECIALTY_TREE[category] || [];

  // Synchronise avec le sélecteur de pays du menu (en haut du site) : lecture au chargement + écoute des changements en direct.
  useEffect(() => {
    function applyCountry(value: string | null) {
      if (value === "Belgique" || value === "France" || value === "Tous") {
        setCountry(value);
        setCity("Toutes");
      }
    }
    const params = new URLSearchParams(window.location.search);
    applyCountry(params.get("country") || window.localStorage.getItem("alloartiste_country"));

    function onCountryChanged(e: Event) {
      applyCountry((e as CustomEvent<string>).detail);
    }
    window.addEventListener("alloartiste:country-changed", onCountryChanged);
    return () => window.removeEventListener("alloartiste:country-changed", onCountryChanged);
  }, []);

  const allCategories = useMemo(() => {
    const custom = new Set(artists.map((a) => a.category).filter((c) => !CATEGORIES.includes(c as any)));
    return [...CATEGORIES, ...Array.from(custom).sort()];
  }, [artists]);

  const cities = useMemo(() => {
    const relevant = country === "Tous" ? artists : artists.filter((a) => (a.country || "Belgique") === country);
    const set = new Set(relevant.map((a) => a.city).filter(Boolean));
    return ["Toutes", ...Array.from(set).sort()];
  }, [artists, country]);

  const filtered = useMemo(() => {
    return artists
      .filter((a) => {
        const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
        const matchesCountry = country === "Tous" || (a.country || "Belgique") === country;
        const matchesCity = city === "Toutes" || a.city === city;
        const matchesCategory = category === "Tous" || a.category === category;
        const matchesSpecialty = specialty === "Toutes" || a.specialty === specialty;
        return matchesSearch && matchesCountry && matchesCity && matchesCategory && matchesSpecialty;
      })
      .sort((a, b) => {
        if (sort === "alpha") return a.name.localeCompare(b.name, "fr");
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [artists, search, country, city, category, specialty, sort]);

  function resetFilters() {
    setSearch("");
    // Le pays revient à celui choisi dans le menu du site (Belgique, France, ou Belgique et France),
    // pour rester cohérent avec ce qui est affiché en haut de page après un clic sur "Réinitialiser".
    const saved = window.localStorage.getItem("alloartiste_country");
    setCountry(saved === "France" || saved === "Tous" ? saved : "Belgique");
    setCity("Toutes");
    setCategory("Tous");
    setSpecialty("Toutes");
    setSort("newest");
  }

  function changeCountry(value: string) {
    setCountry(value);
    setCity("Toutes");
  }

  function changeCategory(value: string) {
    setCategory(value);
    setSpecialty("Toutes");
  }

  const hasActiveFilters = search || country !== "Tous" || city !== "Toutes" || category !== "Tous" || specialty !== "Toutes";

  return (
    <div id="catalogue">
      <h2 className="section-title">L&apos;annuaire</h2>

      <div className="search-panel">
        <div className="search-row">
          <input
            type="search"
            placeholder="Rechercher un nom d'artiste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            autoComplete="off"
            name="artist-search-query"
          />
          <select value={country} onChange={(e) => changeCountry(e.target.value)} className="search-select">
            <option value="Tous">Tous les pays</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={category} onChange={(e) => changeCategory(e.target.value)} className="search-select">
            <option value="Tous">Toutes les catégories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {specialtyOptions.length > 0 && (
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="search-select">
              <option value="Toutes">Toutes les spécialités</option>
              {specialtyOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
          <select value={city} onChange={(e) => setCity(e.target.value)} className="search-select">
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === "Toutes" ? "Toutes les villes" : c}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="search-select">
            <option value="newest">Plus récents</option>
            <option value="alpha">Ordre alphabétique</option>
            <option value="rating">Mieux notés</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="reset-link" onClick={resetFilters}>
            ↺ Réinitialiser les filtres
          </button>
        )}
      </div>

      <p className="result-count">
        <strong>{filtered.length}</strong> profil{filtered.length > 1 ? "s" : ""} correspondant{filtered.length > 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Aucun artiste trouvé.</p>
          <p>Essayez d&apos;élargir votre recherche ou réinitialisez les filtres.</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((a) => {
            const isNew = isNewArrival(a.createdAt);
            return (
              <Link key={a.id} className="ticket" href={`/profil/${a.id}`}>
                <div className="photo-wrap">
                  {isNew && <span className="badge badge-new">Nouveau</span>}
                  {a.nextEvent && (
                    <span className="badge badge-event mono">
                      {new Date(a.nextEvent.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {a.nextEvent.title}
                    </span>
                  )}
                  <img className="photo" src={a.photos[0] || placeholder()} alt={`Photo de ${a.name}`} />
                </div>
                <div className="perf" />
                <div className="stub">
                  <p className="name">
                    {a.name}
                    {a.isVerified && (
                      <span className="verified-check" title="Profil vérifié">
                        ✓
                      </span>
                    )}
                  </p>
                  <span className="cat mono">{a.category}</span>
                  {a.specialty && <span className="cat mono cat-specialty">{a.specialty}</span>}
                  <div className="ticket-meta">
                    <span className="mono">
                      {a.city || "Belgique"}
                      {a.country && a.country !== "Belgique" ? `, ${a.country}` : ""}
                    </span>
                    {a.reviewsCount > 0 && (
                      <span className="rating">
                        ★ {a.rating.toFixed(1)} <span className="dim">({a.reviewsCount})</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function placeholder() {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="375"><rect width="100%" height="100%" fill="%23e5e7eb"/></svg>`)
  );
}
