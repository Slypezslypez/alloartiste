"use client";

import { useEffect, useState } from "react";

type Producer = {
  id: string;
  name: string;
  company: string | null;
  genres: string | null;
  city: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  published: boolean;
};

const EMPTY = { name: "", company: "", genres: "", city: "", country: "", email: "", phone: "", website: "", notes: "" };

export function AdminProducers() {
  const [items, setItems] = useState<Producer[]>([]);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/producers");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  const clean = () => Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]));

  async function save() {
    setMsg("");
    const body = { ...clean(), name: form.name.trim() };
    const res = await fetch(editId ? `/api/admin/producers/${editId}` : "/api/admin/producers", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      setMsg("Erreur : le nom est obligatoire (2 caractères minimum).");
      return;
    }
    setForm(EMPTY);
    setEditId(null);
    setMsg("Enregistré.");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce producteur ?")) return;
    await fetch(`/api/admin/producers/${id}`, { method: "DELETE" });
    load();
  }

  async function toggle(p: Producer) {
    await fetch(`/api/admin/producers/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published })
    });
    load();
  }

  function edit(p: Producer) {
    setEditId(p.id);
    setForm({
      name: p.name,
      company: p.company || "",
      genres: p.genres || "",
      city: p.city || "",
      country: p.country || "",
      email: p.email || "",
      phone: p.phone || "",
      website: p.website || "",
      notes: p.notes || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const field = (key: keyof typeof EMPTY, label: string, wide = false) => (
    <label style={{ display: "block", gridColumn: wide ? "1 / -1" : undefined }}>
      <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>{label}</span>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(128,128,128,.4)", background: "transparent", color: "inherit" }}
      />
    </label>
  );

  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>{editId ? "Modifier le producteur" : "Ajouter un producteur"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 12 }}>
        {field("name", "Nom *")}
        {field("company", "Société / label")}
        {field("genres", "Styles (séparés par des virgules)")}
        {field("city", "Ville")}
        {field("country", "Pays")}
        {field("email", "E-mail")}
        {field("phone", "Téléphone")}
        {field("website", "Site web")}
        {field("notes", "Notes (ce qu'il recherche, comment le contacter…)", true)}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 28 }}>
        <button className="btn btn-gold" onClick={save}>
          {editId ? "Enregistrer" : "Ajouter"}
        </button>
        {editId && (
          <button className="btn btn-outline" onClick={() => { setEditId(null); setForm(EMPTY); }}>
            Annuler
          </button>
        )}
        {msg && <span className="hint">{msg}</span>}
      </div>

      <h3 style={{ marginBottom: 12 }}>Producteurs ({items.length})</h3>
      {items.length === 0 && <p className="hint">Aucun producteur pour le moment.</p>}
      {items.map((p) => (
        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "10px 0", borderTop: "1px solid rgba(128,128,128,.25)" }}>
          <div>
            <strong>{p.name}</strong>
            {p.company ? ` — ${p.company}` : ""}
            {!p.published && <em style={{ marginLeft: 8, opacity: 0.7 }}>(masqué)</em>}
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {[p.genres, p.city, p.country, p.email].filter(Boolean).join(" · ")}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" onClick={() => edit(p)}>Modifier</button>
            <button className="btn btn-outline" onClick={() => toggle(p)}>{p.published ? "Masquer" : "Publier"}</button>
            <button className="btn btn-outline" onClick={() => remove(p.id)}>Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}
