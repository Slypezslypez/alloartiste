import { Resend } from "resend";
import { renderEmail, escapeHtml, nl2br } from "./emailTemplate";
import type { ResourceStatus } from "./resourceMonitor";

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
      <p style="margin:0 0 10px;font-size:13px;color:#8c8578;">Vous pouvez répondre directement à cet email.</p>
      <p style="margin:0;font-size:12px;color:#8c8578;">
        Astuce : le tout premier échange entre deux adresses email inconnues termine parfois dans les indésirables
        (spam) du destinataire — ce n'est pas un problème de votre côté. Si vous n'avez pas de nouvelles après
        quelques jours, n'hésitez pas à relancer par un autre moyen.
      </p>
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
Vous pouvez répondre directement à cet email, il arrivera chez ${senderName}.

Astuce : le tout premier échange entre deux adresses email inconnues termine parfois dans les indésirables (spam) du destinataire — ce n'est pas un problème de votre côté. Si vous n'avez pas de nouvelles après quelques jours, n'hésitez pas à relancer par un autre moyen.`,
    html
  });
}

// Confirmation envoyée au producteur/organisateur juste après l'envoi de sa demande de contact,
// pour qu'il sache que son message est bien parti et pense à vérifier ses indésirables pour la réponse.
export async function sendContactConfirmationEmail(opts: { senderName: string; senderEmail: string; artistName: string }) {
  const { senderName, senderEmail, artistName } = opts;

  const html = renderEmail({
    title: "Votre message a bien été envoyé",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(senderName)},</p>
      <p style="margin:0 0 14px;">
        Votre demande a bien été transmise à <strong>${escapeHtml(artistName)}</strong>, qui va recevoir votre
        message par email et pourra vous répondre directement.
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Astuce : si vous ne voyez pas la réponse de l'artiste dans votre boîte de réception, pensez à vérifier votre
        dossier <strong>indésirables / spam</strong> — les premiers échanges entre deux adresses inconnues y
        atterrissent parfois par erreur.
      </p>
    `
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: senderEmail,
    subject: `Votre message à ${artistName} a bien été envoyé`,
    text: `Bonjour ${senderName},

Votre demande a bien été transmise à ${artistName}, qui va recevoir votre message par email et pourra vous répondre directement.

Astuce : si vous ne voyez pas la réponse de l'artiste dans votre boîte de réception, pensez à vérifier votre dossier indésirables / spam — les premiers échanges entre deux adresses inconnues y atterrissent parfois par erreur.

L'équipe AlloArtiste`,
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
        Votre profil est visible dans l'annuaire avec un compte gratuit : vous recevez toutes les demandes de devis, la première est lisible gratuitement, les suivantes sont réservées à la version PRO.
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

Votre compte a bien été créé. Votre profil est visible dans l'annuaire avec un compte gratuit : vous recevez toutes les demandes de devis, la première est lisible gratuitement, les suivantes sont réservées à la version PRO.

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
        Une fois confirmé, vous pourrez accéder à votre espace. Votre profil est visible dans l'annuaire avec un compte gratuit : vous recevez toutes les demandes de devis, la première est lisible gratuitement, les suivantes sont réservées à la version PRO.
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

Une fois confirmé, vous pourrez accéder à votre espace. Votre profil est visible dans l'annuaire avec un compte gratuit : vous recevez toutes les demandes de devis, la première est lisible gratuitement, les suivantes sont réservées à la version PRO.

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

export async function sendPromoCodeEmail(recipientEmail: string, code: string) {
  const registerUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/inscription`;
  const html = renderEmail({
    title: "Votre accès gratuit AlloArtiste",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour,</p>
      <p style="margin:0 0 14px;">
        Vous disposez d'un code vous donnant un accès gratuit d'un an à AlloArtiste, l'annuaire d'artistes pour
        producteurs et organisateurs. Il ne vous reste plus qu'à créer votre profil et l'entrer à l'inscription.
      </p>
      <p style="margin:0 0 14px;">
        Votre code : <strong style="font-family:monospace;font-size:16px;letter-spacing:0.05em;">${escapeHtml(code)}</strong>
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">Ce code est à usage unique et ne fonctionnera qu'une seule fois.</p>
    `,
    ctaLabel: "Créer mon profil",
    ctaUrl: registerUrl
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: recipientEmail,
    subject: "Votre accès gratuit AlloArtiste",
    text: `Bonjour,

Vous disposez d'un code vous donnant un accès gratuit d'un an à AlloArtiste, l'annuaire d'artistes pour producteurs et organisateurs. Il ne vous reste plus qu'à créer votre profil et l'entrer à l'inscription.

Votre code : ${code}

Inscrivez-vous ici : ${registerUrl}

Ce code est à usage unique et ne fonctionnera qu'une seule fois.

L'équipe AlloArtiste`,
    html
  });
}

