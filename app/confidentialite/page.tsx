import { LEGAL, LEGAL_LAST_UPDATE, hasOperatorIdentity } from "@/lib/legal";

const link = { color: "var(--gold-deep)", fontWeight: 600 } as const;

export default function ConfidentialitePage() {
  return (
    <div className="panel">
      <h2>Politique de confidentialité</h2>
      <p className="sub">AlloArtiste — Dernière mise à jour : {LEGAL_LAST_UPDATE}</p>

      <div className="article-body" style={{ marginTop: 0 }}>
        <p><strong>1. Qui traite vos données</strong></p>
        <p>
          Le responsable du traitement des données personnelles décrites ci-dessous est{" "}
          {hasOperatorIdentity() ? (
            <>
              {LEGAL.operatorName}
              {LEGAL.address ? `, ${LEGAL.address}` : ""}
              {LEGAL.enterpriseNumber ? ` (numéro d'entreprise ${LEGAL.enterpriseNumber})` : ""}
            </>
          ) : (
            "l'exploitant du site AlloArtiste, dont l'identification complète figure sur la page Mentions légales"
          )}
          . Pour toute question ou demande relative à vos données, utilisez la page{" "}
          <a href="/contact" style={link}>Contact</a>
          {LEGAL.contactEmail ? ` ou écrivez à ${LEGAL.contactEmail}` : ""}. Voir aussi les{" "}
          <a href="/mentions-legales" style={link}>Mentions légales</a>.
        </p>

        <p><strong>2. Données collectées</strong></p>
        <p>Selon votre usage du site, nous collectons :</p>
        <p>
          — à l&apos;inscription d&apos;un artiste : nom ou nom de scène, email, mot de passe (stocké sous forme
          hachée, c&apos;est-à-dire non lisible, y compris par nous), catégorie et spécialités, ville et pays,
          biographie, fourchette de prix, photos et vidéos, coordonnées et liens renseignés sur le profil ;<br />
          — dans l&apos;espace artiste : événements, dates d&apos;indisponibilité, messages reçus, et, si vous utilisez
          la fonction « Mes contrats », les documents PDF que vous déposez ainsi que les informations que vous saisissez
          (nom du client ou de l&apos;organisateur, date, lieu, montant, note). Ces contrats peuvent contenir des
          données de tiers : vous êtes responsable de leur dépôt, et ils ne sont visibles que par vous et par
          l&apos;administration du site ;<br />
          — via le formulaire de contact d&apos;un profil : nom, email, téléphone et message de l&apos;organisateur
          qui contacte l&apos;artiste ;<br />
          — via le formulaire de contact général : nom, email et message ;<br />
          — pour les abonnements payants, lorsqu&apos;ils sont ouverts : l&apos;identité et l&apos;état de
          l&apos;abonnement (les données de carte bancaire sont traitées directement par Stripe et ne passent jamais
          par nos serveurs) ;<br />
          — automatiquement : des cookies techniques nécessaires au fonctionnement du site (voir section 7).
        </p>

        <p><strong>3. Finalités et bases légales</strong></p>
        <p>
          — Créer et gérer les comptes, afficher les profils d&apos;artistes dans le catalogue et permettre la mise en
          relation : exécution du service demandé (article 6.1.b du RGPD) ;<br />
          — gérer les abonnements, les factures et les obligations comptables : exécution du contrat et obligation
          légale (6.1.b et 6.1.c) ;<br />
          — envoyer les emails nécessaires au service (confirmation d&apos;adresse, notifications, rappels) :
          exécution du service (6.1.b) ;<br />
          — assurer la sécurité du site et lutter contre le spam et les abus (protection anti-robot, modération) :
          intérêt légitime (6.1.f) ;<br />
          — proposer des suggestions de rédaction (biographie, formules) sur demande de l&apos;artiste : exécution du
          service (6.1.b), voir section 5.
        </p>

        <p><strong>4. Durée de conservation</strong></p>
        <p>
          Les données d&apos;un compte artiste sont conservées tant que le profil existe. En cas de suppression du
          compte (voir les{" "}
          <a href="/conditions" style={link}>Conditions Générales d&apos;Utilisation</a>
          , article 8), les données personnelles associées sont effacées ; elles peuvent subsister de façon
          temporaire dans des sauvegardes techniques, jusqu&apos;à leur remplacement. Les messages échangés via les
          formulaires de contact sont conservés le temps nécessaire au traitement de la demande. Les données de
          facturation sont conservées pendant la durée exigée par la loi comptable.
        </p>

        <p><strong>5. Destinataires et prestataires</strong></p>
        <p>
          Pour fonctionner, nous faisons appel à des prestataires qui traitent des données en notre nom, dans le seul
          cadre du service rendu :
        </p>
        <p>
          — <strong>Vercel</strong> : hébergement du site ;<br />
          — <strong>Neon</strong> : hébergement de la base de données ;<br />
          — <strong>Cloudflare</strong> : stockage des fichiers (R2) et vérification anti-robot (Turnstile) ;<br />
          — <strong>Resend</strong> : envoi des emails ;<br />
          — <strong>Stripe</strong> (et, le cas échéant, <strong>PayPal</strong>) : paiement des abonnements ;<br />
          — <strong>Anthropic</strong> : lorsque vous utilisez les suggestions de rédaction d&apos;une biographie ou de
          formules, le texte que vous saisissez à cette occasion ainsi que votre nom, votre métier et votre ville
          sont transmis à ce prestataire pour générer la suggestion. N&apos;y saisissez pas d&apos;informations
          sensibles ou que vous ne souhaitez pas partager.
        </p>
        <p>
          Les informations publiées sur votre profil sont visibles de tous les visiteurs. Votre adresse email n&apos;est
          jamais affichée publiquement : les organisateurs vous contactent via le formulaire du site.
          AlloArtiste ne vend ni ne loue vos données personnelles.
        </p>

        <p><strong>6. Transferts hors de l&apos;Union européenne</strong></p>
        <p>
          Certains de ces prestataires sont établis aux États-Unis ou peuvent y traiter des données. Ces transferts
          s&apos;appuient sur les garanties prévues par le RGPD (notamment le cadre de protection des données
          UE–États-Unis ou des clauses contractuelles types, selon le prestataire).
        </p>

        <p><strong>7. Cookies</strong></p>
        <p>
          Le site utilise des cookies strictement nécessaires à son fonctionnement : maintien de la session de
          connexion, mémorisation de vos préférences (pays sélectionné, choix relatif à la bannière cookies) et
          vérification anti-robot (Cloudflare Turnstile) sur les formulaires d&apos;inscription et de contact. Ces
          cookies ne servent pas à vous suivre à des fins publicitaires et ne sont partagés avec aucun tiers à cette
          fin.
        </p>

        <p><strong>8. Vos droits</strong></p>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit
          d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données, ainsi que d&apos;un droit
          d&apos;opposition et de limitation du traitement. Vous pouvez exercer ces droits à tout moment via la page{" "}
          <a href="/contact" style={link}>Contact</a>. Vous disposez également du droit d&apos;introduire une
          réclamation auprès de l&apos;Autorité de protection des données (www.autoriteprotectiondonnees.be).
        </p>
      </div>
    </div>
  );
}
