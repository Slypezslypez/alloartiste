"use client";

import { useState } from "react";
import { CATEGORIES, MAX_PHOTOS, MAX_VIDEOS, isSubscriptionVisible } from "@/lib/categories";

type Artist = {
  id: string;
  name: string;
  email: string;
  category: string;
  bio: string;
  photos: string[];
  videos: string[];
  stripeCustomerId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
};

export function DashboardClient({ initialArtist }: { initialArtist: Artist }) {
  const [artist, setArtist] = useState(initialArtist);
  const active = isSubscriptionVisible({
    subscriptionStatus: artist.subscriptionStatus,
    currentPeriodEnd: artist.currentPeriodEnd ? new Date(artist.currentPeriodEnd) : null
  });

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  async function startSubscription() {
    setSubLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const body = await res.json();
    setSubLoading(false);
    if (body.url) window.location.href = body.url;
  }

  async function openPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const body = await res.json();
    if (body.url) window.location.href = body.url;
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/artists/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), category: fd.get("category"), bio: fd.get("bio") })
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
          <p className="sub">33€ par an, renouvelable automatiquement via Stripe. Requis pour apparaître dans le catalogue public.</p>
          <button className="btn btn-gold" onClick={startSubscription} disabled={subLoading}>
            {subLoading ? "Redirection..." : "S'abonner — 33€/an"}
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

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Mon profil</h2>
        <form onSubmit={saveProfile}>
          <label>Nom / nom de scène</label>
          <input name="name" type="text" defaultValue={artist.name} required />
          <label>Catégorie</label>
          <select name="category" defaultValue={artist.category}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label>Bio</label>
          <textarea name="bio" maxLength={600} defaultValue={artist.bio} />
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
            <label style={{ marginTop: 20 }}>Ajouter un lien vidéo (YouTube, Vimeo...)</label>
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
