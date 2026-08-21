"use client";

import { useState } from "react";

export function ContactForm({ artistId, artistName }: { artistId: string; artistName: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/contact/${artistId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderName: fd.get("senderName"),
        senderEmail: fd.get("senderEmail"),
        senderPhone: fd.get("senderPhone") || undefined,
        eventDate: fd.get("eventDate") || undefined,
        message: fd.get("message")
      })
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (!open) {
    return (
      <button className="btn btn-gold" onClick={() => setOpen(true)}>
        ✉ Contacter pour un devis
      </button>
    );
  }

  if (status === "sent") {
    return <p className="success">Votre message a bien été envoyé à {artistName}.</p>;
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 420 }}>
      <label>Votre nom</label>
      <input name="senderName" type="text" required maxLength={80} />
      <label>Votre email</label>
      <input name="senderEmail" type="email" required />
      <div className="field-row">
        <div>
          <label>Votre téléphone (optionnel)</label>
          <input name="senderPhone" type="text" maxLength={30} />
        </div>
        <div>
          <label>Date de l&apos;événement (optionnel)</label>
          <input name="eventDate" type="text" placeholder="ex. 14 juin 2027" maxLength={40} />
        </div>
      </div>
      <label>Votre message</label>
      <textarea name="message" required minLength={10} maxLength={3000} placeholder="Décrivez votre événement, le lieu, le budget..." />
      {status === "error" && <p className="error">L&apos;envoi a échoué, réessayez.</p>}
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-gold" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Envoi..." : "Envoyer le message"}
        </button>
      </div>
    </form>
  );
}
