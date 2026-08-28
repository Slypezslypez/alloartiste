"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, CITIES_BY_COUNTRY, type Country } from "@/lib/categories";
import { SPECIALTY_TREE } from "@/lib/specialtyTree";

export function InscriptionForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>(categories[0] || "Autre");
  const [customCategory, setCustomCategory] = useState("");
  const isCustom = category === "Autre";

  const [specialty, setSpecialty] = useState("");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const specialtyOptions = SPECIALTY_TREE[category] || [];
  const isCustomSpecialty = specialty === "Autre";

  const [country, setCountry] = useState<Country>("Belgique");
  const [city, setCity] = useState<string>(CITIES_BY_COUNTRY["Belgique"][0]);

  function changeCountry(value: Country) {
    setCountry(value);
    setCity(CITIES_BY_COUNTRY[value][0]);
  }

  function changeCategory(value: string) {
    setCategory(value);
    setSpecialty("");
    setCustomSpecialty("");
  }

  async function normalize(raw: string): Promise<string> {
    try {
      const res = await fetch("/api/categories/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw })
      });
      const data = await res.json();
      return res.ok && data.category ? data.category : raw;
    } catch {
      return raw;
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (isCustom && !customCategory.trim()) {
      setError("Précisez votre spécialité.");
      return;
    }
    if (isCustomSpecialty && !customSpecialty.trim()) {
      setError("Précisez votre spécialité.");
      return;
    }

    const fd = new FormData(e.currentTarget); // capturé tout de suite, avant tout "await" (sinon React invalide la référence)

    if (fd.get("password") !== fd.get("passwordConfirm")) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const finalCategory = isCustom ? await normalize(customCategory.trim()) : category;

    let finalSpecialty: string | null = null;
    if (specialtyOptions.length > 0 && specialty) {
      finalSpecialty = isCustomSpecialty ? await normalize(customSpecialty.trim()) : specialty;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        category: finalCategory,
        specialty: finalSpecialty,
        country,
        city,
        bio: fd.get("bio"),
        promoCode: fd.get("promoCode") || undefined
      })
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Une erreur est survenue.");
      return;
    }
    router.push("/verifier-email");
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
        <label>Métier principal</label>
        <select value={category} onChange={(e) => changeCategory(e.target.value)} required>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {isCustom && (
          <>
            <label>Précisez votre métier</label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="ex. Magicien, Sculpteur sur glace, Groupe folklorique..."
              maxLength={60}
              required
            />
            <p className="hint">Il sera automatiquement corrigé par l&apos;IA et deviendra un vrai métier, filtrable par les organisateurs.</p>
          </>
        )}

        {specialtyOptions.length > 0 && (
          <>
            <label>Spécialité (facultatif)</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="">— Choisissez votre spécialité —</option>
              {specialtyOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {isCustomSpecialty && (
              <>
                <label>Précisez votre spécialité</label>
                <input
                  type="text"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  placeholder="ex. Théorbiste, Joueur de cornemuse..."
                  maxLength={60}
                  required
                />
                <p className="hint">Elle sera automatiquement corrigée par l&apos;IA.</p>
              </>
            )}
            <p className="hint">Elle apparaîtra comme filtre pour les organisateurs qui cherchent ce talent précis.</p>
          </>
        )}

        <div className="field-row">
          <div>
            <label>Pays</label>
            <select value={country} onChange={(e) => changeCountry(e.target.value as Country)} required>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Ville</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} required>
              {CITIES_BY_COUNTRY[country].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label>Email de contact</label>
        <input name="email" type="email" required />
        <label>Mot de passe</label>
        <input name="password" type="password" required minLength={8} />
        <label>Confirmez le mot de passe</label>
        <input name="passwordConfirm" type="password" required minLength={8} />
        <label>Bio courte</label>
        <textarea name="bio" maxLength={600} placeholder="Présentez votre parcours, votre style, vos disponibilités..." />
        <label>Code promo (facultatif)</label>
        <input name="promoCode" type="text" maxLength={60} placeholder="Laissez vide si vous n'en avez pas" />
        {error && <p className="error">{error}</p>}
        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-gold" disabled={loading} data-loading={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </div>
      </form>
    </div>
  );
}
