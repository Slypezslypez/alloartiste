"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") })
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Une erreur est survenue.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="panel">
      <h2>Connexion</h2>
      <p className="sub">Accédez à votre espace pour gérer votre profil, vos photos, vidéos et votre abonnement.</p>
      <form onSubmit={submit}>
        <label>Email</label>
        <input name="email" type="email" required />
        <label>Mot de passe</label>
        <input name="password" type="password" required />
        <p style={{ textAlign: "right", margin: "8px 0 0" }}>
          <a href="/mot-de-passe-oublie" style={{ color: "var(--gold-deep)", fontSize: 13, fontWeight: 600 }}>
            Mot de passe oublié ?
          </a>
        </p>
        {error && <p className="error">{error}</p>}
        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-gold" disabled={loading} data-loading={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
}
