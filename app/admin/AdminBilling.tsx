"use client";

import { useEffect, useState, type FormEvent } from "react";
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
  id: string;
  code: string;
  email: string | null;
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
  const [newCodeEmail, setNewCodeEmail] = useState("");
  const [creatingCode, setCreatingCode] = useState(false);
  const [createError, setCreateError] = useState("");
  const [mailingCodeId, setMailingCodeId] = useState<string | null>(null);
  const [codeStatusById, setCodeStatusById] = useState<Record<string, string>>({});

  function loadCodes() {
    fetch("/api/admin/invite-codes")
      .then((r) => r.json())
      .then((data) => setCodes(data.codes || []));
  }

  useEffect(() => {
    fetch("/api/admin/billing")
      .then((r) => r.json())
      .then((data) => {
        setArtists(data.artists || []);
        setActiveCount(data.activeCount || 0);
      });
    loadCodes();
  }, []);

  async function resendInvoice(id: string) {
    setSendingId(id);
    setStatusById((s) => ({ ...s, [id]: "" }));
    const res = await fetch(`/api/admin/billing/${id}/resend-invoice`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setSendingId(null);
    setStatusById((s) => ({ ...s, [id]: res.ok ? "Facture envoyée ✓" : data.error || "Échec de l'envoi." }));
  }

  async function createCode(e: FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreatingCode(true);
    const res = await fetch("/api/admin/invite-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newCodeEmail })
    });
    const data = await res.json().catch(() => ({}));
    setCreatingCode(false);
    if (!res.ok) {
      setCreateError(data.error || "Échec de la création.");
      return;
    }
    setNewCodeEmail("");
    loadCodes();
  }

  async function sendCodeEmail(id: string) {
    setMailingCodeId(id);
    setCodeStatusById((s) => ({ ...s, [id]: "" }));
    const res = await fetch("/api/admin/invite-codes/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json().catch(() => ({}));
    setMailingCodeId(null);
    setCodeStatusById((s) => ({ ...s, [id]: res.ok ? "Email envoyé ✓" : data.error || "Échec de l'envoi." }));
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
                      data-loading={sendingId === a.id}
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
          valable qu&apos;une seule fois et offre un an d&apos;accès gratuit à la personne qui l&apos;entre à l&apos;inscription.
        </p>

        <form onSubmit={createCode} style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <input
            type="email"
            required
            placeholder="Email du destinataire"
            value={newCodeEmail}
            onChange={(e) => setNewCodeEmail(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <button type="submit" className="btn btn-gold" disabled={creatingCode} data-loading={creatingCode}>
            {creatingCode ? "Création..." : "Générer un code"}
          </button>
        </form>
        {createError && (
          <p className="error" style={{ marginTop: -10, marginBottom: 14 }}>
            {createError}
          </p>
        )}

        {codes && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {codes.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  background: "var(--shell)",
                  borderRadius: 10,
                  padding: "10px 14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <span className="mono" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
                      {c.code}
                    </span>
                    {c.email && (
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)", marginLeft: 10 }}>
                        {c.email}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {c.usedAt ? (
                      <span className="admin-tag tag-inactive">
                        Utilisé{c.usedByArtistName ? ` par ${c.usedByArtistName}` : ""} le {new Date(c.usedAt).toLocaleDateString("fr-FR")}
                      </span>
                    ) : (
                      <>
                        <span className="admin-tag tag-active">Disponible</span>
                        {c.email && (
                          <button
                            className="btn btn-outline"
                            style={{ padding: "6px 12px", fontSize: 12 }}
                            onClick={() => sendCodeEmail(c.id)}
                            disabled={mailingCodeId === c.id}
                            data-loading={mailingCodeId === c.id}
                          >
                            {mailingCodeId === c.id ? "Envoi..." : "Envoyer le mail"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {codeStatusById[c.id] && (
                  <p className={codeStatusById[c.id].includes("✓") ? "success" : "error"} style={{ margin: 0 }}>
                    {codeStatusById[c.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