export async function sendPromoExpiredEmail(artistName: string, artistEmail: string) {
  const html = renderEmail({
    title: "Votre accès gratuit AlloArtiste est terminé",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(artistName)},</p>
      <p style="margin:0 0 14px;">
        L'accès gratuit obtenu via votre code promo AlloArtiste est arrivé à son terme. Votre profil n'est donc plus
        visible dans le catalogue pour le moment.
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Vous pouvez réactiver votre visibilité à tout moment en souscrivant un abonnement (39€/an) depuis votre espace.
      </p>
    `,
    ctaLabel: "Réactiver mon profil",
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/dashboard`
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Votre accès gratuit AlloArtiste est terminé",
    text: `Bonjour ${artistName},

L'accès gratuit obtenu via votre code promo AlloArtiste est arrivé à son terme. Votre profil n'est donc plus visible dans le catalogue pour le moment.

Vous pouvez réactiver votre visibilité à tout moment en souscrivant un abonnement (39€/an) depuis votre espace :
${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/dashboard

L'équipe AlloArtiste`,
    html
  });
}

export async function sendPromoExpiryReminderEmail(artistName: string, artistEmail: string, expiryDate: Date) {
  const formattedDate = expiryDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const html = renderEmail({
    title: "Votre accès gratuit se termine bientôt",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(artistName)},</p>
      <p style="margin:0 0 14px;">
        L'accès gratuit obtenu via votre code promo AlloArtiste se termine le <strong>${escapeHtml(formattedDate)}</strong>.
        Passé cette date, votre profil ne sera plus visible dans le catalogue tant qu'un abonnement (39€/an) n'est pas activé.
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Vous pouvez activer votre abonnement à tout moment depuis votre espace, avant ou après cette date.
      </p>
    `,
    ctaLabel: "Accéder à mon espace",
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/dashboard`
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: artistEmail,
    subject: "Votre accès gratuit AlloArtiste se termine bientôt",
    text: `Bonjour ${artistName},

L'accès gratuit obtenu via votre code promo AlloArtiste se termine le ${formattedDate}. Passé cette date, votre profil ne sera plus visible dans le catalogue tant qu'un abonnement (39€/an) n'est pas activé.

Vous pouvez activer votre abonnement à tout moment depuis votre espace, avant ou après cette date :
${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/dashboard

L'équipe AlloArtiste`,
    html
  });
}

