"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/categories";

const NAV_ITEMS = [
  { href: "/", label: "Accueil" },
  { href: "/#catalogue", label: "Découvrir les Artistes" },
  { href: "/actualites", label: "Actualités & Conseils" },
  { href: "/comment-ca-marche", label: "Comment ça marche" }
];

export function SiteHeader({
  logoPart1 = "ALLO",
  logoPart2 = "ARTISTE",
  backgroundUrl,
  backgroundPositionX = 50,
  backgroundPositionY = 50
}: {
  logoPart1?: string;
  logoPart2?: string;
  backgroundUrl?: string | null;
  backgroundPositionX?: number;
  backgroundPositionY?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [country, setCountry] = useState<string>("Belgique");

  useEffect(() => {
    fetch("/api/artists/me")
      .then((r) => setLoggedIn(r.ok))
      .catch(() => setLoggedIn(false));
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = window.localStorage.getItem("alloartiste_country");
    if (saved) setCountry(saved);
  }, []);

  async function logout() {
    setLoggedIn(false); // mise à jour immédiate de l'affichage, sans attendre le rechargement
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false; // ancre, jamais "active" par elle-même
    return pathname.startsWith(href);
  }

  function changeCountry(value: string) {
    setCountry(value);
    window.localStorage.setItem("alloartiste_country", value);
    window.dispatchEvent(new CustomEvent("alloartiste:country-changed", { detail: value }));
    if (pathname !== "/") {
      router.push(`/?country=${encodeURIComponent(value)}#catalogue`);
    } else {
      document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header>
      {backgroundUrl && (
        <div
          className="header-image-strip"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`
          }}
        />
      )}
      <div className="header-row">
        <Link href="/" className="logo">
          {logoPart1}<span>{logoPart2}</span>
        </Link>

        <div className="nav-actions-group">
          <nav className="desktop-nav">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={`nav-link ${isActive(item.href) ? "nav-link-active" : ""}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="desktop-actions">
            <select
              className="country-select-inline"
              value={country}
              onChange={(e) => changeCountry(e.target.value)}
              aria-label="Pays des artistes recherchés"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Tous">Belgique et France</option>
            </select>
            {loggedIn ? (
              <>
                <Link className={`nav-link ${pathname === "/dashboard" ? "nav-link-active" : ""}`} href="/dashboard">
                  Mon espace
                </Link>
                <button className="nav-link" onClick={logout}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" href="/connexion">
                  Connexion Artiste
                </Link>
                <Link className="nav-link" href="/inscription">
                  Je m&apos;inscris
                </Link>
              </>
            )}
          </div>
        </div>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {isOpen && (
        <div className="mobile-drawer">
          <select
            className="country-select"
            value={country}
            onChange={(e) => changeCountry(e.target.value)}
            aria-label="Pays des artistes recherchés"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Tous">Belgique et France</option>
          </select>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="mobile-link">
              {item.label}
            </Link>
          ))}
          <hr className="mobile-sep" />
          {loggedIn ? (
            <>
              <Link className="navbtn primary" href="/dashboard" style={{ textAlign: "center" }}>
                Mon espace
              </Link>
              <button className="navbtn" onClick={logout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link className="navbtn" href="/connexion" style={{ textAlign: "center" }}>
                Connexion Artiste
              </Link>
              <Link className="navbtn primary" href="/inscription" style={{ textAlign: "center" }}>
                Je m&apos;inscris
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
