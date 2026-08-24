"use client";

import { useEffect, useRef, useState } from "react";

// Renvoie "chemin+recherche" cible si le lien cliqué est une navigation interne classique
// (pas un ancre #, pas mailto/tel, pas un lien externe, pas d'ouverture dans un nouvel onglet).
function internalNavigationTarget(anchor: HTMLAnchorElement): string | null {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

/**
 * Affiche une fine barre de progression en haut de l'écran entre le clic sur un lien et
 * l'affichage effectif de la nouvelle page — pour que le clic se voie tout de suite, même si le
 * chargement prend un court instant (montée de la base de données après une période d'inactivité,
 * par exemple).
 */
export function NavigationProgress() {
  const [loading, setLoading] = useState(false);
  const targetRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function stop() {
      setLoading(false);
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = internalNavigationTarget(anchor as HTMLAnchorElement);
      if (!target) return;
      if (target === window.location.pathname + window.location.search) return; // déjà sur cette page

      stop();
      targetRef.current = target;
      setLoading(true);

      pollRef.current = setInterval(() => {
        if (window.location.pathname + window.location.search === targetRef.current) stop();
      }, 80);
      timeoutRef.current = setTimeout(stop, 8000); // filet de sécurité si la navigation échoue
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      stop();
    };
  }, []);

  if (!loading) return null;
  return <div className="nav-progress-bar" aria-hidden="true" />;
}
