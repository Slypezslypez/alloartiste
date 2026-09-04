"use client";

import { useState } from "react";
import { compressImage } from "@/lib/imageCompress";

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
  promoImages: string[];
  sponsorLogos: { imageUrl: string; name: string | null; linkUrl: string | null; enabled: boolean }[];
  sponsorsBarEnabled: boolean;
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

const MAX_PROMO_IMAGES = 10;
const MAX_SPONSOR_LOGOS = 20;

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
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [uploadingSponsor, setUploadingSponsor] = useState(false);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadSiteImage(rawFile: File, onDone: (url: string) => void, setUploading: (v: boolean) => void) {
    setUploading(true);
    try {
      const file = await compressImage(rawFile);
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

  function addPromoImage(file: File) {
    uploadSiteImage(file, (url) => set("promoImages", [...form.promoImages, url]), setUploadingPromo);
  }

  function removePromoImage(index: number) {
    set(
      "promoImages",
      form.promoImages.filter((_, i) => i !== index)
    );
  }

  function movePromoImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.promoImages.length) return;
    const next = [...form.promoImages];
    [next[index], next[target]] = [next[target], next[index]];
    set("promoImages", next);
  }

  function addSponsorLogo(file: File) {
    uploadSiteImage(
      file,
      (url) => set("sponsorLogos", [...form.sponsorLogos, { imageUrl: url, name: "", linkUrl: "", enabled: true }]),
      setUploadingSponsor
    );
  }

  function toggleSponsorEnabled(index: number, checked: boolean) {
    const next = form.sponsorLogos.map((s, i) => (i === index ? { ...s, enabled: checked } : s));
    set("sponsorLogos", next);
  }

  function removeSponsorLogo(index: number) {
    set(
      "sponsorLogos",
      form.sponsorLogos.filter((_, i) => i !== index)
    );
  }

  function updateSponsorLogo(index: number, field: "name" | "linkUrl", value: string) {
    const next = form.sponsorLogos.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    set("sponsorLogos", next);
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
        <h2 style={{ fontSize: 24 }}>Carrousel promotionnel de l&apos;accueil</h2>
        <p className="sub">
          Ce cadre défile automatiquement : le premier cadre est la sélection ci-dessus (photos mises en avant), puis chaque
          image ajoutée ici arrive à son tour depuis la droite, pendant 5 secondes, jusqu&apos;à {MAX_PROMO_IMAGES} images maximum.
        </p>

        {form.promoImages.length === 0 && (
          <p className="hint" style={{ marginTop: 0 }}>Aucune image ajoutée pour l&apos;instant — le carrousel affichera uniquement le premier cadre.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {form.promoImages.map((url, i) => (
            <div key={url + i} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--shell)", borderRadius: 10, padding: 10 }}>
              <img src={url} alt="" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
              <span className="hint" style={{ margin: 0, flex: 1 }}>Image {i + 1}</span>
              <button type="button" className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => movePromoImage(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "5px 10px", fontSize: 12 }}
                onClick={() => movePromoImage(i, 1)}
                disabled={i === form.promoImages.length - 1}
              >
                ↓
              </button>
              <button type="button" className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12, color: "var(--red)" }} onClick={() => removePromoImage(i)}>
                Retirer
              </button>
            </div>
          ))}
        </div>

        {form.promoImages.length < MAX_PROMO_IMAGES ? (
          <>
            <input type="file" accept="image/*" disabled={uploadingPromo} onChange={(e) => e.target.files?.[0] && addPromoImage(e.target.files[0])} />
            <p className="hint">
              {uploadingPromo ? "Envoi en cours..." : `Format large recommandé (ex. 1200×1200px). ${form.promoImages.length}/${MAX_PROMO_IMAGES} images.`}
            </p>
          </>
        ) : (
          <p className="hint">Limite de {MAX_PROMO_IMAGES} images atteinte. Retirez-en une pour en ajouter une nouvelle.</p>
        )}
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Bandeau sponsors (au-dessus du carrousel)</h2>
        <p className="sub">
          Logos qui défilent en continu tout en haut de la page d&apos;accueil, juste au-dessus du carrousel. Sans lien, un
          logo n&apos;est pas cliquable ; avec un lien, il ouvre le site du sponsor dans un nouvel onglet.
        </p>

        <label className="calendar-visibility-toggle">
          <input
            type="checkbox"
            checked={form.sponsorsBarEnabled}
            onChange={(e) => set("sponsorsBarEnabled", e.target.checked)}
          />
          <span>
            Activer le bandeau sponsors sur le site (interrupteur général : le décocher masque tout le bandeau,
            même si des sponsors sont activés individuellement ci-dessous)
          </span>
        </label>

        {form.sponsorLogos.length === 0 && (
          <p className="hint" style={{ marginTop: 0 }}>Aucun sponsor ajouté pour l&apos;instant — le bandeau restera masqué.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {form.sponsorLogos.map((s, i) => (
            <div key={s.imageUrl + i} style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--shell)", borderRadius: 10, padding: 10, opacity: s.enabled ? 1 : 0.55 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <img src={s.imageUrl} alt="" style={{ width: 64, height: 40, objectFit: "contain", borderRadius: 6, border: "1px solid var(--line)", background: "#fff" }} />
                <input
                  value={s.name || ""}
                  onChange={(e) => updateSponsorLogo(i, "name", e.target.value)}
                  placeholder="Nom du sponsor (optionnel)"
                  style={{ flex: "1 1 160px" }}
                />
                <input
                  type="url"
                  value={s.linkUrl || ""}
                  onChange={(e) => updateSponsorLogo(i, "linkUrl", e.target.value)}
                  placeholder="https://... (optionnel, sinon non cliquable)"
                  style={{ flex: "1 1 220px" }}
                />
                <button type="button" className="btn btn-outline" style={{ padding: "5px 10px", fontSize: 12, color: "var(--red)" }} onClick={() => removeSponsorLogo(i)}>
                  Retirer
                </button>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)", cursor: "pointer" }}>
                <input type="checkbox" checked={s.enabled} onChange={(e) => toggleSponsorEnabled(i, e.target.checked)} style={{ width: "auto" }} />
                {s.enabled ? "Affiché sur le site" : "Masqué (conservé, non affiché)"}
              </label>
            </div>
          ))}
        </div>

        {form.sponsorLogos.length < MAX_SPONSOR_LOGOS ? (
          <>
            <input type="file" accept="image/*" disabled={uploadingSponsor} onChange={(e) => e.target.files?.[0] && addSponsorLogo(e.target.files[0])} />
            <p className="hint">
              {uploadingSponsor
                ? "Envoi en cours..."
                : `Logo de préférence sur fond transparent (PNG). ${form.sponsorLogos.length}/${MAX_SPONSOR_LOGOS} logos.`}
            </p>
          </>
        ) : (
          <p className="hint">Limite de {MAX_SPONSOR_LOGOS} logos atteinte. Retirez-en un pour en ajouter un nouveau.</p>
        )}
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
        <button type="submit" className="btn btn-gold" disabled={saving} data-loading={saving}>
          {saving ? "Enregistrement..." : "Enregistrer les réglages"}
        </button>
      </div>
    </form>
  );
}
