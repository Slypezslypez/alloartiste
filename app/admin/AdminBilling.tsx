"use client";

import { useEffect, useState } from "react";
import { isSubscriptionVisible } from "@/lib/categories";

type BillingArtist = {
  id: string;
  name: string;
  email: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
};

type InviteCode = {
  code: string;
  usedAt: string | null;
  usedByArtistName: string | null;
};

const PRICE_PER_YEAR = 33; // doit rester cohérent avec SUBSCRIPTION_LABEL dans lib/categories.ts

export function AdminBilling() {
  const [artists, setArtists] = useState<BillingArtist[] | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [statusById, setStatusById] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState<InviteCode[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/billing")
      .then((r) => r.json())
      .then((data) => {
        setArtists(data.artists || []);
        setActiveCount(data.activeCount || 0);
      });
    fetch("/api/admin/invite-codes")
      .then((r) => r.json())
      .then((data) => setCodes(data.codes || []));
  }, []);

  async function resendInvoice(id: string) {
    setSendingId(id);
    setStatusById((s) => ({ ...s, [id]: "" }));
    const res = await fetch(`/api/admin/billing/${id}/resend-invoice`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setSendingId(null);
    setStatusById((s) => ({ ...s, [id]: res.ok ? "Facture envoyée ✓" : data.error || "Échec de l'envoi." }));
  }

  if (!artists) return <p className="hint">Chargement...</p>;

  const usedCodesCount = codes ? codes.filter((c) => c.usedAt).length : 0;

  return (
    <>
      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Comptabilité</h2>
        <p className="sub">Suivi des abonnements Stripe et renvoi des factures aux artistes.</p>

        <div className="stats-row" style={{ marginBottom: 26 }}>
          <div className="stat-box">
            <span className="stat-value">{activeCount}</span>
            <span className="stat-label">Abonnements actifs</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{activeCount * PRICE_PER_YEAR} €</span>
            <span className="stat-label">Revenu annuel estimé</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{artists.length}</span>
            <span className="stat-label">Comptes avec paiement enregistré</span>
          </div>
        </div>

        <div className="lead-list">
          {artists.map((a) => {
            const active = isSubscriptionVisible({
              subscriptionStatus: a.subscriptionStatus,
              currentPeriodEnd: a.currentPeriodEnd ? new Date(a.currentPeriodEnd) : null
            });
            return (
              <div key={a.id} className="lead-card">
                <div className="lead-header">
                  <div>
                    <strong>{a.name}</strong>{" "}
                    <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                      {a.email}
                    </span>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                      {active && a.currentPeriodEnd
                        ? `Renouvellement le ${new Date(a.currentPeriodEnd).toLocaleDateString("fr-FR")}`
                        : "Abonnement inactif"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className={`admin-tag ${active ? "tag-active" : "tag-inactive"}`}>{active ? "Actif" : "Inactif"}</span>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => resendInvoice(a.id)}
                      disabled={sendingId === a.id}
                    >
                      {sendingId === a.id ? "Envoi..." : "Renvoyer la facture"}
                    </button>
                  </div>
                </div>
                {statusById[a.id] && (
                  <p className={statusById[a.id].includes("✓") ? "success" : "error"} style={{ marginTop: 6, marginBottom: 0 }}>
                    {statusById[a.id]}
                  </p>
                )}
              </div>
            );
          })}
          {artists.length === 0 && <p className="hint">Aucun artiste avec un abonnement Stripe pour l&apos;instant.</p>}
        </div>
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Codes promo (accès gratuit)</h2>
        <p className="sub">
          {codes ? `${usedCodesCount} / ${codes.length} codes déjà utilisés.` : "Chargement..."} Chaque code n&apos;est
          valable qu&apos;une seule fois, à donner à l&apos;artiste de ton choix pour qu&apos;il l&apos;entre à l&apos;inscription.
        </p>
        {codes && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {codes.map((c) => (
              <div
                key={c.code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  background: "var(--shell)",
                  borderRadius: 10,
                  padding: "10px 14px"
                }}
              >
                <span className="mono" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
                  {c.code}
                </span>
                {c.usedAt ? (
                  <span className="admin-tag tag-inactive">
                    Utilisé{c.usedByArtistName ? ` par ${c.usedByArtistName}` : ""} le {new Date(c.usedAt).toLocaleDateString("fr-FR")}
                  </span>
                ) : (
                  <span className="admin-tag tag-active">Disponible</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
