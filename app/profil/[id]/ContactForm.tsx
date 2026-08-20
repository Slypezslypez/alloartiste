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
      <label>Votre message</label>
      <textarea name="message" required minLength={10} maxLength={3000} placeholder="Décrivez votre événement, la date, le lieu, le budget..." />
      {status === "error" && <p className="error">L&apos;envoi a échoué, réessayez.</p>}
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-gold" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Envoi..." : "Envoyer le message"}
        </button>
      </div>
    </form>
  );
}
