"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export default function InscriptionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        category: fd.get("category"),
        bio: fd.get("bio")
      })
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
      <h2>Créer mon profil</h2>
      <p className="sub">
        L&apos;inscription est gratuite. Le profil devient visible dans le catalogue une fois l&apos;abonnement de
        33€/an activé (renouvelable automatiquement).
      </p>
      <form onSubmit={submit}>
        <label>Nom / nom de scène</label>
        <input name="name" type="text" required maxLength={60} />
        <label>Catégorie</label>
        <select name="category" required defaultValue={CATEGORIES[0]}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label>Email de contact</label>
        <input name="email" type="email" required />
        <label>Mot de passe</label>
        <input name="password" type="password" required minLength={8} />
        <label>Bio courte</label>
        <textarea name="bio" maxLength={600} placeholder="Présentez votre parcours, votre style, vos disponibilités..." />
        {error && <p className="error">{error}</p>}
        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-gold" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </div>
      </form>
    </div>
  );
}
