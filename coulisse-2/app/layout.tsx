import type { Metadata } from "next";
import "./globals.css";
import { HeaderNav } from "./HeaderNav";

export const metadata: Metadata = {
  title: "La Coulisse — Artistes & Producteurs",
  description: "Annuaire d'artistes pour producteurs et demandeurs de devis."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="top-banner">
          <span>✦</span>
          <span>Plateforme de mise en relation entre artistes et organisateurs en Belgique</span>
        </div>
        <header>
          <div className="logo">
            LA <span>COULISSE</span>
          </div>
          <HeaderNav />
        </header>
        <main>{children}</main>
        <footer>La Coulisse — Annuaire d&apos;artistes pour producteurs &amp; demandeurs de devis</footer>
      </body>
    </html>
  );
}
