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

/** Vidéo gratuite d'abord ; la vidéo PRO n'apparaît (et ne se charge) qu'à la fin de la première. */
export default function TutoVideos() {
  const [showPro, setShowPro] = useState(false);

  return (
    <>
      <div style={{ margin: "0 0 26px" }}>
        <video
          controls
          playsInline
          preload="metadata"
          poster="/tuto-artistes-poster.jpg"
          style={videoStyle}
          onEnded={() => setShowPro(true)}
        >
          <source src="/tuto-artistes.mp4" type="video/mp4" />
          Votre navigateur ne peut pas lire cette vidéo.
        </video>
        <p className="hint" style={{ textAlign: "center", marginTop: 10 }}>
          Tutoriel vidéo : créer votre profil artiste en 6 étapes (1 min 40).
        </p>
      </div>
      {showPro && (
        <div style={{ margin: "0 0 26px" }}>
          <video
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
          <p className="hint" style={{ textAlign: "center", marginTop: 10 }}>
            Tutoriel vidéo : découvrir la version PRO (1 min 23).
          </p>
        </div>
      )}
    </>
  );
}
