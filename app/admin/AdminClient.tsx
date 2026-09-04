"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSubscriptionVisible } from "@/lib/categories";
import { AdminArticles } from "./AdminArticles";
import { AdminSettings } from "./AdminSettings";
import { AdminBilling } from "./AdminBilling";
import { AdminBackup } from "./AdminBackup";
import { AdminSpecialties } from "./AdminSpecialties";

type Artist = {
  id: string;
  name: string;
  email: string;
  category: string;
  city: string;
  isVerified: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
};

type Lead = {
  id: string;
  senderName: string;
  senderEmail: string;
  message: string;
  status: "new" | "replied" | "archived";
  createdAt: string;
  artist: { name: string };
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  message: string;
  status: "new" | "replied" | "archived";
  createdAt: string;
};

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

type Settings = {
  siteName: string;
  logoPart1: string;
  logoPart2: string;
  tagline: string;
  heroLine1: string;
  heroEmphasis: string;
  heroLine2: string;
  heroSubtitle: string;
  statCommissionValue: string;
  statCommissionLabel: string;
  statDirectValue: string;
  statDirectLabel: string;
  spotlightArtistId1: string | null;
  spotlightArtistId2: string | null;
  promoImages: string[];
  sponsorLogos: { imageUrl: string; name: string | null; linkUrl: string | null }[];
  sponsorsBarEnabled: boolean;
  contactReceiverEmail: string | null;
  headerBackgroundUrl: string | null;
  headerBackgroundPositionX: number;
  headerBackgroundPositionY: number;
  howArtistsImageUrl: string | null;
  howArtistsImagePositionX: number;
  howArtistsImagePositionY: number;
  howOrganizersImageUrl: string | null;
  howOrganizersImagePositionX: number;
  howOrganizersImagePositionY: number;
};

