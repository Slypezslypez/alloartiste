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
  howArtistsImageUrl: string | null;
  howArtistsImagePositionX: number;
  howArtistsImagePositionY: number;
  howOrganizersImageUrl: string | null;
  howOrganizersImagePositionX: number;
  howOrganizersImagePositionY: number;
};

type ArtistOption = { id: string; name: string };

/** Petit sélecteur d'image avec point focal cliquable, réutilisé pour plusieurs champs. */
function FocalImagePicker({
  url,
  posX,
  posY,
  uploading,
  hint,
  onUpload,
  onRemove,
  onFocalChange
}: {
  url: string | null;
  posX: number;
  posY: number;
  uploading: boolean;
  hint: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onFocalChange: (x: number, y: number) => void;
}) {
  return url ? (
    <div style={{ marginBottom: 10 }}>
      <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
        Cliquez sur l&apos;image pour choisir la partie à toujours garder visible.
      </p>
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
          const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
          onFocalChange(Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
        }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          aspectRatio: "4/3",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--line)",
          cursor: "crosshair"
        }}
      >
        <img
          src={url}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${posX}% ${posY}%`,
            display: "block"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${posX}%`,
            top: `${posY}%`,
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
      <button type="button" className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12, marginTop: 8 }} onClick={onRemove}>
        Retirer l&apos;image
      </button>
    </div>
  ) : (
    <>
      <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
      <p className="hint">{uploading ? "Envoi en cours..." : hint}</p>
    </>
  );
}

export function AdminSettings({ initialSettings, artistOptions }: { initialSettings: Settings; artistOptions: ArtistOption[] }) {
  const [form, setForm] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingHeaderBg, setUploadingHeaderBg] = useState(false);
  const [uploadingHowArtists, setUploadingHowArtists] = useState(false);
  const [uploadingHowOrganizers, setUploadingHowOrganizers] = useState(false);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadSiteImage(file: File, onDone: (url: string) => void, setUploading: (v: boolean) => void) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const presign = await fetch("/api/admin/settings/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileExt: ext, contentType: file.type })
      }).then((r) => r.json());
      if (presign.error) throw new Error(presign.error);

      await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      onDone(presign.publicUrl);
    } catch {
      alert("L'envoi de l'image a échoué.");
    } finally {
      setUploading(false);
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
        <FocalImagePicker
          url={form.headerBackgroundUrl}
          posX={form.headerBackgroundPositionX}
          posY={form.headerBackgroundPositionY}
          uploading={uploadingHeaderBg}
          hint="Format large recommandé (ex. 1600×300px) pour un rendu net."
          onUpload={(file) => uploadSiteImage(file, (url) => set("headerBackgroundUrl", url), setUploadingHeaderBg)}
          onRemove={() => set("headerBackgroundUrl", null)}
          onFocalChange={(x, y) => {
            set("headerBackgroundPositionX", x);
            set("headerBackgroundPositionY", y);
          }}
        />
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
        <h2 style={{ fontSize: 24 }}>Page « Comment ça marche »</h2>
        <p className="sub">Illustrations optionnelles affichées à côté de chaque parcours. Laissez vide pour ne rien afficher.</p>

        <label>Image du parcours « Pour les artistes »</label>
        <FocalImagePicker
          url={form.howArtistsImageUrl}
          posX={form.howArtistsImagePositionX}
          posY={form.howArtistsImagePositionY}
          uploading={uploadingHowArtists}
          hint="Format 4:3 recommandé (ex. 800×600px)."
          onUpload={(file) => uploadSiteImage(file, (url) => set("howArtistsImageUrl", url), setUploadingHowArtists)}
          onRemove={() => set("howArtistsImageUrl", null)}
          onFocalChange={(x, y) => {
            set("howArtistsImagePositionX", x);
            set("howArtistsImagePositionY", y);
          }}
        />

        <label style={{ marginTop: 26 }}>Image du parcours « Pour les organisateurs »</label>
        <FocalImagePicker
          url={form.howOrganizersImageUrl}
          posX={form.howOrganizersImagePositionX}
          posY={form.howOrganizersImagePositionY}
          uploading={uploadingHowOrganizers}
          hint="Format 4:3 recommandé (ex. 800×600px)."
          onUpload={(file) => uploadSiteImage(file, (url) => set("howOrganizersImageUrl", url), setUploadingHowOrganizers)}
          onRemove={() => set("howOrganizersImageUrl", null)}
          onFocalChange={(x, y) => {
            set("howOrganizersImagePositionX", x);
            set("howOrganizersImagePositionY", y);
          }}
        />
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
