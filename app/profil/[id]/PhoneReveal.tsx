"use client";

import { useState } from "react";

// Numéro masqué par défaut (anti-spam) : il n'est chargé qu'au clic.
export function PhoneReveal({ artistId }: { artistId: string }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function reveal() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/artists/${artistId}/phone`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.phone) setPhone(data.phone);
      else setError(true);
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  if (phone) {
    return (
      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="profile-link-pill mono">
        📞 {phone}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={reveal}
      disabled={loading}
      className="profile-link-pill mono"
      style={{ cursor: "pointer", border: "none" }}
    >
      📞 {loading ? "…" : error ? "Indisponible, réessayer" : "Afficher le numéro"}
    </button>
  );
}
