"use client";

import { useState } from "react";

type Settings = {
  siteName: string;
  logoPart1: string;
  logoPart2: string;
  tagline: string;
  heroLine1: string;
  heroEmphasis: string;
  heroLine2: string;
  heroSubtitle: string;
  statCommissionValue: string;
  statCommissionLabel: string;
  statDirectValue: string;
  statDirectLabel: string;
  spotlightArtistId1: string | null;
  spotlightArtistId2: string | null;
  contactReceiverEmail: string | null;
};

type ArtistOption = { id: string; name: string };

export function AdminSettings({ initialSettings, artistOptions }: { initialSettings: Settings; artistOptions: ArtistOption[] }) {
  const [form, setForm] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setSaving(false);
    setMessage(res.ok ? "Réglages enregistrés." : "Échec de l'enregistrement.");
  }

  return (
    <form onSubmit={save}>
      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Identité du site</h2>
        <div className="field-row">
          <div>
            <label>Nom du site (utilisé dans les emails, titres...)</label>
            <input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} required />
          </div>
        </div>
        <div className="field-row">
          <div>
            <label>Logo — 1ère partie</label>
            <input value={form.logoPart1} onChange={(e) => set("logoPart1", e.target.value)} required />
          </div>
          <div>
            <label>Logo — 2ème partie (dorée)</label>
            <input value={form.logoPart2} onChange={(e) => set("logoPart2", e.target.value)} required />
          </div>
        </div>
        <label>Bandeau tout en haut du site</label>
        <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} required />
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Titre de la page d&apos;accueil</h2>
        <div className="field-row">
          <div>
            <label>Ligne 1</label>
            <input value={form.heroLine1} onChange={(e) => set("heroLine1", e.target.value)} required />
          </div>
          <div>
            <label>Ligne 2 (en doré)</label>
            <input value={form.heroEmphasis} onChange={(e) => set("heroEmphasis", e.target.value)} required />
          </div>
          <div>
            <label>Ligne 3</label>
            <input value={form.heroLine2} onChange={(e) => set("heroLine2", e.target.value)} required />
          </div>
        </div>
        <label>Texte de présentation</label>
        <textarea value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} required style={{ minHeight: 90 }} />
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Statistiques affichées</h2>
        <p className="sub">Le nombre d&apos;artistes est calculé automatiquement. Les deux suivantes sont libres.</p>
        <div className="field-row">
          <div>
            <label>Valeur (ex. 0%)</label>
            <input value={form.statCommissionValue} onChange={(e) => set("statCommissionValue", e.target.value)} required />
          </div>
          <div>
            <label>Légende</label>
            <input value={form.statCommissionLabel} onChange={(e) => set("statCommissionLabel", e.target.value)} required />
          </div>
        </div>
        <div className="field-row">
          <div>
            <label>Valeur (ex. Direct)</label>
            <input value={form.statDirectValue} onChange={(e) => set("statDirectValue", e.target.value)} required />
          </div>
          <div>
            <label>Légende</label>
            <input value={form.statDirectLabel} onChange={(e) => set("statDirectLabel", e.target.value)} required />
          </div>
        </div>
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Photos mises en avant sur l&apos;accueil</h2>
        <p className="sub">Choisissez précisément quels artistes apparaître, ou laissez sur « Automatique » pour afficher les plus récents.</p>
        <div className="field-row">
          <div>
            <label>1ère photo</label>
            <select value={form.spotlightArtistId1 || ""} onChange={(e) => set("spotlightArtistId1", e.target.value || null)}>
              <option value="">Automatique</option>
              {artistOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>2ème photo</label>
            <select value={form.spotlightArtistId2 || ""} onChange={(e) => set("spotlightArtistId2", e.target.value || null)}>
              <option value="">Automatique</option>
              {artistOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Contact</h2>
        <label>Email qui reçoit les messages du formulaire de contact général</label>
        <input
          type="email"
          value={form.contactReceiverEmail || ""}
          onChange={(e) => set("contactReceiverEmail", e.target.value || null)}
          placeholder="contact@alloartiste.be"
        />
        <p className="hint">Si laissé vide, utilise la valeur définie dans les variables d&apos;environnement du serveur.</p>
      </div>

      {message && <p className={message.includes("Échec") ? "error" : "success"} style={{ marginLeft: 0 }}>{message}</p>}

      <div style={{ marginTop: 4 }}>
        <button type="submit" className="btn btn-gold" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer les réglages"}
        </button>
      </div>
    </form>
  );
}
