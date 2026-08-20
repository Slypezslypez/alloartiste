"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function HeaderNav() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/artists/me")
      .then((r) => setLoggedIn(r.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav>
      <Link className="navbtn" href="/">
        Accueil
      </Link>
      {loggedIn ? (
        <>
          <Link className="navbtn" href="/dashboard">
            Mon espace
          </Link>
          <button className="navbtn" onClick={logout}>
            Se déconnecter
          </button>
        </>
      ) : (
        <>
          <Link className="navbtn" href="/connexion">
            Connexion
          </Link>
          <Link className="navbtn primary" href="/inscription">
            Devenir artiste
          </Link>
        </>
      )}
    </nav>
  );
}
