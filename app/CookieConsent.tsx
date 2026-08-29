"use client";

import { useEffect, useState } from "react";

// Bandeau cookies simple (RGPD) : affiché tant que le visiteur n'a pas encore choisi,
// mémorisé ensuite en localStorage pour ne plus jamais le réafficher sur cet appareil.
const STORAGE_KEY = "alloartiste_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: "accepted" | "declined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p>
        Ce site utilise des cookies essentiels à son fonctionnement (accès, préférences) ainsi que des cookies de
        sécurité (protection anti-robot). En continuant à naviguer, vous acceptez leur utilisation.
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="cookie-btn cookie-btn-decline" onClick={() => choose("declined")}>
          Refuser
        </button>
        <button type="button" className="cookie-btn cookie-btn-accept" onClick={() => choose("accepted")}>
          Accepter
        </button>
      </div>
    </div>
  );
}
