"use client";

import { useEffect, useState } from "react";
import { AvailabilityCalendar } from "@/app/AvailabilityCalendar";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Charge le script Cloudflare Turnstile une seule fois, où qu'il soit utilisé sur le site.
function useTurnstileScript() {
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const scriptId = "cf-turnstile-sdk";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);
}

export function ContactForm({
  artistId,
  artistName,
  unavailableDates = [],
  calendarVisible = false
}: {
  artistId: string;
  artistName: string;
  unavailableDates?: string[];
  calendarVisible?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [eventDate, setEventDate] = useState<string | null>(null);
  useTurnstileScript();

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
        eventDate: (calendarVisible ? eventDate : fd.get("eventDate")) || undefined,
        message: fd.get("message"),
        turnstileToken: fd.get("cf-turnstile-response") || undefined
      })
    });
    setStatus(res.ok ? "sent" : "error");
  }

  return (
    <div className="profile-contact-box">
      <p className="profile-contact-title">✉ Contacter {artistName} par e-mail</p>
      <p className="profile-contact-desc">
        Décrivez votre événement. Votre email est transmis à l&apos;artiste de manière sécurisée, sans jamais exposer
        publiquement son adresse. Aucune commission.
      </p>

      {status === "sent" ? (
        <p className="success">Votre message a bien été envoyé à {artistName}.</p>
      ) : (
        <form onSubmit={submit}>
          <div className="field-row">
            <div>
              <label>Votre nom complet</label>
              <input name="senderName" type="text" required maxLength={80} />
            </div>
            <div>
              <label>Votre email</label>
              <input name="senderEmail" type="email" required />
            </div>
          </div>
          <div className="field-row">
            <div>
              <label>Téléphone (optionnel)</label>
              <input name="senderPhone" type="text" maxLength={30} />
            </div>
            {!calendarVisible && (
              <div>
                <label>Date estimée de l&apos;événement</label>
                <input name="eventDate" type="date" min={new Date().toISOString().split("T")[0]} />
              </div>
            )}
          </div>

          {calendarVisible && (
            <>
              <label>Date estimée de l&apos;événement (optionnel)</label>
              <p className="hint" style={{ marginTop: -4 }}>
                Les dates grisées sont indiquées comme indisponibles par l&apos;artiste.
              </p>
              <AvailabilityCalendar unavailableDates={unavailableDates} pickable selectedDate={eventDate} onSelectDate={setEventDate} />
              {eventDate && (
                <p className="hint" style={{ marginTop: 10 }}>
                  Date sélectionnée : <strong>{new Date(eventDate + "T00:00:00").toLocaleDateString("fr-FR")}</strong>{" "}
                  <button type="button" onClick={() => setEventDate(null)} style={{ background: "none", border: "none", color: "var(--gold-deep)", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                    Retirer
                  </button>
                </p>
              )}
            </>
          )}

          <label>Votre message</label>
          <textarea name="message" required minLength={10} maxLength={3000} placeholder="Décrivez votre événement, le lieu, le budget..." />

          {TURNSTILE_SITE_KEY && <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} style={{ marginTop: 12 }} />}

          {status === "error" && <p className="error">L&apos;envoi a échoué, réessayez.</p>}
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-gold" type="submit" disabled={status === "sending"} data-loading={status === "sending"}>
              {status === "sending" ? "Envoi..." : "Envoyer le message"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
