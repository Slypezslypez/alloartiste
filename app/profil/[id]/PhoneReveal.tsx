"use client";

import { useRef, useState } from "react";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function loadTurnstile(): Promise<any> {
  return new Promise((resolve) => {
    const w = window as any;
    if (w.turnstile) return resolve(w.turnstile);
    let script = document.getElementById("cf-turnstile-sdk") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "cf-turnstile-sdk";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", () => resolve((window as any).turnstile));
    script.addEventListener("error", () => resolve(null));
  });
}

// Numéro masqué par défaut (anti-spam) : il n'est chargé qu'au clic, après une vérification anti-robot.
export function PhoneReveal({ artistId }: { artistId: string }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  async function fetchPhone(token?: string) {
    try {
      const res = await fetch(`/api/artists/${artistId}/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken: token })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.phone) setPhone(data.phone);
      else setError(true);
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  async function reveal() {
    setLoading(true);
    setError(false);
    if (!TURNSTILE_SITE_KEY) {
      await fetchPhone();
      return;
    }
    const turnstile = await loadTurnstile();
    const el = widgetRef.current;
    if (!turnstile || !el) {
      setError(true);
      setLoading(false);
      return;
    }
    el.innerHTML = "";
    turnstile.render(el, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => fetchPhone(token),
      "error-callback": () => {
        setError(true);
        setLoading(false);
      }
    });
  }

  if (phone) {
    return (
      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="profile-link-pill mono">
        📞 {phone}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={reveal}
        disabled={loading}
        className="profile-link-pill mono"
        style={{ cursor: "pointer", border: "none" }}
      >
        📞 {loading ? "Vérification…" : error ? "Indisponible, réessayer" : "Afficher le numéro"}
      </button>
      <div ref={widgetRef} />
    </>
  );
}
