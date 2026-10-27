"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, CITIES_BY_COUNTRY, PAYMENTS_ENABLED, type Country } from "@/lib/categories";
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
  const [plan, setPlan] = useState<"free" | "pro">("free");

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
        plan,
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Créer mon profil</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <img
            src="/carlos.jpg"
            alt="Carlos Vaquera"
            width={52}
            height={52}
            style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div className="parrain-text" style={{ lineHeight: 1.3, textAlign: "center", maxWidth: 190 }}>
            <strong style={{ display: "block", fontSize: 15, marginBottom: 2 }}>Carlos Vaquera</strong>
            <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-soft)", textWrap: "balance" } as React.CSSProperties}>
              Donnons de la visibilité à nos artistes
            </span>
          </div>
        </div>
      </div>
      <p className="sub">
        L&apos;inscription est gratuite — version découverte.
      </p>
      <form onSubmit={submit}>
        <label>Votre formule</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 6 }}>
          {(
            [
              { value: "free", title: "Compte gratuit", text: "Version découverte : profil visible, 1ʳᵉ demande lisible." },
              { value: "pro", title: "Version PRO", text: "Toutes les demandes lisibles, photos, vidéos et liens directs." }
            ] as const
          ).map((o) => {
            const disabled = o.value === "pro" && !PAYMENTS_ENABLED; // version PRO grisée jusqu'à l'ouverture des paiements
            return (
            <label
              key={o.value}
              style={{
                display: "block",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
                padding: "12px 14px",
                borderRadius: 12,
                border: plan === o.value ? "2px solid var(--gold-deep)" : "1px solid var(--line, #d9d2c3)",
                textTransform: "none",
                fontFamily: "inherit",
                letterSpacing: "normal"
              }}
            >
              <input
                type="radio"
                name="plan"
                value={o.value}
                checked={plan === o.value}
                disabled={disabled}
                onChange={() => setPlan(o.value)}
                style={{ width: "auto", marginRight: 8 }}
              />
              <strong>{o.title}</strong>
              {disabled && <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600 }}>— bientôt disponible</span>}
              <span style={{ display: "block", fontSize: 13, fontWeight: 400, color: "var(--ink-soft)", marginTop: 4 }}>{o.text}</span>
            </label>
            );
          })}
        </div>
        <p className="hint" style={{ marginTop: 0 }}>
          {plan === "pro" && PAYMENTS_ENABLED
            ? "Vous activerez la version PRO depuis votre espace, juste après la confirmation de votre email. "
            : !PAYMENTS_ENABLED
              ? "La version PRO ouvre bientôt. Vous pourrez y passer depuis votre espace dès son ouverture. "
              : ""}
          <a href="/version-pro" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Voir la version PRO
          </a>
        </p>

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

        <label>Email de contact</label>
        <input name="email" type="email" required />
        <label>Mot de passe</label>
        <input name="password" type="password" required minLength={8} />
        <label>Confirmez le mot de passe</label>
        <input name="passwordConfirm" type="password" required minLength={8} />
        <label>Bio courte</label>
        <textarea name="bio" maxLength={200} placeholder="Présentez votre parcours, votre style, vos disponibilités..." />
        <p className="hint">200 caractères maximum avec le compte gratuit (600 avec la version PRO).</p>
        <div style={{ marginTop: 22 }}>
          <label style={{ marginBottom: 4 }}>Options de la version PRO</label>
          <p className="hint" style={{ marginTop: 0, color: "var(--gold-deep)", fontWeight: 600 }}>
            🔒 Réservé à la version PRO — {PAYMENTS_ENABLED ? "à compléter depuis votre espace." : "bientôt disponible."}{" "}
            <a href="/version-pro" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
              Voir la version PRO
            </a>
          </p>
          <div style={{ opacity: 0.45, pointerEvents: "none", userSelect: "none" }} aria-disabled="true">
            <label>Photos (jusqu&apos;à 5)</label>
            <input type="file" disabled />
            <label>Vidéos & extraits (jusqu&apos;à 5)</label>
            <input type="url" disabled placeholder="https://youtube.com/watch?v=..." />
            <label>Citation courte</label>
            <input type="text" disabled placeholder="Spécialiste de la musique électronique, événements corporate haut de gamme." />
            <label>Formules & prestations</label>
            <input type="text" disabled placeholder="ex. Mariages premium" />
            <div className="field-row">
              <div>
                <label>Téléphone</label>
                <input type="text" disabled />
              </div>
              <div>
                <label>Site web</label>
                <input type="text" disabled placeholder="monsite.be" />
              </div>
            </div>
            <div className="field-row">
              <div>
                <label>Facebook</label>
                <input type="text" disabled placeholder="facebook.com/..." />
              </div>
              <div>
                <label>Instagram</label>
                <input type="text" disabled placeholder="instagram.com/..." />
              </div>
            </div>
          </div>
        </div>
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
        <p className="hint" style={{ marginTop: 14, fontSize: 12.5 }}>
          Aucun paiement n&apos;est demandé à l&apos;inscription. Le compte gratuit (version découverte) rend votre profil visible et
          vous permet de lire vos deux premières demandes de devis ; pour lire toutes les demandes, il existe la version PRO, sans
          obligation et résiliable à tout moment.{" "}
          <a href="/version-pro" target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Voir la version PRO
          </a>
        </p>
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
