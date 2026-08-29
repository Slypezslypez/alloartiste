"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact-general", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone") || undefined,
        role: fd.get("role"),
        message: fd.get("message")
      })
    });
    setStatus(res.ok ? "sent" : "error");
  }

  return (
    <div className="panel">
      <h2>Contact</h2>
      <p className="sub">
        Une question, un projet d&apos;événement, ou besoin d&apos;aide pour trouver le bon artiste ? Écrivez-nous.
      </p>

      {status === "sent" ? (
        <p className="success">Votre message a bien été envoyé. Nous revenons vers vous rapidement.</p>
      ) : (
        <form onSubmit={submit}>
          <label>Nom</label>
          <input name="name" type="text" required maxLength={80} />
          <label>Email</label>
          <input name="email" type="email" required />
          <div className="field-row">
            <div>
              <label>Téléphone (optionnel)</label>
              <input name="phone" type="text" maxLength={30} />
            </div>
            <div>
              <label>Vous êtes</label>
              <select name="role" defaultValue="organisateur">
                <option value="organisateur">Organisateur / Producteur</option>
                <option value="artiste">Artiste</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          <label>Message</label>
          <textarea name="message" required minLength={10} maxLength={3000} placeholder="Décrivez votre demande..." />
          {status === "error" && <p className="error">L&apos;envoi a échoué, réessayez.</p>}
          <div style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-gold" disabled={status === "sending"} data-loading={status === "sending"}>
              {status === "sending" ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
