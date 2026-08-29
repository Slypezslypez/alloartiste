"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// useSearchParams() exige une limite Suspense pour que Next.js puisse pré-générer
// cette page statiquement au build (sinon : erreur "should be wrapped in a suspense boundary").
export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={<div className="panel" />}>
      <ReinitialiserMotDePasseForm />
    </Suspense>
  );
}

function ReinitialiserMotDePasseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Une erreur est survenue.");
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <div className="panel">
        <h2>Lien invalide</h2>
        <p className="sub">
          Ce lien de réinitialisation est incomplet. Refaites une demande depuis la page{" "}
          <a href="/mot-de-passe-oublie" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Mot de passe oublié
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Choisir un nouveau mot de passe</h2>

      {done ? (
        <>
          <p className="success">Votre mot de passe a bien été mis à jour.</p>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-gold" onClick={() => router.push("/connexion")}>
              Se connecter
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submit}>
          <label>Nouveau mot de passe</label>
          <input name="password" type="password" required minLength={8} />
          <label>Confirmer le mot de passe</label>
          <input name="confirm" type="password" required minLength={8} />
          {error && <p className="error">{error}</p>}
          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-gold" disabled={loading} data-loading={loading}>
              {loading ? "Enregistrement..." : "Réinitialiser mon mot de passe"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
