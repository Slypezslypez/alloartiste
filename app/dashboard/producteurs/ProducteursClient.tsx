"use client";

import { useState } from "react";

type P = {
  id: string;
  name: string;
  company: string | null;
  genres: string | null;
  city: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
};

// Catégories (filtres) déduites des mots-clés de la fiche : société + styles + notes.
const CATEGORIES: { key: string; label: string; match: RegExp }[] = [
  { key: "label", label: "Producteur musical / Label", match: /label|producteur|production musicale|maison de disques/i },
  { key: "event", label: "Organisateur d'événements", match: /organisateur|événementiel|evenementiel/i },
  { key: "festival", label: "Festivals", match: /festival/i },
  { key: "salle", label: "Salles & centres culturels", match: /salle|centre culturel|cabaret/i },
  { key: "theatre", label: "Théâtre & humour", match: /th[ée][âa]tre|humour|stand-up|impro|caf[ée]s?-th/i },
  { key: "danse", label: "Danse, cirque & arts de la rue", match: /danse|cirque|arts de la rue|magie|spectacle vivant/i },
  { key: "booking", label: "Agence / Booking", match: /booking|management|agence|manager|tourn[ée]es/i }
];

function textOf(p: P) {
  return [p.name, p.company, p.genres, p.notes].filter(Boolean).join(" ");
}

export function ProducteursClient({ initial }: { initial: P[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const term = q.trim().toLowerCase();
  const catDef = CATEGORIES.find((c) => c.key === cat);
  const list = initial.filter(
    (p) =>
      (!catDef || catDef.match.test(textOf(p))) &&
      (!term || [p.name, p.company, p.genres, p.city, p.country].filter(Boolean).join(" ").toLowerCase().includes(term))
  );
  const count = (c: (typeof CATEGORIES)[number]) => initial.filter((p) => c.match.test(textOf(p))).length;

  return (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher (nom, style, ville…)"
        style={{ width: "100%", maxWidth: 420, padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(128,128,128,.4)", background: "transparent", color: "inherit", marginBottom: 20 }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>
          Tous ({initial.length})
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.key} className={`chip ${cat === c.key ? "active" : ""}`} onClick={() => setCat(c.key)}>
            {c.label} ({count(c)})
          </button>
        ))}
      </div>
      {list.length === 0 && <p className="hint">Aucun producteur trouvé.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {list.map((p) => {
          const site = p.website ? (p.website.startsWith("http") ? p.website : `https://${p.website}`) : null;
          return (
            <div key={p.id} className="card" style={{ padding: 18 }}>
              <strong>{p.name}</strong>
              {p.company && <div style={{ opacity: 0.8 }}>{p.company}</div>}
              {p.genres && <div style={{ fontSize: 13, marginTop: 6 }}>{p.genres}</div>}
              {(p.city || p.country) && <div style={{ fontSize: 13, opacity: 0.8 }}>{[p.city, p.country].filter(Boolean).join(", ")}</div>}
              {p.notes && <p style={{ fontSize: 13, marginTop: 8 }}>{p.notes}</p>}
              <div style={{ fontSize: 13, marginTop: 8, display: "grid", gap: 2 }}>
                {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
                {p.phone && <a href={`tel:${p.phone}`}>{p.phone}</a>}
                {site && (
                  <a href={site} target="_blank" rel="noopener noreferrer">
                    {p.website}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
