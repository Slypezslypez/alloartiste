"use client";

import { useState } from "react";

type Lead = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  eventDate: string | null;
  message: string;
  status: "new" | "replied" | "archived";
  createdAt: string;
};

export function DemandesListClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: Lead["status"]) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("Supprimer définitivement ce message ? Cette action est irréversible.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLeads((ls) => ls.filter((l) => l.id !== id));
    } else {
      alert("Échec de la suppression.");
    }
    setDeletingId(null);
  }

  if (leads.length === 0) {
    return <p className="hint">Aucune demande pour le moment.</p>;
  }

  return (
    <div className="lead-list">
      {leads.map((lead) => (
        <div key={lead.id} className={`lead-card lead-${lead.status}`}>
          <div className="lead-header">
            <div>
              <strong>{lead.senderName}</strong>{" "}
              <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value as Lead["status"])} className="lead-status-select">
                <option value="new">Nouveau</option>
                <option value="replied">Traité</option>
                <option value="archived">Archivé</option>
              </select>
              <button
                className="btn btn-outline"
                onClick={() => deleteLead(lead.id)}
                disabled={deletingId === lead.id}
                data-loading={deletingId === lead.id}
                style={{ padding: "6px 12px", fontSize: 12, color: "var(--red)", borderColor: "var(--red)" }}
              >
                {deletingId === lead.id ? "..." : "Supprimer"}
              </button>
            </div>
          </div>
          <p className="lead-message">{lead.message}</p>
          <div className="lead-contact">
            <a href={`mailto:${lead.senderEmail}`}>{lead.senderEmail}</a>
            {lead.senderPhone && <span> · {lead.senderPhone}</span>}
            {lead.eventDate && <span> · Événement : {lead.eventDate}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
