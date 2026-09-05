"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, COUNTRIES, CITIES_BY_COUNTRY, MAX_PHOTOS, MAX_VIDEOS, isSubscriptionVisible, type Country } from "@/lib/categories";
import { SPECIALTY_TREE } from "@/lib/specialtyTree";
import { AvailabilityCalendar } from "@/app/AvailabilityCalendar";
import { compressImage } from "@/lib/imageCompress";

type Artist = {
  id: string;
  name: string;
  email: string;
  category: string;
  specialties: string[];
  city: string;
  country: string;
  bio: string;
  tagline: string | null;
  services: string[];
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  photos: string[];
  videos: string[];
  priceMin: number | null;
  priceMax: number | null;
  views: number;
  rating: number;
  reviewsCount: number;
  stripeCustomerId: string | null;
  paypalSubscriptionId: string | null;
  paymentProvider: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  calendarVisible: boolean;
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

export function DashboardClient({
  initialArtist,
  initialLeads,
  initialUnavailableDates
}: {
  initialArtist: Artist;
  initialLeads: Lead[];
  initialUnavailableDates: string[];
}) {
  const [artist, setArtist] = useState(initialArtist);
  const [leads, setLeads] = useState(initialLeads);
  const [unavailableDates, setUnavailableDates] = useState<string[]>(initialUnavailableDates || []);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const active = isSubscriptionVisible({
    subscriptionStatus: artist.subscriptionStatus,
    currentPeriodEnd: artist.currentPeriodEnd ? new Date(artist.currentPeriodEnd) : null
  });

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const isKnownCategory = CATEGORIES.includes(initialArtist.category as any);
  const [category, setCategory] = useState<string>(isKnownCategory ? initialArtist.category : "Autre");
  const [customCategory, setCustomCategory] = useState(isKnownCategory ? "" : initialArtist.category);
  const isCustomCategory = category === "Autre";
  const [specialties, setSpecialties] = useState<string[]>(initialArtist.specialties || []);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const specialtyOptions = SPECIALTY_TREE[category] || [];
  const isCustomSpecialty = specialties.includes("Autre");

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
  const isKnownCountry = COUNTRIES.includes(initialArtist.country as any);
  const [country, setCountry] = useState<Country>(isKnownCountry ? (initialArtist.country as Country) : "Belgique");
  const [city, setCity] = useState<string>(initialArtist.city || CITIES_BY_COUNTRY[isKnownCountry ? (initialArtist.country as Country) : "Belgique"][0]);
  const [bioValue, setBioValue] = useState(initialArtist.bio);
  const [bioNotes, setBioNotes] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [taglineValue, setTaglineValue] = useState(initialArtist.tagline || "");
  const [services, setServices] = useState<string[]>(initialArtist.services || []);
  const [newService, setNewService] = useState("");
  const [generatingServices, setGeneratingServices] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [subLoading, setSubLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openTab, setOpenTab] = useState<"abonnement" | "stats" | "calendrier" | null>(null);

  // --- PayPal (abonnement récurrent alternatif à Stripe) ---
  const paypalRef = useRef<HTMLDivElement>(null);
  const [paypalMsg, setPaypalMsg] = useState<string | null>(null);

  useEffect(() => {
    if (active || !termsAccepted) return;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const planId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID;
    if (!clientId || !planId) return;

    function renderButtons() {
      const paypal = (window as any).paypal;
      if (!paypal || !paypalRef.current) return;
      paypalRef.current.innerHTML = "";
      paypal
        .Buttons({
          style: { shape: "rect", color: "gold", label: "subscribe" },
          createSubscription: (_data: any, actions: any) =>
            actions.subscription.create({ plan_id: planId, custom_id: artist.id }),
          onApprove: async (data: any) => {
            setPaypalMsg("Confirmation en cours...");
            try {
              const res = await fetch("/api/paypal/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId: data.subscriptionID })
              });
              const body = await res.json();
              if (!res.ok) throw new Error(body.error || "Échec de la confirmation.");
              setArtist((a) => ({ ...a, ...body }));
              setPaypalMsg(null);
            } catch (err: any) {
              setPaypalMsg(
                err.message || "Le paiement a été reçu par PayPal mais la confirmation a échoué — contactez-nous."
              );
            }
          },
          onError: () => setPaypalMsg("Une erreur PayPal est survenue.")
        })
        .render(paypalRef.current);
    }

    if ((window as any).paypal) {
      renderButtons();
      return;
    }

    const scriptId = "paypal-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&currency=EUR`;
      document.body.appendChild(script);
    }
    script.addEventListener("load", renderButtons);
    return () => script?.removeEventListener("load", renderButtons);
  }, [active, termsAccepted, artist.id]);

  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  function changeCountry(value: Country) {
    setCountry(value);
    setCity(CITIES_BY_COUNTRY[value][0]);
  }

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

  async function generateServices() {
    setGeneratingServices(true);
    setServicesError(null);
    try {
      const res = await fetch("/api/artists/me/generate-services", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la génération.");
      const merged = Array.from(new Set([...services, ...(data.services || [])])).slice(0, 6);
      setServices(merged);
    } catch (err: any) {
      setServicesError(err.message || "Échec de la génération.");
    } finally {
      setGeneratingServices(false);
    }
  }

  function addService() {
    const v = newService.trim();
    if (!v || services.includes(v) || services.length >= 6) return;
    setServices((s) => [...s, v]);
    setNewService("");
  }

  function removeService(s: string) {
    setServices((list) => list.filter((x) => x !== s));
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const rawPriceMin = (fd.get("priceMin") as string) || "";
    const rawPriceMax = (fd.get("priceMax") as string) || "";
    const finalPriceMin = rawPriceMin.trim() ? parseInt(rawPriceMin, 10) : null;
    const finalPriceMax = rawPriceMax.trim() ? parseInt(rawPriceMax, 10) : null;
    if (finalPriceMin != null && finalPriceMax != null && finalPriceMax < finalPriceMin) {
      setProfileMsg("Le prix maximum doit être supérieur ou égal au prix minimum.");
      return;
    }

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

    let finalSpecialties: string[] = [];
    if (specialtyOptions.length > 0 && specialties.length > 0) {
      const normalized = await Promise.all(
        specialties.map(async (s) => {
          if (s !== "Autre") return s;
          if (!customSpecialty.trim()) return null;
          try {
            const res = await fetch("/api/categories/normalize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ raw: customSpecialty.trim() })
            });
            const data = await res.json();
            return res.ok && data.category ? data.category : customSpecialty.trim();
          } catch {
            return customSpecialty.trim();
          }
        })
      );
      finalSpecialties = Array.from(new Set(normalized.filter((s): s is string => !!s)));
    }

    const res = await fetch("/api/artists/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        category: finalCategory,
        specialties: finalSpecialties,
        country,
        city,
        bio: bioValue,
        priceMin: finalPriceMin,
        priceMax: finalPriceMax,
        tagline: taglineValue.trim() || null,
        services,
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

  async function uploadPhoto(rawFile: File) {
    setUploading(true);
    try {
      const file = await compressImage(rawFile);
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

  async function toggleUnavailableDate(dateKey: string, isCurrentlyUnavailable: boolean) {
    setPendingDate(dateKey);
    try {
      const res = await fetch("/api/artists/me/unavailable-dates", {
        method: isCurrentlyUnavailable ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateKey })
      });
      if (res.ok) {
        const data = await res.json();
        setUnavailableDates(data.dates || []);
      }
    } finally {
      setPendingDate(null);
    }
  }

  const [savingCalendarVisible, setSavingCalendarVisible] = useState(false);

  async function toggleCalendarVisible(visible: boolean) {
    setSavingCalendarVisible(true);
    try {
      const res = await fetch("/api/artists/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarVisible: visible })
      });
      if (res.ok) setArtist((a) => ({ ...a, calendarVisible: visible }));
    } finally {
      setSavingCalendarVisible(false);
    }
  }


  return (
    <>
      <h2 className="section-title">
        Mon espace — {artist.name}
        <span className={`dashboard-status ${active ? "is-active" : "is-inactive"}`}>
          <span className="dot">●</span>
          {active ? "Abonnement actif" : "Profil non visible — abonnement inactif"}
        </span>
      </h2>

      {!active && (
        <div className="panel wide">
          <h2 style={{ fontSize: 24 }}>Activer l&apos;abonnement</h2>
          <p className="sub">Abonnement annuel, renouvelable automatiquement. Requis pour apparaître dans le catalogue public.</p>
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
          <button className="btn btn-gold" onClick={startSubscription} disabled={subLoading || !termsAccepted} data-loading={subLoading}>
            {subLoading ? "Redirection..." : "S'abonner avec carte bancaire (Stripe)"}
          </button>

          <p className="hint" style={{ marginTop: 20, marginBottom: 8 }}>Ou payez avec PayPal :</p>
          {termsAccepted ? (
            <div ref={paypalRef} />
          ) : (
            <p className="hint">Cochez la case ci-dessus pour afficher le bouton PayPal.</p>
          )}
          {paypalMsg && <p className="hint">{paypalMsg}</p>}
        </div>
      )}

      <div className="account-tabs" style={{ maxWidth: 1100 }}>
        <div className="account-tabs-bar">
          {active && (
            <button
              className={`account-tab ${openTab === "abonnement" ? "active" : ""}`}
              onClick={() => setOpenTab(openTab === "abonnement" ? null : "abonnement")}
            >
              Abonnement
            </button>
          )}
          <button className={`account-tab ${openTab === "stats" ? "active" : ""}`} onClick={() => setOpenTab(openTab === "stats" ? null : "stats")}>
            Statistiques
          </button>
          <Link href="/dashboard/demandes" className="account-tab">
            Message(s) reçu(s)
            {newLeadsCount > 0 && <span className="lead-count-badge" style={{ marginLeft: 8 }}>{newLeadsCount}</span>}
          </Link>
          <Link href="/dashboard/salles" className="account-tab">
            Salles à proximité
          </Link>
          <Link href="/dashboard/evenements" className="account-tab">
            Mes événements
          </Link>
          <Link href="/dashboard/contrats" className="account-tab">
            Mes contrats
          </Link>
          <button className={`account-tab ${openTab === "calendrier" ? "active" : ""}`} onClick={() => setOpenTab(openTab === "calendrier" ? null : "calendrier")}>
            Calendrier
          </button>
        </div>

        {openTab === "abonnement" && active && (
          <div className="account-tab-panel">
            {artist.cancelAtPeriodEnd ? (
              <p className="sub" style={{ marginTop: 0, color: "var(--red)" }}>
                Abonnement annulé — reste actif jusqu&apos;au {new Date(artist.currentPeriodEnd as string).toLocaleDateString("fr-FR")}, ne sera pas renouvelé.
              </p>
            ) : (
              <p className="sub" style={{ marginTop: 0 }}>
                Renouvellement automatique le {new Date(artist.currentPeriodEnd as string).toLocaleDateString("fr-FR")}.
              </p>
            )}
            {artist.stripeCustomerId ? (
              <button className="btn btn-outline" onClick={openPortal}>
                Gérer / annuler mon abonnement
              </button>
            ) : artist.paypalSubscriptionId ? (
              <p className="hint">
                Abonnement PayPal — gérez ou annulez le renouvellement automatique directement depuis votre compte
                PayPal, dans Paramètres → Paiements automatiques.
              </p>
            ) : null}
          </div>
        )}

        {openTab === "stats" && (
          <div className="account-tab-panel">
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
        )}

        {openTab === "calendrier" && (
          <div className="account-tab-panel">
            <p className="sub" style={{ marginTop: 0 }}>
              Cliquez sur une date pour la marquer comme indisponible (ou la libérer).
            </p>

            <label className="calendar-visibility-toggle">
              <input
                type="checkbox"
                checked={artist.calendarVisible}
                onChange={(e) => toggleCalendarVisible(e.target.checked)}
                disabled={savingCalendarVisible}
              />
              <span>
                Afficher mon calendrier de disponibilité sur ma fiche publique et dans le formulaire de contact
              </span>
            </label>

            <AvailabilityCalendar
              unavailableDates={unavailableDates}
              editable
              onToggleDate={toggleUnavailableDate}
              pendingDate={pendingDate}
            />
          </div>
        )}
      </div>

      <div className="profile-two-col" style={{ marginTop: 0 }}>
        {/* Colonne gauche : photo principale + galerie + vidéos, même disposition que la fiche publique */}
        <div className="profile-media-col" style={{ position: "static" }}>
          <div className="profile-main-photo-wrap">
            {artist.photos[0] ? (
              <img className="profile-main-photo" src={artist.photos[0]} alt={artist.name} />
            ) : (
              <div className="profile-main-photo profile-main-photo-empty" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="hint" style={{ margin: 0 }}>Aucune photo</span>
              </div>
            )}
          </div>

          <p className="profile-media-label mono">
            Galerie médias ({artist.photos.length}/{MAX_PHOTOS})
          </p>
          <div className="profile-thumbs" style={{ marginBottom: 14 }}>
            {artist.photos.map((p) => (
              <div key={p} style={{ position: "relative" }}>
                <img src={p} alt="" className="profile-thumb active" style={{ cursor: "default" }} />
                <button
                  onClick={() => removePhoto(p)}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--red, #b3261e)",
                    color: "#fff",
                    border: "2px solid var(--white)",
                    fontSize: 12,
                    lineHeight: 1,
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {artist.photos.length < MAX_PHOTOS ? (
            <>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
              />
              <p className="hint">{uploading ? "Envoi en cours..." : "JPEG, PNG ou WebP — la première photo devient la photo principale."}</p>
            </>
          ) : (
            <p className="hint">Nombre maximum de photos atteint.</p>
          )}

          <p className="profile-section-label mono" style={{ margin: "22px 0 10px" }}>
            Vidéos & extraits ({artist.videos.length}/{MAX_VIDEOS})
          </p>
          {artist.videos.map((v) => (
            <div className="video-item" key={v}>
              <span className="mono" style={{ fontSize: 12, wordBreak: "break-all" }}>{v}</span>
              <button onClick={() => removeVideo(v)}>×</button>
            </div>
          ))}
          {artist.videos.length < MAX_VIDEOS && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              <button className="btn btn-outline" onClick={addVideo} style={{ whiteSpace: "nowrap" }}>
                Ajouter
              </button>
            </div>
          )}
        </div>

        {/* Colonne droite : formulaire, même disposition que la fiche publique */}
        <div className="profile-right-col">
          <div className="profile-info-card">
            <form onSubmit={saveProfile}>
              <div className="field-row" style={{ marginBottom: 4 }}>
                <div>
                  <label>Métier principal</label>
                  <select value={category} onChange={(e) => changeCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Pays</label>
                  <select value={country} onChange={(e) => changeCountry(e.target.value as Country)}>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Ville</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)}>
                    {CITIES_BY_COUNTRY[country].map((c) => (
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
                  <p className="hint">Visibles comme filtres pour les organisateurs et suggérées aux futurs inscrits de votre catégorie.</p>
                </>
              )}

              <label>Nom / nom de scène</label>
              <input name="name" type="text" defaultValue={artist.name} required style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700 }} />

              <label>Fourchette de prix indicative (facultatif)</label>
              <div className="field-row">
                <div>
                  <input name="priceMin" type="number" min={0} step={10} defaultValue={artist.priceMin ?? ""} placeholder="Prix minimum en €" />
                </div>
                <div>
                  <input name="priceMax" type="number" min={0} step={10} defaultValue={artist.priceMax ?? ""} placeholder="Prix maximum en €" />
                </div>
              </div>
              <p className="hint">Visible sur votre fiche et votre vignette dans le catalogue.</p>

              {artist.reviewsCount > 0 && (
                <div className="profile-rating-badge">
                  <span className="profile-stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={n <= Math.round(artist.rating) ? "star-filled" : "star-empty"}>
                        ★
                      </span>
                    ))}
                  </span>
                  <span>{artist.rating.toFixed(1)}</span>
                  <span className="dim">{artist.reviewsCount} avis</span>
                </div>
              )}

              <input
                type="text"
                value={taglineValue}
                onChange={(e) => setTaglineValue(e.target.value)}
                placeholder="Citation courte, ex. Spécialiste de la musique électronique, événements corporate haut de gamme."
                maxLength={180}
                style={{ fontStyle: "italic", fontFamily: "'Playfair Display', serif", color: "var(--gold-deep)" }}
              />

              <p className="profile-section-label mono">Biographie & démarche</p>

              <div className="ai-generate-box">
                <label style={{ margin: "0 0 8px" }}>✨ Laissez l&apos;IA rédiger votre bio</label>
                <textarea
                  value={bioNotes}
                  onChange={(e) => setBioNotes(e.target.value)}
                  placeholder="Décrivez-vous en quelques mots : votre parcours, votre style, votre expérience, ce qui vous distingue..."
                  disabled={generatingBio}
                  style={{ minHeight: 60, marginBottom: 10 }}
                />
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={generateBio}
                  disabled={generatingBio || !bioNotes.trim()}
                  data-loading={generatingBio}
                >
                  {generatingBio ? "Génération..." : "Générer ma bio"}
                </button>
                {bioError && <p className="error">{bioError}</p>}
              </div>

              <textarea name="bio" maxLength={600} value={bioValue} onChange={(e) => setBioValue(e.target.value)} />

              <p className="profile-section-label mono">Formules & prestations</p>
              <div className="profile-services-row" style={{ marginBottom: 12 }}>
                {services.map((s) => (
                  <span key={s} className="profile-service-pill">
                    <span className="service-check">✓</span> {s}
                    <button
                      type="button"
                      onClick={() => removeService(s)}
                      style={{ background: "none", border: "none", color: "inherit", marginLeft: 4, cursor: "pointer", fontWeight: 700 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {services.length === 0 && <p className="hint" style={{ margin: 0 }}>Aucune formule ajoutée pour le moment.</p>}
              </div>
              {services.length < 6 && (
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="ex. Mariages premium"
                    maxLength={40}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addService();
                      }
                    }}
                  />
                  <button type="button" className="btn btn-outline" onClick={addService} style={{ whiteSpace: "nowrap" }}>
                    Ajouter
                  </button>
                </div>
              )}
              <div className="ai-generate-box">
                <label style={{ margin: "0 0 8px" }}>✨ Suggérer des formules avec l&apos;IA</label>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={generateServices}
                  disabled={generatingServices || services.length >= 6}
                  data-loading={generatingServices}
                >
                  {generatingServices ? "Génération..." : "Suggérer avec l'IA"}
                </button>
                {servicesError && <p className="error">{servicesError}</p>}
              </div>

              <p className="profile-section-label mono">Liens directs</p>
              <div className="field-row">
                <div>
                  <label>Téléphone</label>
                  <input name="phone" type="text" defaultValue={artist.phone || ""} maxLength={30} />
                </div>
                <div>
                  <label>Site web</label>
                  <input name="website" type="text" defaultValue={artist.website || ""} maxLength={200} placeholder="monsite.be" />
                </div>
              </div>
              <div className="field-row">
                <div>
                  <label>Facebook</label>
                  <input name="facebook" type="text" defaultValue={artist.facebook || ""} maxLength={200} placeholder="facebook.com/..." />
                </div>
                <div>
                  <label>Instagram</label>
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
        </div>
      </div>
    </>
  );
}
