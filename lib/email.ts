import { Resend } from "resend";
import { renderEmail, escapeHtml, nl2br } from "./emailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(opts: {
  artistName: string;
  artistEmail: string;
  senderName: string;
  senderEmail: string;
  message: string;
}) {
  const { artistName, artistEmail, senderName, senderEmail, message } = opts;

  const html = renderEmail({
    title: `Nouvelle demande de ${escapeHtml(senderName)}`,
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(artistName)},</p>
      <p style="margin:0 0 14px;">
        <strong>${escapeHtml(senderName)}</strong> (${escapeHtml(senderEmail)}) vous contacte via AlloArtiste au
        sujet d'une prestation :
      </p>
      <p style="margin:0 0 14px;padding:14px 16px;background:#f3f1ec;border-radius:8px;border-left:3px solid #c9922c;">
        ${nl2br(escapeHtml(message))}
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">Vous pouvez répondre directement à cet email.</p>
    `,
    ctaLabel: "Répondre",
    ctaUrl: `mailto:${senderEmail}`
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    reply_to: senderEmail,
    subject: `Demande de devis via AlloArtiste — de ${senderName}`,
    text: `Bonjour ${artistName},

${senderName} (${senderEmail}) vous contacte via AlloArtiste au sujet d'une prestation :

${message}

---
Vous pouvez répondre directement à cet email, il arrivera chez ${senderName}.`,
    html
  });
}

export async function sendGeneralContactEmail(opts: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  message: string;
  receiverOverride?: string;
}) {
  const { name, email, phone, role, message, receiverOverride } = opts;
  const receiver = receiverOverride || process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_FROM;

  const html = renderEmail({
    title: "Nouveau message de contact",
    bodyHtml: `
      <p style="margin:0 0 14px;">
        <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) — ${escapeHtml(phone || "—")}<br>
        Rôle : ${escapeHtml(role)}
      </p>
      <p style="margin:0;padding:14px 16px;background:#f3f1ec;border-radius:8px;border-left:3px solid #c9922c;">
        ${nl2br(escapeHtml(message))}
      </p>
    `,
    ctaLabel: "Répondre",
    ctaUrl: `mailto:${email}`
  });

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
${message}`,
    html
  });
}

export async function sendPasswordResetEmail(artistEmail: string, resetUrl: string) {
  const html = renderEmail({
    title: "Réinitialisation de votre mot de passe",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour,</p>
      <p style="margin:0 0 14px;">
        Vous avez demandé à réinitialiser votre mot de passe sur AlloArtiste. Ce lien est valable 1 heure.
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe actuel
        reste inchangé.
      </p>
    `,
    ctaLabel: "Choisir un nouveau mot de passe",
    ctaUrl: resetUrl
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Réinitialisation de votre mot de passe AlloArtiste",
    text: `Bonjour,

Vous avez demandé à réinitialiser votre mot de passe sur AlloArtiste.

Cliquez sur le lien suivant pour choisir un nouveau mot de passe (valable 1 heure) :
${resetUrl}

Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe actuel reste inchangé.

L'équipe AlloArtiste`,
    html
  });
}

export async function sendWelcomeEmail(artistName: string, artistEmail: string) {
  const html = renderEmail({
    title: "Bienvenue sur AlloArtiste",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(artistName)},</p>
      <p style="margin:0 0 14px;">Votre compte a bien été créé.</p>
      <p style="margin:0;">
        Activez votre abonnement (33€/an) depuis votre espace pour rendre votre profil visible dans le catalogue.
      </p>
    `,
    ctaLabel: "Accéder à mon espace",
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/dashboard`
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Bienvenue sur AlloArtiste",
    text: `Bonjour ${artistName},

Votre compte a bien été créé. Activez votre abonnement (33€/an) depuis votre espace pour rendre votre profil visible dans le catalogue.

À bientôt,
L'équipe AlloArtiste`,
    html
  });
}

export async function sendVerificationEmail(artistName: string, artistEmail: string, verifyUrl: string) {
  const html = renderEmail({
    title: "Confirmez votre adresse email",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(artistName)},</p>
      <p style="margin:0 0 14px;">
        Votre compte AlloArtiste a bien été créé. Il ne reste qu'une étape : confirmez votre adresse email
        (ce lien est valable 24 heures).
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Une fois confirmé, vous pourrez accéder à votre espace et activer votre abonnement (33€/an) pour rendre
        votre profil visible dans le catalogue.
      </p>
    `,
    ctaLabel: "Confirmer mon adresse email",
    ctaUrl: verifyUrl
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Confirmez votre adresse email — AlloArtiste",
    text: `Bonjour ${artistName},

Votre compte AlloArtiste a bien été créé. Il ne reste qu'une étape : confirmez votre adresse email en cliquant sur le lien suivant (valable 24 heures) :
${verifyUrl}

Une fois confirmé, vous pourrez accéder à votre espace et activer votre abonnement (33€/an) pour rendre votre profil visible dans le catalogue.

Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.

L'équipe AlloArtiste`,
    html
  });
}

export async function sendInvoiceEmail(artistName: string, artistEmail: string, invoiceUrl: string, invoiceNumber?: string) {
  const html = renderEmail({
    title: "Votre facture AlloArtiste",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(artistName)},</p>
      <p style="margin:0;">
        Voici le lien vers votre facture d'abonnement AlloArtiste${invoiceNumber ? ` (n°${escapeHtml(invoiceNumber)})` : ""}.
        Vous pouvez la consulter et la télécharger en PDF depuis cette page.
      </p>
    `,
    ctaLabel: "Voir ma facture",
    ctaUrl: invoiceUrl
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: invoiceNumber ? `Votre facture AlloArtiste n°${invoiceNumber}` : "Votre facture AlloArtiste",
    text: `Bonjour ${artistName},

Voici le lien vers votre facture d'abonnement AlloArtiste${invoiceNumber ? ` (n°${invoiceNumber})` : ""} :
${invoiceUrl}

Vous pouvez la consulter et la télécharger en PDF depuis cette page.

L'équipe AlloArtiste`,
    html
  });
}