// Alerte l'administrateur du site (pas les artistes) quand une ressource technique (stockage,
// temps de calcul...) approche de la limite gratuite d'un fournisseur. Un seul email peut couvrir
// plusieurs ressources en même temps si elles franchissent le seuil le même jour.
export async function sendResourceAlertEmail(resources: ResourceStatus[]) {
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_FROM;

  const rowsHtml = resources
    .map((r) => {
      const percentLabel = r.percent !== null ? `${Math.round(r.percent)}%` : "?";
      return `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #e7e2d8;">${escapeHtml(r.name)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e7e2d8;white-space:nowrap;">${escapeHtml(r.usedLabel)} / ${escapeHtml(r.limitLabel)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e7e2d8;font-weight:700;white-space:nowrap;">${percentLabel}</td>
        </tr>`;
    })
    .join("");

  const html = renderEmail({
    title: "Une ressource du site approche de sa limite",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour,</p>
      <p style="margin:0 0 14px;">
        La vérification quotidienne d'AlloArtiste a détecté qu'au moins une ressource technique approche (ou dépasse)
        le quota gratuit de son fournisseur :
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;margin:0 0 14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #c9922c;">Ressource</th>
            <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #c9922c;">Utilisé / limite</th>
            <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #c9922c;">%</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Pour Cloudflare R2, dépasser le quota gratuit déclenche une facturation. Pour Neon (forfait payant),
        la limite est ton budget mensuel : le montant est facturé le 1er du mois suivant. Ce mail ne sera pas renvoyé avant quelques jours pour la même ressource.
      </p>
    `
  });

  const text = `Ressources techniques AlloArtiste approchant leur limite :

${resources.map((r) => `- ${r.name} : ${r.usedLabel} / ${r.limitLabel} (${r.percent !== null ? Math.round(r.percent) + "%" : "?"})`).join("\n")}
`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: receiver as string,
    subject: "AlloArtiste — une ressource approche de sa limite",
    text,
    html
  });
}

// Prévient l'artiste lui-même (en plus des emails automatiques de Stripe) que son paiement a
// échoué, avec un lien direct vers son espace pour mettre à jour sa carte au plus vite.
export async function sendPaymentFailedArtistEmail(opts: {
  artistName: string;
  artistEmail: string;
  nextAttemptDate?: Date | null;
}) {
  const formattedDate = opts.nextAttemptDate
    ? opts.nextAttemptDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const html = renderEmail({
    title: "Le paiement de votre abonnement a échoué",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(opts.artistName)},</p>
      <p style="margin:0 0 14px;">
        Le renouvellement de votre abonnement AlloArtiste n'a pas pu être prélevé (carte expirée, fonds
        insuffisants, ou banque ayant refusé le paiement).
      </p>
      <p style="margin:0 0 14px;">
        ${formattedDate ? `Une nouvelle tentative automatique aura lieu le <strong>${escapeHtml(formattedDate)}</strong>. ` : ""}
        Pour éviter que votre profil ne devienne invisible du public, mettez à jour votre moyen de
        paiement dès que possible depuis votre espace membre.
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Si votre carte est correcte et que le problème persiste, contactez votre banque ou répondez à
        cet email, nous vous aiderons.
      </p>
    `,
    ctaLabel: "Mettre à jour mon paiement",
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/dashboard`
  });

  const text = `Bonjour ${opts.artistName},

Le renouvellement de votre abonnement AlloArtiste n'a pas pu être prélevé (carte expirée, fonds insuffisants, ou banque ayant refusé le paiement).
${formattedDate ? `Une nouvelle tentative automatique aura lieu le ${formattedDate}. ` : ""}Pour éviter que votre profil ne devienne invisible du public, mettez à jour votre moyen de paiement dès que possible depuis votre espace membre :
${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/dashboard

L'équipe AlloArtiste`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: opts.artistEmail,
    subject: "AlloArtiste — échec du paiement de votre abonnement",
    text,
    html
  });
}

// Alerte à l'administrateur (pas à l'artiste) lorsqu'un paiement d'abonnement échoue, pour être
// prévenu sans avoir à surveiller le dashboard Stripe.
export async function sendPaymentFailedAlertEmail(opts: {
  artistName: string;
  artistEmail: string;
  amount?: string;
  attemptCount?: number;
  nextAttemptDate?: Date | null;
}) {
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_FROM;

  const html = renderEmail({
    title: "Échec d'un paiement d'abonnement",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour,</p>
      <p style="margin:0 0 14px;">
        Le paiement de l'abonnement d'un artiste vient d'échouer sur AlloArtiste :
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;margin:0 0 14px;">
        <tbody>
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;font-weight:700;">Artiste</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;">${escapeHtml(opts.artistName)}</td>
          </tr>
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;font-weight:700;">Email</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;">${escapeHtml(opts.artistEmail)}</td>
          </tr>
          ${opts.amount ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;font-weight:700;">Montant</td><td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;">${escapeHtml(opts.amount)}</td></tr>` : ""}
          ${opts.attemptCount ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;font-weight:700;">Tentative n°</td><td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;">${opts.attemptCount}</td></tr>` : ""}
          ${opts.nextAttemptDate ? `<tr><td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;font-weight:700;">Prochaine tentative</td><td style="padding:6px 10px;border-bottom:1px solid #e7e2d8;">${escapeHtml(opts.nextAttemptDate.toLocaleDateString("fr-BE"))}</td></tr>` : ""}
        </tbody>
      </table>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Stripe retentera automatiquement le prélèvement selon son calendrier habituel. Si tous les
        essais échouent, le profil de l'artiste redeviendra invisible du public à la fin de la
        période déjà payée — aucune action de ta part n'est requise pour l'instant.
      </p>
    `
  });

  const text = `Échec d'un paiement d'abonnement AlloArtiste :

Artiste : ${opts.artistName} (${opts.artistEmail})
${opts.amount ? `Montant : ${opts.amount}\n` : ""}${opts.attemptCount ? `Tentative n° : ${opts.attemptCount}\n` : ""}${opts.nextAttemptDate ? `Prochaine tentative : ${opts.nextAttemptDate.toLocaleDateString("fr-BE")}\n` : ""}`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: receiver as string,
    subject: `AlloArtiste — échec de paiement (${opts.artistName})`,
    text,
    html
  });
}

// Alerte envoyée à l'administrateur à chaque nouvelle inscription d'artiste (le profil étant visible
// automatiquement pendant l'essai, cela permet de le contrôler rapidement).
export async function sendNewArtistAlertEmail(opts: {
  artistName: string;
  artistEmail: string;
  category: string;
  city: string;
  country: string;
  bio: string;
  freeAccessCode: boolean;
  wantsPro?: boolean;
  artistId: string;
}) {
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alloartiste.be";
  const profileUrl = `${siteUrl}/profil/${opts.artistId}`;
  const access = opts.freeAccessCode
    ? "1 an gratuit (code d'invitation)"
    : opts.wantsPro
      ? "Souhaite la VERSION PRO (compte gratuit en attendant l'ouverture des paiements)"
      : "Compte gratuit « découverte » (1 demande lisible)";
  const bioShort = opts.bio.length > 300 ? `${opts.bio.slice(0, 300)}…` : opts.bio;
  const cell = "padding:6px 10px;border-bottom:1px solid #e7e2d8;";

  const html = renderEmail({
    title: "Nouvelle inscription d'artiste",
    bodyHtml: `
      <p style="margin:0 0 14px;">Un nouvel artiste vient de s'inscrire sur AlloArtiste. Son profil est visible dans le catalogue :</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;margin:0 0 14px;">
        <tbody>
          <tr><td style="${cell}font-weight:700;">Nom</td><td style="${cell}">${escapeHtml(opts.artistName)}</td></tr>
          <tr><td style="${cell}font-weight:700;">Email</td><td style="${cell}">${escapeHtml(opts.artistEmail)}</td></tr>
          <tr><td style="${cell}font-weight:700;">Métier</td><td style="${cell}">${escapeHtml(opts.category)}</td></tr>
          <tr><td style="${cell}font-weight:700;">Lieu</td><td style="${cell}">${escapeHtml(opts.city)} (${escapeHtml(opts.country)})</td></tr>
          <tr><td style="${cell}font-weight:700;">Accès</td><td style="${cell}">${escapeHtml(access)}</td></tr>
          ${bioShort ? `<tr><td style="${cell}font-weight:700;">Bio</td><td style="${cell}">${escapeHtml(bioShort)}</td></tr>` : ""}
        </tbody>
      </table>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Si le profil vous semble douteux, vous pouvez le masquer depuis l'administration.
      </p>
    `,
    ctaLabel: "Voir le profil",
    ctaUrl: profileUrl
  });

  const text = `Nouvelle inscription d'artiste sur AlloArtiste :

Nom : ${opts.artistName}
Email : ${opts.artistEmail}
Métier : ${opts.category}
Lieu : ${opts.city} (${opts.country})
Accès : ${access}
${bioShort ? `Bio : ${bioShort}\n` : ""}
Profil : ${profileUrl}`;

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: receiver as string,
    subject: `AlloArtiste — nouvelle inscription (${opts.artistName})`,
    text,
    html
  });
}

// Email « teaser » envoyé à un artiste en compte gratuit lorsqu'il reçoit une demande verrouillée :
// il sait qu'une demande est arrivée, mais ni l'expéditeur ni le message ne sont révélés (ils se débloquent avec l'abonnement).
export async function sendLockedLeadEmail(opts: { artistName: string; artistEmail: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alloartiste.be";
  const html = renderEmail({
    title: "Vous avez reçu une nouvelle demande",
    bodyHtml: `
      <p style="margin:0 0 14px;">Bonjour ${escapeHtml(opts.artistName)},</p>
      <p style="margin:0 0 14px;">
        Un organisateur vient de vous contacter via AlloArtiste. Avec le compte gratuit, une seule demande est lisible :
        celle-ci est réservée à la version PRO.
      </p>
      <p style="margin:0;font-size:13px;color:#8c8578;">
        Pour la lire et répondre à l'organisateur, passez à la version PRO.
      </p>
    `,
    ctaLabel: "Voir la version PRO",
    ctaUrl: `${siteUrl}/version-pro`
  });

  return resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: opts.artistEmail,
    subject: "Vous avez reçu une nouvelle demande — AlloArtiste",
    text: `Bonjour ${opts.artistName},

Un organisateur vient de vous contacter via AlloArtiste. Avec le compte gratuit, une seule demande est lisible : celle-ci est réservée à la version PRO.

Pour la lire et répondre à l'organisateur, passez à la version PRO : ${siteUrl}/version-pro

L'équipe AlloArtiste`,
    html
  });
}
