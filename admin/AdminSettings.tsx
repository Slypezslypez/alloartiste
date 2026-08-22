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
  headerBackgroundUrl: string | null;
  headerBackgroundPositionX: number;
  headerBackgroundPositionY: number;
};

type ArtistOption = { id: string; name: string };

export function AdminSettings({ initialSettings, artistOptions }: { initialSettings: Settings; artistOptions: ArtistOption[] }) {
  const [form, setForm] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingHeaderBg, setUploadingHeaderBg] = useState(false);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadHeaderBackground(file: File) {
    setUploadingHeaderBg(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const presign = await fetch("/api/admin/settings/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileExt: ext, contentType: file.type })
      }).then((r) => r.json());
      if (presign.error) throw new Error(presign.error);

      await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      set("headerBackgroundUrl", presign.publicUrl);
    } catch {
      alert("L'envoi de l'image a échoué.");
    } finally {
      setUploadingHeaderBg(false);
    }
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

        <label>Image de fond de la barre de menu (optionnelle)</label>
        {form.headerBackgroundUrl ? (
          <div style={{ marginBottom: 10 }}>
            <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
              Cliquez sur l&apos;image pour choisir la partie à toujours garder visible dans la barre de menu.
            </p>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                setForm((f) => ({
                  ...f,
                  headerBackgroundPositionX: Math.max(0, Math.min(100, x)),
                  headerBackgroundPositionY: Math.max(0, Math.min(100, y))
                }));
              }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 500,
                aspectRatio: "16/4",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid var(--line)",
                cursor: "crosshair"
              }}
            >
              <img
                src={form.headerBackgroundUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: `${form.headerBackgroundPositionX}% ${form.headerBackgroundPositionY}%`,
                  display: "block"
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${form.headerBackgroundPositionX}%`,
                  top: `${form.headerBackgroundPositionY}%`,
                  width: 16,
                  height: 16,
                  marginLeft: -8,
                  marginTop: -8,
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  background: "var(--gold)",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.3)"
                }}
              />
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: "6px 12px", fontSize: 12, marginTop: 8 }}
              onClick={() => set("headerBackgroundUrl", null)}
            >
              Retirer l&apos;image
            </button>
          </div>
        ) : (
          <>
            <input type="file" accept="image/*" disabled={uploadingHeaderBg} onChange={(e) => e.target.files?.[0] && uploadHeaderBackground(e.target.files[0])} />
            <p className="hint">{uploadingHeaderBg ? "Envoi en cours..." : "Format large recommandé (ex. 1600×300px) pour un rendu net."}</p>
          </>
        )}
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
