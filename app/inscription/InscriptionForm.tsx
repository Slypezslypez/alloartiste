"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BELGIAN_CITIES } from "@/lib/categories";

export function InscriptionForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>(categories[0] || "Autre");
  const [customCategory, setCustomCategory] = useState("");
  const isCustom = category === "Autre";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (isCustom && !customCategory.trim()) {
      setError("Précisez votre spécialité.");
      return;
    }

    setLoading(true);

    let finalCategory = category;
    if (isCustom) {
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

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        category: finalCategory,
        city: fd.get("city"),
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
        L&apos;inscription est gratuite. Le profil devient visible dans le catalogue une fois l&apos;abonnement
        activé (renouvelable automatiquement).
      </p>
      <form onSubmit={submit}>
        <label>Nom / nom de scène</label>
        <input name="name" type="text" required maxLength={60} />
        <label>Catégorie</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {isCustom && (
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
            <p className="hint">Elle sera automatiquement corrigée par l&apos;IA et deviendra une vraie catégorie, filtrable par les organisateurs.</p>
          </>
        )}
        <label>Ville</label>
        <select name="city" required defaultValue={BELGIAN_CITIES[0]}>
          {BELGIAN_CITIES.map((c) => (
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
