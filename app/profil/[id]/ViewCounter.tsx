"use client";

import { useEffect } from "react";

// Comptabilise une vue de profil depuis le navigateur du visiteur (une seule fois par session et
// par profil). Les robots qui n'exécutent pas le JavaScript ne déclenchent donc aucune écriture.
export function ViewCounter({ artistId }: { artistId: string }) {
  useEffect(() => {
    try {
      const key = `aa_view_${artistId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage indisponible : on compte quand même la vue.
    }
    fetch(`/api/artists/${artistId}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [artistId]);
  return null;
}
