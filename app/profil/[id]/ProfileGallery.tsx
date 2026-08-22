"use client";

import { useState } from "react";

export function ProfileGallery({ photos, artistName, isVerified }: { photos: string[]; artistName: string; isVerified: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mainPhoto = photos[activeIndex] || photos[0];

  return (
    <div className="profile-media-col">
      <div className="profile-main-photo-wrap">
        {isVerified && <span className="profile-verified-ribbon">✓ Profil vérifié</span>}
        {mainPhoto ? (
          <img className="profile-main-photo" src={mainPhoto} alt={`Photo de ${artistName}`} />
        ) : (
          <div className="profile-main-photo profile-main-photo-empty" />
        )}
      </div>

      {photos.length > 1 && (
        <>
          <p className="profile-media-label mono">Galerie médias</p>
          <div className="profile-thumbs">
            {photos.map((p, i) => (
              <img
                key={p}
                src={p}
                alt={`Photo ${i + 1} de ${artistName}`}
                className={`profile-thumb ${i === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
