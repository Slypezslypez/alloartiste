import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "./SiteHeader";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "AlloArtiste — Artistes & Producteurs",
  description: "Annuaire d'artistes pour producteurs et demandeurs de devis."
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

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
          <span>{settings.tagline}</span>
        </div>
        <SiteHeader logoPart1={settings.logoPart1} logoPart2={settings.logoPart2} />
        <main>{children}</main>
        <footer>
          <div className="footer-links">
            <Link href="/actualites">Actualités</Link>
            <Link href="/comment-ca-marche">Comment ça marche</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/conditions">CGU</Link>
          </div>
          <p>{settings.siteName} — Annuaire d&apos;artistes pour producteurs &amp; demandeurs de devis</p>
        </footer>
      </body>
    </html>
  );
}
