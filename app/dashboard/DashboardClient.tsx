"use client";

import { useState } from "react";
import { CATEGORIES, BELGIAN_CITIES, MAX_PHOTOS, MAX_VIDEOS, isSubscriptionVisible } from "@/lib/categories";

type Artist = {
  id: string;
  name: string;
  email: string;
  category: string;
  city: string;
  bio: string;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  photos: string[];
  videos: string[];
  views: number;
  rating: number;
  reviewsCount: number;
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
};

type Lead = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  eventDate: string | null;
  message: string;
  status: "new" | "replied" | "archived";
  createdAt: string;
};

export function DashboardClient({ initialArtist, initialLeads }: { initialArtist: Artist; initialLeads: Lead[] }) {
  const [artist, setArtist] = useState(initialArtist);
  const [leads, setLeads] = useState(initialLeads);
  const active = isSubscriptionVisible({
    subscriptionStatus: artist.subscriptionStatus,
    currentPeriodEnd: artist.currentPeriodEnd ? new Date(artist.currentPeriodEnd) : null
  });

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const isKnownCategory = CATEGORIES.includes(initialArtist.category as any);
  const [category, setCategory] = useState<string>(isKnownCategory ? initialArtist.category : "Autre");
  const [customCategory, setCustomCategory] = useState(isKnownCategory ? "" : initialArtist.category);
  const isCustomCategory = category === "Autre";
  const [bioValue, setBioValue] = useState(initialArtist.bio);
  const [bioNotes, setBioNotes] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [subLoading, setSubLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  async function startSubscription() {
    if (!termsAccepted) return;
    setSubLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted: true })
    });
    const body = await res.json();
    setSubLoading(false);
    if (body.url) window.location.href = body.url;
  }

  async function openPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const body = await res.json();
    if (body.url) window.location.href = body.url;
  }

  async function generateBio() {
    if (!bioNotes.trim()) return;
    setGeneratingBio(true);
    setBioError(null);
    try {
      const res = await fetch("/api/artists/me/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: bioNotes.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la génération.");
      setBioValue((data.bio || "").slice(0, 600));
    } catch (err: any) {
      setBioError(err.message || "Échec de la génération.");
    } finally {
      setGeneratingBio(false);
    }
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    let finalCategory = category;
    if (isCustomCategory && customCategory.trim()) {
      try {
        const res = await fetch("/api/categories/normalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raw: customCategory.trim() })
        });
        const data = await res.json();
        finalCategory = res.ok && data.category ? data.category : customCategory.trim();
      } catch {
        finalCategory = customCategory.trim();
      }
    }

    const res = await fetch("/api/artists/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        category: finalCategory,
        city: fd.get("city"),
        bio: bioValue,
        phone: fd.get("phone") || null,
        website: fd.get("website") || null,
        facebook: fd.get("facebook") || null,
        instagram: fd.get("instagram") || null
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setArtist((a) => ({ ...a, ...updated }));
      setProfileMsg("Profil mis à jour.");
    } else {
      setProfileMsg("Erreur lors de l'enregistrement.");
    }
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const presign = await fetch("/api/artists/me/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileExt: ext, contentType: file.type })
      }).then((r) => r.json());

      if (presign.error) throw new Error(presign.error);

      await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });

      const confirm = await fetch("/api/artists/me/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl: presign.publicUrl })
      }).then((r) => r.json());

      setArtist((a) => ({ ...a, photos: confirm.photos }));
    } catch (err) {
      alert("L'envoi de la photo a échoué.");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(url: string) {
    const res = await fetch("/api/artists/me/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    }).then((r) => r.json());
    setArtist((a) => ({ ...a, photos: res.photos }));
  }

  async function addVideo() {
    if (!videoUrl.trim()) return;
    const res = await fetch("/api/artists/me/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: videoUrl.trim() })
    }).then((r) => r.json());
    if (res.videos) {
      setArtist((a) => ({ ...a, videos: res.videos }));
      setVideoUrl("");
    } else {
      alert(res.error || "Lien invalide.");
    }
  }

  async function removeVideo(url: string) {
    const res = await fetch("/api/artists/me/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    }).then((r) => r.json());
    setArtist((a) => ({ ...a, videos: res.videos }));
  }

  async function updateLeadStatus(id: string, status: Lead["status"]) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  }

  return (
    <>
      <h2 className="section-title">Mon espace — {artist.name}</h2>

      <div className={`sub-badge ${active ? "active" : "inactive"}`}>
        {active
          ? `● Abonnement actif — visible jusqu'au ${new Date(artist.currentPeriodEnd as string).toLocaleDateString("fr-FR")} (renouvellement auto)`
          : "● Profil non visible — abonnement inactif"}
      </div>

      {!active ? (
        <div className="panel wide">
          <h2 style={{ fontSize: 24 }}>Activer l&apos;abonnement</h2>
          <p className="sub">Abonnement annuel, renouvelable automatiquement via Stripe. Requis pour apparaître dans le catalogue public.</p>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ width: "auto", marginTop: 3 }}
            />
            <span style={{ textTransform: "none", fontFamily: "inherit", fontWeight: 400, color: "var(--ink-soft)", fontSize: 14 }}>
              J&apos;ai lu et j&apos;accepte les{" "}
              <a href="/conditions" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                Conditions Générales d&apos;Utilisation
              </a>
              , notamment la clause de non-responsabilité concernant le fonctionnement du site et les relations avec
              les organisateurs, producteurs ou agents.
            </span>
          </label>
          <button className="btn btn-gold" onClick={startSubscription} disabled={subLoading || !termsAccepted}>
            {subLoading ? "Redirection..." : "S'abonner"}
          </button>
        </div>
      ) : (
        <div className="panel wide">
          <h2 style={{ fontSize: 22 }}>Gestion de l&apos;abonnement</h2>
          <p className="sub">
            Renouvellement automatique le {new Date(artist.currentPeriodEnd as string).toLocaleDateString("fr-FR")}.
          </p>
          <button className="btn btn-outline" onClick={openPortal}>
            Gérer / annuler mon abonnement
          </button>
        </div>
      )}

      {/* Statistiques */}
      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Statistiques</h2>
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-value">{artist.views}</span>
            <span className="stat-label">Vues du profil</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{leads.length}</span>
            <span className="stat-label">Demandes reçues</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{artist.reviewsCount > 0 ? artist.rating.toFixed(1) : "—"}</span>
            <span className="stat-label">Note moyenne{artist.reviewsCount > 0 ? ` (${artist.reviewsCount})` : ""}</span>
          </div>
        </div>
      </div>

      {/* Demandes de contact */}
      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>
          Demandes de contact {newLeadsCount > 0 && <span className="lead-count-badge">{newLeadsCount} nouvelle{newLeadsCount > 1 ? "s" : ""}</span>}
        </h2>
        {leads.length === 0 ? (
          <p className="hint">Aucune demande reçue pour le moment.</p>
        ) : (
          <div className="lead-list">
            {leads.map((lead) => (
              <div key={lead.id} className={`lead-card lead-${lead.status}`}>
                <div className="lead-header">
                  <div>
                    <strong>{lead.senderName}</strong>{" "}
                    <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                      {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <select value={lead.status} onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead["status"])} className="lead-status-select">
                    <option value="new">Nouveau</option>
                    <option value="replied">Traité</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
                <p className="lead-message">{lead.message}</p>
                <div className="lead-contact">
                  <a href={`mailto:${lead.senderEmail}`}>{lead.senderEmail}</a>
                  {lead.senderPhone && <span> · {lead.senderPhone}</span>}
                  {lead.eventDate && <span> · Événement : {lead.eventDate}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Mon profil</h2>
        <form onSubmit={saveProfile}>
          <label>Nom / nom de scène</label>
          <input name="name" type="text" defaultValue={artist.name} required />
          <div className="field-row">
            <div>
              <label>Catégorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Ville</label>
              <select name="city" defaultValue={artist.city || BELGIAN_CITIES[0]}>
                {BELGIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {isCustomCategory && (
            <>
              <label>Précisez votre spécialité</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="ex. Magicien, Sculpteur sur glace, Groupe folklorique..."
                maxLength={60}
                required
              />
              <p className="hint">Elle sera automatiquement corrigée par l&apos;IA en enregistrant.</p>
            </>
          )}
          <label>Bio</label>

          <div className="ai-generate-box">
            <label style={{ margin: "0 0 8px" }}>✨ Laissez l&apos;IA rédiger votre bio</label>
            <textarea
              value={bioNotes}
              onChange={(e) => setBioNotes(e.target.value)}
              placeholder="Décrivez-vous en quelques mots : votre parcours, votre style, votre expérience, ce qui vous distingue..."
              disabled={generatingBio}
              style={{ minHeight: 60, marginBottom: 10 }}
            />
            <button type="button" className="btn btn-gold" onClick={generateBio} disabled={generatingBio || !bioNotes.trim()}>
              {generatingBio ? "Génération..." : "Générer ma bio"}
            </button>
            {bioError && <p className="error">{bioError}</p>}
            <p className="hint">Le résultat remplit le champ ci-dessous — relisez et ajustez avant d&apos;enregistrer.</p>
          </div>

          <textarea name="bio" maxLength={600} value={bioValue} onChange={(e) => setBioValue(e.target.value)} />

          <div className="field-row">
            <div>
              <label>Téléphone (optionnel)</label>
              <input name="phone" type="text" defaultValue={artist.phone || ""} maxLength={30} />
            </div>
            <div>
              <label>Site web (optionnel)</label>
              <input name="website" type="text" defaultValue={artist.website || ""} maxLength={200} placeholder="monsite.be" />
            </div>
          </div>
          <div className="field-row">
            <div>
              <label>Facebook (optionnel)</label>
              <input name="facebook" type="text" defaultValue={artist.facebook || ""} maxLength={200} placeholder="facebook.com/..." />
            </div>
            <div>
              <label>Instagram (optionnel)</label>
              <input name="instagram" type="text" defaultValue={artist.instagram || ""} maxLength={200} placeholder="instagram.com/..." />
            </div>
          </div>

          {profileMsg && <p className="success">{profileMsg}</p>}
          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-gold">
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>
          Photos ({artist.photos.length}/{MAX_PHOTOS})
        </h2>
        <div className="media-row">
          {artist.photos.map((p) => (
            <div className="thumb-wrap" key={p}>
              <img className="thumb" src={p} alt="" />
              <button className="rm" onClick={() => removePhoto(p)}>
                ×
              </button>
            </div>
          ))}
        </div>
        {artist.photos.length < MAX_PHOTOS ? (
          <>
            <label style={{ marginTop: 20 }}>Ajouter une photo</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
            />
            <p className="hint">{uploading ? "Envoi en cours..." : "JPEG, PNG ou WebP."}</p>
          </>
        ) : (
          <p className="hint" style={{ marginTop: 14 }}>
            Nombre maximum de photos atteint.
          </p>
        )}
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>
          Vidéos ({artist.videos.length}/{MAX_VIDEOS})
        </h2>
        {artist.videos.map((v) => (
          <div className="video-item" key={v}>
            <span className="mono">{v}</span>
            <button onClick={() => removeVideo(v)}>×</button>
          </div>
        ))}
        {artist.videos.length < MAX_VIDEOS && (
          <>
            <label style={{ marginTop: 20 }}>Ajouter un lien vidéo (YouTube, Vimeo, MP4...)</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              <button className="btn btn-outline" onClick={addVideo} style={{ whiteSpace: "nowrap" }}>
                Ajouter
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
