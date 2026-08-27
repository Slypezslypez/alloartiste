"use client";

import { useEffect, useState } from "react";

type SpecialtyRow = { category: string; specialty: string; count: number };

export function AdminSpecialties() {
  const [rows, setRows] = useState<SpecialtyRow[] | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function keyOf(row: SpecialtyRow) {
    return `${row.category}::${row.specialty}`;
  }

  async function load() {
    const res = await fetch("/api/admin/specialties");
    if (res.ok) setRows(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(row: SpecialtyRow) {
    setEditingKey(keyOf(row));
    setDraft(row.specialty);
    setError(null);
  }

  async function saveRename(row: SpecialtyRow) {
    if (!draft.trim() || draft.trim() === row.specialty) {
      setEditingKey(null);
      return;
    }
    setSavingKey(keyOf(row));
    setError(null);
    const res = await fetch("/api/admin/specialties/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: row.category, oldSpecialty: row.specialty, newSpecialty: draft.trim() })
    });
    setSavingKey(null);
    if (!res.ok) {
      setError("Échec du renommage.");
      return;
    }
    setEditingKey(null);
    await load();
  }

  if (rows === null) return <p className="hint">Chargement...</p>;

  return (
    <div className="panel wide">
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Spécialités</h2>
      <p className="sub">
        Tous les termes de spécialité que les artistes ont ajoutés eux-mêmes, groupés par catégorie. Renommez un
        terme pour corriger une faute ou fusionner deux formulations proches — ça met à jour d&apos;un coup tous les
        profils concernés.
      </p>

      {rows.length === 0 ? (
        <p className="hint">Aucune spécialité renseignée pour le moment.</p>
      ) : (
        <div className="lead-list">
          {rows.map((row) => {
            const key = keyOf(row);
            const isEditing = editingKey === key;
            return (
              <div key={key} className="lead-card">
                <div className="lead-header">
                  <div>
                    <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                      {row.category}
                    </span>
                    <div style={{ marginTop: 4 }}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          maxLength={60}
                          style={{ maxWidth: 260, display: "inline-block" }}
                          autoFocus
                        />
                      ) : (
                        <strong>{row.specialty}</strong>
                      )}{" "}
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                        {row.count} artiste{row.count > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-gold"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => saveRename(row)}
                          disabled={savingKey === key}
                          data-loading={savingKey === key}
                        >
                          Enregistrer
                        </button>
                        <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setEditingKey(null)}>
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => startEdit(row)}>
                        Renommer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
