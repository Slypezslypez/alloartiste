"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SpotlightArtist = {
  id: string;
  name: string;
  category: string;
  city: string;
  photos: string[];
  rating: number;
  reviewsCount: number;
};

const SLIDE_DURATION_MS = 5000;

export function PromoCarousel({ spotlight, promoImages }: { spotlight: SpotlightArtist[]; promoImages: string[] }) {
  // Slide 0 = le cadre actuel (sélection d'artistes en vedette). Slides suivantes = images ajoutées via admin.
  const slides: React.ReactNode[] =
    spotlight.length > 0
      ? [
          <div className="marquee-photos" key="spotlight">
            {spotlight.map((a) => (
              <Link key={a.id} href={`/profil/${a.id}`} className="spotlight-card">
                <img src={a.photos[0]} alt={a.name} />
                <div className="spotlight-overlay">
                  <span className="spotlight-cat mono">{a.category}</span>
                  <span className="spotlight-name">{a.name}</span>
                  <span className="spotlight-city mono">
                    {a.city || "Belgique"}
                    {a.reviewsCount > 0 ? ` · ★ ${a.rating.toFixed(1)}` : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ]
      : [];

  promoImages.forEach((url, i) => {
    slides.push(<img key={`promo-${i}`} src={url} alt="" className="promo-slide-image" />);
  });

  const total = slides.length;
  const [state, setState] = useState({ active: 0, prev: -1 });

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setState((s) => ({ prev: s.active, active: (s.active + 1) % total }));
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) return null;

  return (
    <div className="promo-carousel">
      {slides.map((slide, i) => (
        <div key={i} className={`promo-slide ${i === state.active ? "active" : i === state.prev ? "prev" : ""}`}>
          {slide}
        </div>
      ))}
    </div>
  );
}
