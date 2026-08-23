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
    subject: `Demande de devis via AlloArtiste — de ${senderName}`,
    text: `Bonjour ${artistName},

${senderName} (${senderEmail}) vous contacte via AlloArtiste au sujet d'une prestation :

${message}

---
Vous pouvez répondre directement à cet email, il arrivera chez ${senderName}.`
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

export async function sendPasswordResetEmail(artistEmail: string, resetUrl: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Réinitialisation de votre mot de passe AlloArtiste",
    text: `Bonjour,

Vous avez demandé à réinitialiser votre mot de passe sur AlloArtiste.

Cliquez sur le lien suivant pour choisir un nouveau mot de passe (valable 1 heure) :
${resetUrl}

Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe actuel reste inchangé.

L'équipe AlloArtiste`
  });
}

export async function sendWelcomeEmail(artistName: string, artistEmail: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Bienvenue sur AlloArtiste",
    text: `Bonjour ${artistName},

Votre compte a bien été créé. Activez votre abonnement (33€/an) depuis votre espace pour rendre votre profil visible dans le catalogue.

À bientôt,
L'équipe AlloArtiste`
  });
}

export async function sendVerificationEmail(artistName: string, artistEmail: string, verifyUrl: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Confirmez votre adresse email — AlloArtiste",
    text: `Bonjour ${artistName},

Votre compte AlloArtiste a bien été créé. Il ne reste qu'une étape : confirmez votre adresse email en cliquant sur le lien suivant (valable 24 heures) :
${verifyUrl}

Une fois confirmé, vous pourrez accéder à votre espace et activer votre abonnement (33€/an) pour rendre votre profil visible dans le catalogue.

Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.

L'équipe AlloArtiste`
  });
}

export async function sendInvoiceEmail(artistName: string, artistEmail: string, invoiceUrl: string, invoiceNumber?: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: invoiceNumber ? `Votre facture AlloArtiste n°${invoiceNumber}` : "Votre facture AlloArtiste",
    text: `Bonjour ${artistName},

Voici le lien vers votre facture d'abonnement AlloArtiste${invoiceNumber ? ` (n°${invoiceNumber})` : ""} :
${invoiceUrl}

Vous pouvez la consulter et la télécharger en PDF depuis cette page.

L'équipe AlloArtiste`
  });
}
