"use client";

import { useState } from "react";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  body: string;
  imageUrl: string | null;
  icon: string;
  gradient: string;
  readTime: string;
  published: boolean;
  createdAt: string;
};

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  category: "Conseils carrière",
  body: "",
  icon: "📰",
  colorFrom: "#d4af37",
  colorTo: "#8b6b1f",
  readTime: "4 min",
  published: true,
  imageUrl: "" as string | null,
  imagePositionX: 50,
  imagePositionY: 50
};

export function AdminArticles({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const knownCategories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  function startCreate() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(a: Article) {
    const [colorFrom, colorTo] = extractColors(a.gradient);
    setForm({
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      body: a.body,
      icon: a.icon,
      colorFrom,
      colorTo,
      readTime: a.readTime,
      published: a.published,
      imageUrl: a.imageUrl,
      imagePositionX: (a as any).imagePositionX ?? 50,
      imagePositionY: (a as any).imagePositionY ?? 50
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  function extractColors(gradient: string): [string, string] {
    const matches = gradient.match(/#[0-9a-fA-F]{3,6}/g);
    if (matches && matches.length >= 2) return [matches[0], matches[1]];
    return ["#d4af37", "#8b6b1f"];
  }

  async function generateWithAI() {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    setAiError(null);
    try {
      const res = await fetch("/api/admin/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la génération.");
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        excerpt: data.excerpt || f.excerpt,
        category: data.category || f.category,
        icon: data.icon || f.icon,
        readTime: data.readTime || f.readTime,
        body: data.body || f.body
      }));
    } catch (err: any) {
      setAiError(err.message || "Échec de la génération.");
    } finally {
      setGenerating(false);
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const presign = await fetch("/api/admin/articles/upload-image", {
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
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      body: form.body,
      icon: form.icon,
      gradient: `linear-gradient(135deg, ${form.colorFrom}, ${form.colorTo})`,
      readTime: form.readTime,
      published: form.published,
      imageUrl: form.imageUrl || null,
      imagePositionX: form.imagePositionX,
      imagePositionY: form.imagePositionY
    };

    const res = editingId
      ? await fetch(`/api/admin/articles/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      : await fetch("/api/admin/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

    setSaving(false);
    if (!res.ok) {
      alert("Échec de l'enregistrement.");
      return;
    }
    const saved = await res.json();
    setArticles((list) => {
      if (editingId) return list.map((a) => (a.id === editingId ? saved : a));
      return [saved, ...list];
    });
    setShowForm(false);
  }

  async function deleteArticle(id: string, title: string) {
    if (!confirm(`Supprimer définitivement l'article "${title}" ?`)) return;
    const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    if (res.ok) setArticles((list) => list.filter((a) => a.id !== id));
  }

  async function togglePublished(a: Article) {
    const res = await fetch(`/api/admin/articles/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !a.published })
    });
    if (res.ok) {
      const updated = await res.json();
      setArticles((list) => list.map((x) => (x.id === a.id ? updated : x)));
    }
  }

  if (showForm) {
    return (
      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>{editingId ? "Modifier l'article" : "Nouvel article"}</h2>

        <div className="ai-generate-box">
          <label style={{ margin: "0 0 8px" }}>✨ Générer un brouillon avec l&apos;IA</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Ex. Comment gérer le trac avant une prestation"
              disabled={generating}
            />
            <button type="button" className="btn btn-gold" onClick={generateWithAI} disabled={generating || !aiTopic.trim()} style={{ whiteSpace: "nowrap" }}>
              {generating ? "Génération..." : "Générer"}
            </button>
          </div>
          {aiError && <p className="error">{aiError}</p>}
          <p className="hint">Le brouillon remplit les champs ci-dessous — relisez et modifiez avant d&apos;enregistrer.</p>
        </div>

        <form onSubmit={save}>
          <label>Titre</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={140} />

          <label>Résumé (affiché sur la carte)</label>
          <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required maxLength={400} style={{ minHeight: 60 }} />

          <div className="field-row">
            <div>
              <label>Rubrique (catégorie)</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                list="rubriques-existantes"
                placeholder="Ex. Conseils carrière"
              />
              <datalist id="rubriques-existantes">
                {knownCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <p className="hint" style={{ marginTop: 4 }}>Choisissez une rubrique existante ou tapez-en une nouvelle.</p>
            </div>
            <div>
              <label>Temps de lecture</label>
              <input value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} placeholder="4 min" />
            </div>
          </div>

          <label>Contenu (séparez les paragraphes par une ligne vide)</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required minLength={20} style={{ minHeight: 220 }} />

          <label>Image de couverture (optionnelle)</label>
          {form.imageUrl ? (
            <div style={{ marginBottom: 10 }}>
              <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                Cliquez sur la photo pour choisir la partie à toujours garder visible (utile si l&apos;image est recadrée sur une carte plus petite).
              </p>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                  setForm((f) => ({ ...f, imagePositionX: Math.max(0, Math.min(100, x)), imagePositionY: Math.max(0, Math.min(100, y)) }));
                }}
                style={{ position: "relative", width: 320, maxWidth: "100%", aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", cursor: "crosshair", border: "1px solid var(--line)" }}
              >
                <img
                  src={form.imageUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${form.imagePositionX}% ${form.imagePositionY}%`, display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `${form.imagePositionX}%`,
                    top: `${form.imagePositionY}%`,
                    width: 16,
                    height: 16,
                    marginLeft: -8,
                    marginTop: -8,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    background: "var(--gold)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.3)"
                  }}
                />
              </div>
              <button type="button" className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12, marginTop: 8 }} onClick={() => setForm({ ...form, imageUrl: "" })}>
                Retirer l&apos;image
              </button>
            </div>
          ) : (
            <>
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              <p className="hint">{uploading ? "Envoi en cours..." : "Sans image, l'icône et le dégradé ci-dessous seront utilisés."}</p>
            </>
          )}

          <div className="field-row">
            <div>
              <label>Icône (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={4} />
            </div>
            <div>
              <label>Couleur 1</label>
              <input type="color" value={form.colorFrom} onChange={(e) => setForm({ ...form, colorFrom: e.target.value })} style={{ height: 44, padding: 4 }} />
            </div>
            <div>
              <label>Couleur 2</label>
              <input type="color" value={form.colorTo} onChange={(e) => setForm({ ...form, colorTo: e.target.value })} style={{ height: 44, padding: 4 }} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} style={{ width: "auto" }} />
            <span style={{ textTransform: "none", fontFamily: "inherit", fontWeight: 500, color: "var(--ink-soft)" }}>Publié (visible sur le site)</span>
          </label>

          <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="panel wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, marginBottom: 0 }}>Articles ({articles.length})</h2>
        <button className="btn btn-gold" onClick={startCreate}>
          + Nouvel article
        </button>
      </div>
      <div className="lead-list">
        {articles.map((a) => (
          <div key={a.id} className="lead-card">
            <div className="lead-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {a.imageUrl ? (
                  <img
                    src={a.imageUrl}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", objectPosition: `${(a as any).imagePositionX ?? 50}% ${(a as any).imagePositionY ?? 50}%`, flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      background: a.gradient
                    }}
                  >
                    {a.icon}
                  </div>
                )}
                <div>
                  <strong>{a.title}</strong>{" "}
                  <br />
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                    {a.category}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className={`admin-tag ${a.published ? "tag-active" : "tag-inactive"}`}>{a.published ? "Publié" : "Brouillon"}</span>
                <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => togglePublished(a)}>
                  {a.published ? "Dépublier" : "Publier"}
                </button>
                <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => startEdit(a)}>
                  Modifier
                </button>
                <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12, color: "var(--red)" }} onClick={() => deleteArticle(a.id, a.title)}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="hint">Aucun article pour le moment.</p>}
      </div>
    </div>
  );
}
