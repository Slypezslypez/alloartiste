"use client";

import { useState } from "react";

export default function MotDePasseOubliePage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email") })
    });
    setStatus("sent"); // toujours affiché, que le compte existe ou non
  }

  return (
    <div className="panel">
      <h2>Mot de passe oublié</h2>
      <p className="sub">Indiquez l&apos;email de votre compte artiste, nous vous envoyons un lien pour en choisir un nouveau.</p>

      {status === "sent" ? (
        <p className="success">
          Si un compte existe avec cet email, un lien de réinitialisation vient de vous être envoyé. Pensez à vérifier vos
          spams. Le lien est valable 1 heure.
        </p>
      ) : (
        <form onSubmit={submit}>
          <label>Email</label>
          <input name="email" type="email" required />
          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-gold" disabled={status === "sending"} data-loading={status === "sending"}>
              {status === "sending" ? "Envoi..." : "Envoyer le lien"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
