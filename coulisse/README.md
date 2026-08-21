# La Coulisse — annuaire d'artistes (production)

Stack : **Next.js 14** (App Router) · **PostgreSQL** (Prisma) · **Stripe** (abonnement 33€/an récurrent) ·
**Resend** (emails transactionnels) · **S3 / Cloudflare R2** (photos) · déploiement **Vercel**.

## 1. Développement local

```bash
npm install
cp .env.example .env       # puis remplissez les valeurs (voir sections ci-dessous)
npm run db:push            # crée les tables dans votre base PostgreSQL
npm run dev
```

## 2. Base de données — Neon ou Supabase (PostgreSQL gratuit pour démarrer)

1. Créez un projet sur https://neon.tech ou https://supabase.com
2. Copiez la chaîne de connexion PostgreSQL dans `DATABASE_URL`
3. `npm run db:push` pour créer la table `Artist`

## 3. Stripe — abonnement 33€/an renouvelable automatiquement

1. Créez un compte sur https://dashboard.stripe.com
2. **Produits → Ajouter un produit** : "Abonnement artiste — La Coulisse", prix récurrent **33€ / an**
   → copiez l'ID du prix (`price_...`) dans `STRIPE_PRICE_ID`
3. **Développeurs → Clés API** → copiez la clé secrète dans `STRIPE_SECRET_KEY`
4. **Développeurs → Webhooks → Ajouter un endpoint** :
   URL : `https://votre-domaine.com/api/stripe/webhook`
   Événements à écouter : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
   `customer.subscription.updated`, `customer.subscription.deleted`
   → copiez le secret de signature dans `STRIPE_WEBHOOK_SECRET`
5. Activez le **Customer Portal** (Paramètres → Portail client) pour que les artistes puissent annuler
   leur renouvellement automatique depuis leur espace.

Le renouvellement automatique est géré nativement par Stripe : chaque année, Stripe prélève la carte
enregistrée et envoie l'événement `invoice.paid`, qui met à jour `currentPeriodEnd` sur le profil.
Si le paiement échoue, le profil redevient invisible automatiquement (pas de tâche cron nécessaire).

## 4. Emails — Resend

1. Créez un compte sur https://resend.com
2. Vérifiez votre nom de domaine (DNS) pour pouvoir envoyer depuis `contact@votre-domaine.com`
3. Copiez la clé API dans `RESEND_API_KEY` et l'adresse d'envoi dans `EMAIL_FROM`

Le formulaire de contact envoie un vrai email à l'artiste sans jamais exposer son adresse email
publiquement (contrairement au prototype qui utilisait un lien `mailto:`).

## 5. Stockage des photos — Cloudflare R2 (recommandé, sans frais de sortie) ou AWS S3

1. Créez un bucket (R2 ou S3), rendez-le accessible en lecture publique ou passez par un CDN
2. Générez une clé d'accès avec droits lecture/écriture sur ce bucket
3. Renseignez `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`

Les photos sont uploadées **directement du navigateur vers le bucket** via une URL pré-signée
(le serveur ne stocke jamais le fichier lui-même), ce qui est la pratique standard en production.

## 6. Déploiement — Vercel

```bash
npm i -g vercel
vercel
```

Puis dans le dashboard Vercel du projet : **Settings → Environment Variables**, collez toutes les
variables de `.env.example` avec vos vraies valeurs, puis redéployez.

N'oubliez pas de mettre à jour `NEXT_PUBLIC_BASE_URL` avec votre domaine final, et de recréer le
webhook Stripe en pointant vers l'URL de production une fois le domaine connu.

## 7. Ce qui reste à votre charge

- **Mentions légales / CGV / politique de confidentialité** (RGPD) — obligatoires pour un site
  commercial qui collecte des emails et prend des paiements.
- **Modération** : rien n'empêche aujourd'hui un profil frauduleux d'être créé ; ajoutez une validation
  manuelle avant mise en ligne si besoin (un champ `approved: Boolean` sur `Artist` est un bon point de
  départ).
- **Facturation** : Stripe gère le paiement, mais la facturation/TVA vers vos artistes reste votre
  responsabilité légale (Stripe Tax peut aider).

## Structure du projet

```
app/
  page.tsx                     accueil / catalogue public
  profil/[id]/page.tsx         profil public + formulaire de contact
  inscription/page.tsx         création de compte artiste
  connexion/page.tsx           connexion
  dashboard/                   espace artiste protégé (profil, photos, vidéos, abonnement)
  api/
    register, login, logout    authentification
    artists/me/                profil, photos (upload S3), vidéos
    contact/[id]/              envoi d'email au producteur → artiste
    stripe/checkout|portal|webhook
lib/
  prisma.ts, auth.ts, stripe.ts, email.ts, storage.ts, categories.ts
prisma/schema.prisma           modèle de données
```
