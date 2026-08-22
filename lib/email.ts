import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(opts: {
  artistName: string;
  artistEmail: string;
  senderName: string;
  senderEmail: string;
  message: string;
}) {
  const { artistName, artistEmail, senderName, senderEmail, message } = opts;

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    reply_to: senderEmail,
    subject: `Demande de devis via La Coulisse — de ${senderName}`,
    text: `Bonjour ${artistName},

${senderName} (${senderEmail}) vous contacte via La Coulisse au sujet d'une prestation :

${message}

---
Vous pouvez répondre directement à cet email, il arrivera chez ${senderName}.`
  });
}

export async function sendGeneralContactEmail(opts: { name: string; email: string; phone?: string; role: string; message: string }) {
  const { name, email, phone, role, message } = opts;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_FROM;

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: receiver as string,
    reply_to: email,
    subject: `Nouveau message de contact (${role}) — ${name}`,
    text: `Nom : ${name}
Email : ${email}
Téléphone : ${phone || "—"}
Rôle : ${role}

Message :
${message}`
  });
}

export async function sendWelcomeEmail(artistName: string, artistEmail: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Bienvenue sur La Coulisse",
    text: `Bonjour ${artistName},

Votre compte a bien été créé. Activez votre abonnement (33€/an) depuis votre espace pour rendre votre profil visible dans le catalogue.

À bientôt,
L'équipe AlloArtiste`
  });
}
