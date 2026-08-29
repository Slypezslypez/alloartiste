
export default function ConfidentialitePage() {
  return (
    <div className="panel">
      <h2>Politique de confidentialité</h2>
      <p className="sub">
        AlloArtiste — Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="article-body" style={{ marginTop: 0 }}>
        <p><strong>1. Qui traite vos données</strong></p>
        <p>
          AlloArtiste est responsable du traitement des données personnelles décrites ci-dessous. Pour toute question
          ou demande relative à vos données, contactez-nous via la page{" "}
          <a href="/contact" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Contact
          </a>
          .
        </p>

        <p><strong>2. Données collectées</strong></p>
        <p>
          Selon votre usage du site, nous collectons :
        </p>
        <p>
          — à l&apos;inscription d&apos;un artiste : nom, email, mot de passe (stocké de façon chiffrée), catégorie et
          spécialités, ville et pays, biographie, fourchette de prix, photos et vidéos, et tout autre champ renseigné
          sur le profil ;<br />
          — via le formulaire de contact d&apos;un profil : nom, email, téléphone et message de l&apos;organisateur
          qui contacte l&apos;artiste ;<br />
          — via le formulaire de contact général du site : nom, email et message ;<br />
          — automatiquement lors de la navigation : des cookies techniques nécessaires au fonctionnement du site
          (voir section 5).
        </p>

        <p><strong>3. Finalités du traitement</strong></p>
        <p>
          Ces données sont utilisées pour : créer et afficher les profils d&apos;artistes dans le catalogue public,
          permettre la mise en relation entre artistes et organisateurs, gérer les comptes et abonnements, envoyer les
          emails nécessaires au fonctionnement du service (confirmation, notifications, factures, rappels), et
          assurer la sécurité du site (protection anti-robot des formulaires).
        </p>

        <p><strong>4. Durée de conservation</strong></p>
        <p>
          Les données d&apos;un compte artiste sont conservées tant que le profil existe. En cas de suppression du
          compte (voir les{" "}
          <a href="/conditions" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Conditions Générales d&apos;Utilisation
          </a>
          , article 8), l&apos;ensemble des données personnelles associées est effacé définitivement. Les messages
          échangés via les formulaires de contact sont conservés le temps nécessaire au traitement de la demande.
        </p>

        <p><strong>5. Cookies</strong></p>
        <p>
          Le site utilise des cookies strictement nécessaires à son fonctionnement : maintien de la session de
          connexion, mémorisation de vos préférences (pays sélectionné, choix relatif à la bannière cookies), et
          vérification anti-robot (Cloudflare Turnstile) sur le formulaire de contact. Ces cookies ne servent pas à
          vous suivre à des fins publicitaires et ne sont partagés avec aucun tiers à cette fin.
        </p>

        <p><strong>6. Partage des données avec des prestataires tiers</strong></p>
        <p>
          Pour fonctionner, AlloArtiste fait appel à des prestataires techniques qui traitent certaines données en
          notre nom, dans le seul cadre du service rendu : hébergement du site et de la base de données, envoi des
          emails transactionnels, vérification anti-robot, et traitement des paiements d&apos;abonnement le cas
          échéant. Ces prestataires n&apos;utilisent vos données à aucune autre fin que celle pour laquelle ils sont
          sollicités. AlloArtiste ne vend ni ne loue vos données personnelles à des tiers.
        </p>

        <p><strong>7. Vos droits</strong></p>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit
          d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données, ainsi que d&apos;un
          droit d&apos;opposition et de limitation du traitement. Vous pouvez exercer ces droits à tout moment via la
          page{" "}
          <a href="/contact" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Contact
          </a>
          . Vous disposez également du droit d&apos;introduire une réclamation auprès de l&apos;Autorité de
          protection des données belge.
        </p>

        <p style={{ marginTop: 30, fontSize: 13, color: "var(--muted)" }}>
          Ce document est fourni à titre indicatif et ne constitue pas un avis juridique. AlloArtiste recommande de le
          faire valider par un professionnel du droit avant toute publication définitive.
        </p>
      </div>
    </div>
  );
}
