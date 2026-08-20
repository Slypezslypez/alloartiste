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
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
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
