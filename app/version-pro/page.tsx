import Link from "next/link";
import type { Metadata } from "next";
import { PAYMENTS_ENABLED, SUBSCRIPTION_LABEL, MAX_PHOTOS, MAX_VIDEOS, FREE_BIO_MAX, BIO_MAX } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Version PRO — AlloArtiste",
  description: "Compte gratuit ou version PRO : ce qui change pour les artistes."
};

const ROWS: { label: string; free: string; pro: string }[] = [
  { label: "Profil visible dans l'annuaire", free: "Oui", pro: "Oui" },
  { label: "Réception des demandes de devis", free: "Toutes", pro: "Toutes" },
  { label: "Demandes lisibles", free: "Les 2 premières", pro: "Toutes, avec réponse directe" },
  { label: "Photos", free: "1", pro: `Jusqu'à ${MAX_PHOTOS}` },
  { label: "Vidéos", free: "—", pro: `Jusqu'à ${MAX_VIDEOS}` },
  { label: "Biographie", free: `${FREE_BIO_MAX} caractères`, pro: `${BIO_MAX} caractères` },
  { label: "Formules & prestations, citation", free: "—", pro: "Oui" },
  { label: "Téléphone, site web, réseaux sociaux", free: "—", pro: "Oui" }
];

export default function VersionProPage() {
  return (
    <div className="panel">
      <h2>La version PRO</h2>
      <p className="sub">
        Tarif : <strong>{SUBSCRIPTION_LABEL}</strong>, sans commission sur vos contrats. Renouvelable automatiquement et résiliable à tout
        moment.
        {!PAYMENTS_ENABLED && " L'activation de la version PRO sera bientôt disponible."}
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line, #d9d2c3)" }}>
              <th style={{ padding: "10px 8px" }}></th>
              <th style={{ padding: "10px 8px" }}>Compte gratuit</th>
              <th style={{ padding: "10px 8px", color: "var(--gold-deep)" }}>Version PRO</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} style={{ borderBottom: "1px solid var(--line, #d9d2c3)" }}>
                <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r.label}</td>
                <td style={{ padding: "10px 8px", color: "var(--ink-soft)" }}>{r.free}</td>
                <td style={{ padding: "10px 8px" }}>{r.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="btn btn-gold" href="/dashboard">
          Mon espace
        </Link>
        <Link className="btn btn-outline" href="/faq">
          Questions fréquentes
        </Link>
      </div>
    </div>
  );
}