export function AdminClient({
  initialArtists,
  initialLeads,
  initialMessages,
  initialArticles,
  initialSettings
}: {
  initialArtists: Artist[];
  initialLeads: Lead[];
  initialMessages: ContactMessage[];
  initialArticles: Article[];
  initialSettings: Settings;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"artists" | "leads" | "messages" | "articles" | "billing" | "backup" | "specialties" | "settings">("artists");
  const [artists, setArtists] = useState(initialArtists);
  const [leads, setLeads] = useState(initialLeads);
  const [messages, setMessages] = useState(initialMessages);
  const [search, setSearch] = useState("");
  const [extendingId, setExtendingId] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function toggleVerified(id: string, current: boolean) {
    const res = await fetch(`/api/admin/artists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !current })
    });
    if (res.ok) {
      setArtists((list) => list.map((a) => (a.id === id ? { ...a, isVerified: !current } : a)));
    }
  }

  async function deleteArtist(id: string, name: string) {
    if (!confirm(`Supprimer définitivement le profil de ${name} ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/admin/artists/${id}`, { method: "DELETE" });
    if (res.ok) setArtists((list) => list.filter((a) => a.id !== id));
  }

  async function extendOneYear(id: string) {
    setExtendingId(id);
    const res = await fetch(`/api/admin/artists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ extendOneYear: true })
    });
    const data = await res.json().catch(() => ({}));
    setExtendingId(null);
    if (res.ok) {
      setArtists((list) =>
        list.map((a) => (a.id === id ? { ...a, subscriptionStatus: "active", currentPeriodEnd: data.currentPeriodEnd } : a))
      );
    }
  }

  async function updateLeadStatus(id: string, status: Lead["status"]) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) setLeads((list) => list.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function updateMessageStatus(id: string, status: ContactMessage["status"]) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) setMessages((list) => list.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  async function deleteMessage(id: string) {
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (res.ok) setMessages((list) => list.filter((m) => m.id !== id));
  }

  const filteredArtists = artists.filter(
    (a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
  );

  const newLeadsCount = leads.filter((l) => l.status === "new").length;
  const newMessagesCount = messages.filter((m) => m.status === "new").length;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Administration
        </h2>
        <button className="navbtn" onClick={logout}>
          Se déconnecter
        </button>
      </div>

      <div className="filters" style={{ marginBottom: 28 }}>
        <button className={`chip ${tab === "artists" ? "active" : ""}`} onClick={() => setTab("artists")}>
          Artistes ({artists.length})
        </button>
        <button className={`chip ${tab === "leads" ? "active" : ""}`} onClick={() => setTab("leads")}>
          Demandes ({leads.length}){newLeadsCount > 0 && ` · ${newLeadsCount} nouvelle${newLeadsCount > 1 ? "s" : ""}`}
        </button>
        <button className={`chip ${tab === "messages" ? "active" : ""}`} onClick={() => setTab("messages")}>
          Messages ({messages.length}){newMessagesCount > 0 && ` · ${newMessagesCount} nouveau${newMessagesCount > 1 ? "x" : ""}`}
        </button>
        <button className={`chip ${tab === "articles" ? "active" : ""}`} onClick={() => setTab("articles")}>
          Actualité conseil ({initialArticles.length})
        </button>
        <button className={`chip ${tab === "billing" ? "active" : ""}`} onClick={() => setTab("billing")}>
          Comptabilité
        </button>
        <button className={`chip ${tab === "backup" ? "active" : ""}`} onClick={() => setTab("backup")}>
          Sauvegarde
        </button>
        <button className={`chip ${tab === "specialties" ? "active" : ""}`} onClick={() => setTab("specialties")}>
          Spécialités
        </button>
        <button className={`chip ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
          Réglages
        </button>
      </div>

      {tab === "artists" && (
        <div className="panel wide">
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 20 }}
          />
          <div className="lead-list">
            {filteredArtists.map((a) => {
              const visible = isSubscriptionVisible({
                subscriptionStatus: a.subscriptionStatus,
                currentPeriodEnd: a.currentPeriodEnd ? new Date(a.currentPeriodEnd) : null
              });
              return (
                <div key={a.id} className="lead-card">
                  <div className="lead-header">
                    <div>
                      <strong>{a.name}</strong>{" "}
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                        {a.category} · {a.city || "—"}
                      </span>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        {a.email}
                        {a.currentPeriodEnd && (
                          <span> · Expire le {new Date(a.currentPeriodEnd).toLocaleDateString("fr-FR")}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className={`admin-tag ${visible ? "tag-active" : "tag-inactive"}`}>
                        {visible ? "Abonné" : "Non abonné"}
                      </span>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                        onClick={() => extendOneYear(a.id)}
                        disabled={extendingId === a.id}
                        data-loading={extendingId === a.id}
                      >
                        {extendingId === a.id ? "..." : "+1 an"}
                      </button>
                      <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => toggleVerified(a.id, a.isVerified)}>
                        {a.isVerified ? "✓ Vérifié" : "Marquer vérifié"}
                      </button>
                      <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12, color: "var(--red)" }} onClick={() => deleteArtist(a.id, a.name)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredArtists.length === 0 && <p className="hint">Aucun artiste trouvé.</p>}
          </div>
        </div>
      )}

      {tab === "leads" && (
        <div className="panel wide">
          <div className="lead-list">
            {leads.map((lead) => (
              <div key={lead.id} className={`lead-card lead-${lead.status}`}>
                <div className="lead-header">
                  <div>
                    <strong>{lead.senderName}</strong>{" "}
                    <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                      → {lead.artist.name} · {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <select value={lead.status} onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead["status"])} className="lead-status-select">
                    <option value="new">Nouveau</option>
                    <option value="replied">Traité</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>
                <p className="lead-message">{lead.message}</p>
                <div className="lead-contact">{lead.senderEmail}</div>
              </div>
            ))}
            {leads.length === 0 && <p className="hint">Aucune demande pour le moment.</p>}
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className="panel wide">
          <div className="lead-list">
            {messages.map((m) => (
              <div key={m.id} className={`lead-card lead-${m.status}`}>
                <div className="lead-header">
                  <div>
                    <strong>{m.name}</strong>{" "}
                    <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                      {m.role} · {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value={m.status} onChange={(e) => updateMessageStatus(m.id, e.target.value as ContactMessage["status"])} className="lead-status-select">
                      <option value="new">Nouveau</option>
                      <option value="replied">Traité</option>
                      <option value="archived">Archivé</option>
                    </select>
                    <button onClick={() => deleteMessage(m.id)} style={{ background: "none", border: "none", color: "var(--red)", fontSize: 16 }}>
                      ×
                    </button>
                  </div>
                </div>
                <p className="lead-message">{m.message}</p>
                <div className="lead-contact">
                  {m.email}
                  {m.phone && ` · ${m.phone}`}
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="hint">Aucun message pour le moment.</p>}
          </div>
        </div>
      )}
      {tab === "articles" && <AdminArticles initialArticles={initialArticles} />}
      {tab === "billing" && <AdminBilling />}
      {tab === "backup" && <AdminBackup />}
      {tab === "specialties" && <AdminSpecialties />}
      {tab === "settings" && (
        <AdminSettings initialSettings={initialSettings} artistOptions={artists.map((a) => ({ id: a.id, name: a.name }))} />
      )}
    </>
  );
}
