"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, CITIES_BY_COUNTRY, PAYMENTS_ENABLED, CATALOG_OPEN, type Country } from "@/lib/categories";
import { SPECIALTY_TREE } from "@/lib/specialtyTree";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Charge le script Cloudflare Turnstile (anti-robot) une seule fois, puis affiche explicitement le widget
// dans le conteneur donné (fonctionne aussi quand on arrive sur la page par navigation interne).
function useTurnstileWidget(containerRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    function renderWidget() {
      const turnstile = (window as any).turnstile;
      const el = containerRef.current;
      if (!turnstile || !el || el.childElementCount > 0) return;
      turnstile.render(el, { sitekey: TURNSTILE_SITE_KEY });
    }

    const scriptId = "cf-turnstile-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if ((window as any).turnstile) {
      renderWidget();
      return;
    }
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", renderWidget);
    return () => script?.removeEventListener("load", renderWidget);
  }, [containerRef]);
}

export function InscriptionForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const turnstileRef = useRef<HTMLDivElement>(null);
  useTurnstileWidget(turnstileRef);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>(categories[0] || "Autre");
  const [customCategory, setCustomCategory] = useState("");
  const isCustom = category === "Autre";

  const [specialties, setSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const specialtyOptions = SPECIALTY_TREE[category] || [];
  const isCustomSpecialty = specialties.includes("Autre");

  const [country, setCountry] = useState<Country>("Belgique");
  const [city, setCity] = useState<string>(CITIES_BY_COUNTRY["Belgique"][0]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function changeCountry(value: Country) {
    setCountry(value);
    setCity(CITIES_BY_COUNTRY[value][0]);
  }

  function changeCategory(value: string) {
    setCategory(value);
    setSpecialties([]);
    setCustomSpecialty("");
  }

  function toggleSpecialty(value: string) {
    setSpecialties((prev) => {
      if (prev.includes(value)) return prev.filter((s) => s !== value);
      if (prev.length >= 5) return prev; // max 5 spécialités
      return [...prev, value];
    });
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
    const finalPriceMin = priceMin.trim() ? parseInt(priceMin, 10) : null;
    const finalPriceMax = priceMax.trim() ? parseInt(priceMax, 10) : null;
    if (finalPriceMin != null && finalPriceMax != null && finalPriceMax < finalPriceMin) {
      setError("Le prix maximum doit être supérieur ou égal au prix minimum.");
      return;
    }

    const fd = new FormData(e.currentTarget); // capturé tout de suite, avant tout "await" (sinon React invalide la référence)

    if (String(fd.get("email") || "").trim().toLowerCase() !== String(fd.get("emailConfirm") || "").trim().toLowerCase()) {
      setError("Les deux adresses email ne correspondent pas.");
      return;
    }

    if (fd.get("password") !== fd.get("passwordConfirm")) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const finalCategory = isCustom ? await normalize(customCategory.trim()) : category;

    let finalSpecialties: string[] = [];
    if (specialtyOptions.length > 0 && specialties.length > 0) {
      const normalized = await Promise.all(
        specialties.map((s) => (s === "Autre" ? normalize(customSpecialty.trim()) : Promise.resolve(s)))
      );
      finalSpecialties = Array.from(new Set(normalized));
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        category: finalCategory,
        specialties: finalSpecialties,
        country,
        city,
        bio: fd.get("bio"),
        priceMin: finalPriceMin,
        priceMax: finalPriceMax,
        promoCode: fd.get("promoCode") || undefined,
        turnstileToken: fd.get("cf-turnstile-response") || undefined
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
        {CATALOG_OPEN
          ? "L'inscription est gratuite et votre profil est visible dans le catalogue pendant 3 mois offerts."
          : "L'inscription est gratuite. Vos 3 mois offerts commencent dès l'ouverture de l'annuaire au public."}
      </p>
      <div
        style={{
          border: "1px solid var(--gold-deep)",
          borderRadius: 10,
          padding: "12px 14px",
          margin: "12px 0 4px",
          fontSize: 14,
          lineHeight: 1.5
        }}
      >
        <strong>Tarif : 39 € par an</strong>, après <strong>3 mois gratuits</strong> pour commencer
        {CATALOG_OPEN ? "" : " (ils débutent dès que l'annuaire est ouvert au public, pas avant)"}. Aucun paiement n&apos;est
        demandé à l&apos;inscription. À la fin des 3 mois, votre profil n&apos;est plus visible tant que vous n&apos;avez pas
        souscrit l&apos;abonnement annuel (renouvelable automatiquement, résiliable à tout moment). Un code d&apos;invitation donne droit à
        1 an gratuit.
      </div>
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
            <label>Spécialités (facultatif, jusqu&apos;à 5)</label>
            <div className="specialty-grid">
              {specialtyOptions.map((s) => {
                const checked = specialties.includes(s);
                return (
                  <label key={s} className="specialty-pill">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSpecialty(s)}
                      disabled={!checked && specialties.length >= 5}
                    />
                    {s}
                  </label>
                );
              })}
            </div>
            {isCustomSpecialty && (
              <>
                <label>Précisez votre spécialité &quot;Autre&quot;</label>
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
            <p className="hint">Elles apparaîtront comme filtres pour les organisateurs qui cherchent ce talent précis.</p>
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
        <label>Fourchette de prix indicative (facultatif)</label>
        <div className="field-row">
          <div>
            <input
              type="number"
              min={0}
              step={10}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Prix minimum en €"
            />
          </div>
          <div>
            <input
              type="number"
              min={0}
              step={10}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Prix maximum en €"
            />
          </div>
        </div>
        <p className="hint">Donne une idée de budget aux organisateurs directement sur votre fiche et votre vignette. Modifiable à tout moment.</p>

        <label>Votre email (connexion et réception des demandes)</label>
        <input name="email" type="email" required autoComplete="email" />
        <label>Confirmez votre email</label>
        <input name="emailConfirm" type="email" required autoComplete="off" />
        <p className="hint">
          Les demandes des organisateurs arrivent à cette adresse, et vous l&apos;utilisez aussi pour vous connecter. Elle n&apos;est
          jamais affichée publiquement : les organisateurs vous écrivent via le formulaire de votre fiche.
        </p>
        <label>Mot de passe</label>
        <input name="password" type="password" required minLength={8} />
        <label>Confirmez le mot de passe</label>
        <input name="passwordConfirm" type="password" required minLength={8} />
        <label>Bio courte</label>
        <textarea name="bio" maxLength={600} placeholder="Présentez votre parcours, votre style, vos disponibilités..." />
        <label>{PAYMENTS_ENABLED ? "Code promo (facultatif)" : "Code d'invitation (facultatif)"}</label>
        <input name="promoCode" type="text" maxLength={60} placeholder="Laissez vide si vous n'en avez pas" />
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 20 }}>
          <input type="checkbox" name="acceptTerms" required style={{ width: "auto", marginTop: 3 }} />
          <span style={{ textTransform: "none", fontFamily: "inherit", fontWeight: 400, color: "var(--ink-soft)", fontSize: 14 }}>
            J&apos;ai lu et j&apos;accepte les{" "}
            <a href="/conditions" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
              Conditions Générales d&apos;Utilisation
            </a>{" "}
            et la{" "}
            <a href="/confidentialite" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
              Politique de confidentialité
            </a>
            .
          </span>
        </label>
        {TURNSTILE_SITE_KEY && <div ref={turnstileRef} style={{ marginTop: 12 }} />}
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
