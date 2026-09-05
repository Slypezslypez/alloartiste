"use client";

import { useState } from "react";

type Contract = {
  id: string;
  clientName: string;
  eventDate: string | null;
  eventLocation: string | null;
  amount: number | null;
  note: string | null;
  fileUrl: string;
  createdAt: string;
};

const EMPTY_FORM = { clientName: "", eventDate: "", eventLocation: "", amount: "", note: "", fileUrl: "" };

export function ContratsClient({ initialContracts }: { initialContracts: Contract[] }) {
  const [contracts, setContracts] = useState(initialContracts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalAmount = contracts.reduce((sum, c) => sum + (c.amount || 0), 0);

  function startCreate() {
    setForm({ ...EMPTY_FORM });
    setError(null);
    setShowForm(true);
  }

  async function uploadFile(file: File) {
    if (file.type !== "application/pdf") {
      alert("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    setUploading(true);
    try {
      const presign = await fetch("/api/artists/me/contracts/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileExt: "pdf", contentType: file.type })
      }).then((r) => r.json());
      if (presign.error) throw new Error(presign.error);

      await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setForm((f) => ({ ...f, fileUrl: presign.publicUrl }));
    } catch {
      alert("L'envoi du fichier a échoué.");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName.trim() || !form.fileUrl) {
      setError("Le nom du client et le fichier PDF du contrat sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      clientName: form.clientName.trim(),
      eventDate: form.eventDate || null,
      eventLocation: form.eventLocation.trim() || null,
      amount: form.amount.trim() ? parseFloat(form.amount) : null,
      note: form.note.trim() || null,
      fileUrl: form.fileUrl
    };

    const res = await fetch("/api/artists/me/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSaving(false);
    if (!res.ok) {
      setError("Échec de l'enregistrement. Vérifiez les champs.");
      return;
    }
    const saved = await res.json();
    setContracts((list) => [saved, ...list]);
    setShowForm(false);
  }

  async function deleteContract(id: string) {
    if (!confirm("Supprimer définitivement ce contrat ?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/artists/me/contracts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContracts((list) => list.filter((c) => c.id !== id));
    } else {
      alert("Échec de la suppression.");
    }
    setDeletingId(null);
  }

  return (
    <div className="panel wide">
      {showForm ? (
        <form onSubmit={save}>
          <h3 style={{ marginTop: 0 }}>Ajouter un contrat</h3>

          <label>Contrat signé (PDF)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <label className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
              {uploading ? "Envoi..." : form.fileUrl ? "Changer le fichier" : "Choisir un fichier PDF"}
              <input
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                disabled={uploading}
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              />
            </label>
            {form.fileUrl && <span className="hint" style={{ margin: 0 }}>✓ Fichier prêt</span>}
          </div>

          <label>Nom du client / organisateur</label>
          <input
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            required
            maxLength={120}
            placeholder="Ex. Mairie de Charleroi"
          />

          <label>Date de l&apos;événement (optionnelle)</label>
          <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />

          <label>Lieu (optionnel)</label>
          <input
            value={form.eventLocation}
            onChange={(e) => setForm({ ...form, eventLocation: e.target.value })}
            maxLength={120}
            placeholder="Ex. Salle des fêtes, Charleroi"
          />

          <label>Montant du cachet en € (optionnel)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Ex. 450"
          />

          <label>Note (optionnelle)</label>
          <textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            maxLength={500}
            style={{ minHeight: 60 }}
            placeholder="Détails utiles pour votre suivi"
          />

          {error && <p className="error">{error}</p>}

          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-gold" disabled={saving || uploading} data-loading={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Mes contrats ({contracts.length})</h3>
            <button className="btn btn-gold" onClick={startCreate}>
              + Ajouter un contrat
            </button>
          </div>
          {contracts.length > 0 && (
            <p className="hint" style={{ marginBottom: 20 }}>
              Total cumulé : <strong>{totalAmount.toLocaleString("fr-BE")} €</strong>
            </p>
          )}

          {contracts.length === 0 ? (
            <p className="hint">Aucun contrat enregistré pour l&apos;instant.</p>
          ) : (
            <div className="lead-list">
              {contracts.map((c) => (
                <div key={c.id} className="lead-card">
                  <div className="lead-header">
                    <div>
                      <strong>{c.clientName}</strong>{" "}
                      {c.eventDate && (
                        <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                          {new Date(c.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} href={c.fileUrl} target="_blank" rel="noopener noreferrer">
                        Voir le PDF
                      </a>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: 12, color: "var(--red)", borderColor: "var(--red)" }}
                        onClick={() => deleteContract(c.id)}
                        disabled={deletingId === c.id}
                        data-loading={deletingId === c.id}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  {c.eventLocation && <p className="lead-message" style={{ marginBottom: 0 }}>📍 {c.eventLocation}</p>}
                  {c.amount != null && (
                    <p className="lead-message" style={{ marginBottom: 0 }}>
                      💶 {c.amount.toLocaleString("fr-BE")} €
                    </p>
                  )}
                  {c.note && <p className="lead-message">{c.note}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
