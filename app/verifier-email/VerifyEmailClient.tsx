"use client";

import { useState } from "react";

export function VerifyEmailClient({ email, error }: { email: string; error?: string }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    setSending(true);
    setMessage(null);
    const res = await fetch("/api/verify-email/resend", { method: "POST" });
    setSending(false);
    setMessage(res.ok ? "Un nouvel email de confirmation vient d'être envoyé." : "Échec de l'envoi. Réessayez dans un instant.");
  }

  return (
    <div className="panel">
      <h2>Confirmez votre adresse email</h2>
      <p className="sub">
        Nous avons envoyé un lien de confirmation à <strong>{email}</strong>. Cliquez sur ce lien pour activer votre
        compte et accéder à votre espace.
      </p>

      {error === "lien_expire" && <p className="error">Ce lien a expiré. Demandez-en un nouveau ci-dessous.</p>}
      {error === "lien_invalide" && <p className="error">Ce lien n&apos;est pas valide. Demandez-en un nouveau ci-dessous.</p>}

      <button className="btn btn-gold" onClick={resend} disabled={sending} data-loading={sending}>
        {sending ? "Envoi..." : "Renvoyer l'email de confirmation"}
      </button>

      {message && <p className={message.includes("Échec") ? "error" : "success"}>{message}</p>}
    </div>
  );
}
