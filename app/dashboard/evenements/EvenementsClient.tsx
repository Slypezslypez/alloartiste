"use client";

import { useState } from "react";

type EventItem = {
  id: string;
  title: string;
  date: string; // ISO
  description: string | null;
};

const EMPTY_FORM = { title: "", date: "", description: "" };

export function EvenementsClient({ initialEvents }: { initialEvents: EventItem[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startCreate() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function startEdit(ev: EventItem) {
    setForm({ title: ev.title, date: ev.date.slice(0, 10), description: ev.description || "" });
    setEditingId(ev.id);
    setError(null);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    setError(null);

    const payload = { title: form.title.trim(), date: form.date, description: form.description.trim() || null };
    const res = editingId
      ? await fetch(`/api/artists/me/events/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      : await fetch("/api/artists/me/events", {
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
    setEvents((list) => {
      const next = editingId ? list.map((ev) => (ev.id === editingId ? saved : ev)) : [...list, saved];
      return next.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    setShowForm(false);
  }

  async function deleteEvent(id: string) {
    if (!confirm("Supprimer définitivement cet événement ?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/artists/me/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((list) => list.filter((ev) => ev.id !== id));
    } else {
      alert("Échec de la suppression.");
    }
    setDeletingId(null);
  }

  return (
    <div className="panel wide">
      {showForm ? (
        <form onSubmit={save}>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Modifier l'événement" : "Nouvel événement"}</h3>

          <label>Titre</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            maxLength={140}
            placeholder="Ex. Concert au Botanique"
          />

          <label>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />

          <label>Description (optionnelle)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={400}
            style={{ minHeight: 70 }}
            placeholder="Lieu, ville, informations pratiques..."
          />

          {error && <p className="error">{error}</p>}

          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-gold" disabled={saving} data-loading={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Mes événements à venir ({events.length})</h3>
            <button className="btn btn-gold" onClick={startCreate}>
              + Ajouter un événement
            </button>
          </div>

          {events.length === 0 ? (
            <p className="hint">Aucun événement à venir. Ajoutez-en un pour qu&apos;il apparaisse sur votre vignette.</p>
          ) : (
            <div className="lead-list">
              {events.map((ev) => (
                <div key={ev.id} className="lead-card">
                  <div className="lead-header">
                    <div>
                      <strong>{ev.title}</strong>{" "}
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                        {new Date(ev.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => startEdit(ev)}>
                        Modifier
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: 12, color: "var(--red)", borderColor: "var(--red)" }}
                        onClick={() => deleteEvent(ev.id)}
                        disabled={deletingId === ev.id}
                        data-loading={deletingId === ev.id}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  {ev.description && <p className="lead-message">{ev.description}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
