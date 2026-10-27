"use client";

import { useState } from "react";

const videoStyle = {
  width: "100%",
  maxWidth: 960,
  display: "block",
  margin: "0 auto",
  borderRadius: 16,
  background: "#14110f"
} as const;

/**
 * Une seule vidéo à la fois : le tutoriel gratuit par défaut ; la vidéo PRO n'est chargée
 * qu'après un clic sur le bouton « Découvrir la version PRO » (et on peut revenir au tutoriel gratuit).
 */
export default function TutoVideos() {
  const [mode, setMode] = useState<"free" | "pro">("free");

  return (
    <div style={{ margin: "0 0 26px" }}>
      {mode === "free" ? (
        <video
          key="free"
          controls
          playsInline
          preload="metadata"
          poster="/tuto-artistes-poster.jpg"
          style={videoStyle}
        >
          <source src="/tuto-artistes.mp4" type="video/mp4" />
          Votre navigateur ne peut pas lire cette vidéo.
        </video>
      ) : (
        <video
          key="pro"
          controls
          autoPlay
          playsInline
          preload="auto"
          poster="/tuto-pro-poster.jpg"
          style={videoStyle}
        >
          <source src="/tuto-pro.mp4" type="video/mp4" />
          Votre navigateur ne peut pas lire cette vidéo.
        </video>
      )}
      <p className="hint" style={{ textAlign: "center", marginTop: 10 }}>
        {mode === "free"
          ? "Tutoriel vidéo : créer votre profil artiste en 6 étapes (1 min 40)."
          : "Tutoriel vidéo : découvrir la version PRO (1 min 23)."}
      </p>
      <div style={{ textAlign: "center", marginTop: 6 }}>
        {mode === "free" ? (
          <button type="button" className="btn btn-gold" onClick={() => setMode("pro")}>
            Découvrir la version PRO en vidéo
          </button>
        ) : (
          <button type="button" className="btn btn-outline" onClick={() => setMode("free")}>
            Revoir le tutoriel gratuit
          </button>
        )}
      </div>
    </div>
  );
}
