"use client";

import { useEffect } from "react";

// Certains navigateurs (et la navigation interne de Next.js) ne sautent pas toujours
// automatiquement à l'ancre présente dans l'URL (ex. /profil/xxx#evenements). Ce composant
// force ce comportement une fois la page chargée.
export function ScrollToHash() {
  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    // Léger délai pour laisser le temps aux images/polices de se mettre en place et
    // éviter un calcul de position erroné.
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
