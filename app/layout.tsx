import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "./SiteHeader";

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
        <SiteHeader />
        <main>{children}</main>
        <footer>
          <div className="footer-links">
            <Link href="/actualites">Actualités</Link>
            <Link href="/comment-ca-marche">Comment ça marche</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <p>La Coulisse — Annuaire d&apos;artistes pour producteurs &amp; demandeurs de devis</p>
        </footer>
      </body>
    </html>
  );
}
