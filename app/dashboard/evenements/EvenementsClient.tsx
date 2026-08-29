"use client";

import { useState } from "react";
import { compressImage } from "@/lib/imageCompress";

type EventItem = {
  id: string;
  title: string;
  date: string; // ISO
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  bookingLink: string | null;
};

const EMPTY_FORM = { title: "", date: "", description: "", location: "", imageUrl: "", bookingLink: "" };

// Convertit une date ISO en valeur compatible avec <input type="datetime-local">.
function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EvenementsClient({ initialEvents }: { initialEvents: EventItem[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startCreate() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function startEdit(ev: EventItem) {
    setForm({
      title: ev.title,
      date: toDatetimeLocalValue(ev.date),
      description: ev.description || "",
      location: ev.location || "",
      imageUrl: ev.imageUrl || "",
      bookingLink: ev.bookingLink || ""
    });
    setEditingId(ev.id);
    setError(null);
    setShowForm(true);
  }

  async function uploadImage(rawFile: File) {
    setUploadingImage(true);
    try {
      const file = await compressImage(rawFile);
      const ext = file.name.split(".").pop() || "jpg";
      const presign = await fetch("/api/artists/me/events/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileExt: ext, contentType: file.type })
      }).then((r) => r.json());
      if (presign.error) throw new Error(presign.error);

      await fetch(presign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setForm((f) => ({ ...f, imageUrl: presign.publicUrl }));
    } catch {
      alert("L'envoi de l'image a échoué.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      date: form.date,
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      imageUrl: form.imageUrl || null,
      bookingLink: form.bookingLink.trim() || null
    };
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
      setError("Échec de l'enregistrement. Vérifiez les champs (le lien de réservation doit être une URL complète, ex. https://...).");
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

          <label>Illustration (optionnelle)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt=""
                style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }}
              />
            )}
            <label className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>
              {uploadingImage ? "Envoi..." : form.imageUrl ? "Changer l'image" : "Ajouter une image"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={uploadingImage}
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
              />
            </label>
            {form.imageUrl && (
              <button type="button" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setForm({ ...form, imageUrl: "" })}>
                Retirer
              </button>
            )}
          </div>

          <label>Titre</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            maxLength={140}
            placeholder="Ex. Concert au Botanique"
          />

          <label>Date et heure</label>
          <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />

          <label>Lieu (optionnel)</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            maxLength={200}
            placeholder="Ex. Le Botanique, Rue Royale 236, Bruxelles"
          />

          <label>Lien de réservation (optionnel)</label>
          <input
            type="url"
            value={form.bookingLink}
            onChange={(e) => setForm({ ...form, bookingLink: e.target.value })}
            placeholder="https://..."
          />

          <label>Description (optionnelle)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={400}
            style={{ minHeight: 70 }}
            placeholder="Informations pratiques, programme, etc."
          />

          {error && <p className="error">{error}</p>}

          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-gold" disabled={saving || uploadingImage} data-loading={saving}>
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
            <p className="hint">Aucun événement à venir. Ajoutez-en un pour qu&apos;il apparaisse sur votre fiche.</p>
          ) : (
            <div className="lead-list">
              {events.map((ev) => (
                <div key={ev.id} className="lead-card">
                  <div className="lead-header">
                    <div>
                      <strong>{ev.title}</strong>{" "}
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                        {new Date(ev.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        {" · "}
                        {new Date(ev.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
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
                  {ev.location && <p className="lead-message" style={{ marginBottom: 0 }}>📍 {ev.location}</p>}
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
