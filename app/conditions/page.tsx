export default function ConditionsPage() {
  return (
    <div className="panel">
      <h2>Conditions Générales d&apos;Utilisation</h2>
      <p className="sub">AlloArtiste — Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="article-body" style={{ marginTop: 0 }}>
        <p><strong>1. Objet</strong></p>
        <p>
          AlloArtiste (ci-après « la Plateforme ») est un service de mise en relation entre des artistes indépendants
          et des organisateurs, producteurs, agents ou toute autre personne recherchant une prestation artistique
          (ci-après « les Utilisateurs »). La Plateforme permet aux artistes de créer un profil public et aux
          Utilisateurs de les contacter directement.
        </p>

        <p><strong>2. Rôle d&apos;intermédiaire technique</strong></p>
        <p>
          AlloArtiste agit exclusivement en tant qu&apos;intermédiaire technique de mise en visibilité et de mise en
          relation. La Plateforme n&apos;est partie à aucun contrat, accord verbal ou écrit conclu entre un artiste
          et un organisateur, producteur, agent ou tout autre intervenant. Toute négociation de tarif, tout contrat
          de prestation, toute condition d&apos;exécution, d&apos;annulation ou de paiement relève exclusivement de
          la relation directe entre les parties concernées, en dehors de la Plateforme.
        </p>

        <p><strong>3. Compte utilisateur</strong></p>
        <p>
          Chaque artiste ne peut créer et gérer qu&apos;un seul compte, correspondant à son identité ou à son projet
          artistique réel. La création d&apos;un compte au nom d&apos;un tiers, ou toute usurpation d&apos;identité,
          est interdite. Le titulaire d&apos;un compte est responsable de la confidentialité de ses identifiants de
          connexion : toute action réalisée depuis son compte est réputée avoir été effectuée par lui ou sous sa
          surveillance. En cas de suspicion d&apos;utilisation non autorisée de son compte, l&apos;utilisateur doit en
          informer AlloArtiste sans délai via la page{" "}
          <a href="/contact" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Contact
          </a>
          .
        </p>
        <p>
          Toute information obtenue par un utilisateur au sujet d&apos;un autre utilisateur dans le cadre de
          l&apos;utilisation de la Plateforme (coordonnées, détails d&apos;un projet, tarifs échangés, etc.) doit
          rester confidentielle et ne peut être utilisée à d&apos;autres fins que celles pour lesquelles elle a été
          communiquée. Il est notamment interdit de solliciter un autre utilisateur à des fins commerciales sans
          rapport avec l&apos;objet de la Plateforme.
        </p>
        <p>
          L&apos;utilisation d&apos;outils automatisés pour extraire, copier ou analyser le contenu du site
          (aspiration, « scraping », robots) est interdite, de même que toute tentative de contourner les mesures de
          sécurité mises en place (notamment la vérification anti-robot du formulaire de contact) sans y avoir été
          expressément autorisé.
        </p>

        <p><strong>4. Clause de non-responsabilité</strong></p>
        <p>
          AlloArtiste ne garantit ni la disponibilité continue, ni le fonctionnement sans interruption ni exempt
          d&apos;erreurs du site, notamment en cas de maintenance, de panne technique, de défaillance d&apos;un
          prestataire tiers (hébergement, paiement, messagerie) ou de force majeure. AlloArtiste ne pourra être tenu
          responsable d&apos;une indisponibilité temporaire ou prolongée du service.
        </p>
        <p>
          AlloArtiste décline toute responsabilité concernant :
        </p>
        <p>
          — l&apos;exactitude, la véracité ou l&apos;actualité des informations publiées par les artistes sur leur
          profil (photos, vidéos, bio, tarifs suggérés, disponibilités) ;<br />
          — la qualité, l&apos;exécution, l&apos;annulation, le retard ou tout litige relatif à une prestation
          artistique convenue entre un artiste et un organisateur, producteur, agent ou tout autre intervenant ;<br />
          — tout dommage direct ou indirect, matériel ou immatériel, résultant de l&apos;utilisation ou de
          l&apos;impossibilité d&apos;utiliser la Plateforme, ou résultant d&apos;une mise en relation effectuée par
          son intermédiaire ;<br />
          — les échanges, engagements financiers ou différends survenant entre utilisateurs en dehors de la
          Plateforme.
        </p>
        <p>
          Il appartient à chaque Utilisateur de vérifier l&apos;identité, les références et le sérieux de son
          interlocuteur, et de formaliser tout accord de prestation par un contrat écrit distinct, conclu directement
          entre les parties.
        </p>

        <p><strong>5. Abonnement des artistes</strong></p>
        <p>
          L&apos;abonnement souscrit par l&apos;artiste donne accès à la visibilité de son profil dans le catalogue
          public de la Plateforme pendant la durée de l&apos;abonnement. Il est renouvelable automatiquement chaque
          année, sauf résiliation par l&apos;artiste avant la date de renouvellement, depuis son espace personnel. En
          cas d&apos;interruption ou de panne technique empêchant temporairement l&apos;affichage du profil,
          AlloArtiste s&apos;efforcera de rétablir le service dans les meilleurs délais, sans que cela ne puisse
          donner lieu à un remboursement automatique, sauf disposition légale contraire applicable.
        </p>
        <p>
          AlloArtiste peut proposer ponctuellement à certains artistes un code promotionnel donnant droit à une
          période d&apos;accès gratuit d&apos;une durée déterminée. Ce code est strictement personnel, à usage unique
          et non transférable. À l&apos;issue de la période gratuite, le profil redevient invisible dans le
          catalogue tant qu&apos;un abonnement payant n&apos;a pas été souscrit. AlloArtiste se réserve le droit de
          révoquer un accès obtenu par un code promotionnel en cas d&apos;usage abusif ou frauduleux.
        </p>

        <p><strong>6. Avis et évaluations</strong></p>
        <p>
          Un organisateur ayant contacté un artiste peut être invité à laisser un avis et une note sur le profil de
          celui-ci. Ces avis reflètent l&apos;opinion personnelle de leur auteur et n&apos;engagent pas la
          responsabilité d&apos;AlloArtiste. L&apos;artiste concerné n&apos;a pas de droit de contrôle ou de
          modification sur le contenu d&apos;un avis publié à son sujet.
        </p>
        <p>
          Un artiste estimant qu&apos;un avis publié sur son profil est injurieux, mensonger, dénigrant ou sans
          rapport avec une prestation réelle peut le signaler via la page{" "}
          <a href="/contact" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Contact
          </a>
          . AlloArtiste examinera le signalement et pourra, à sa discrétion, retirer l&apos;avis concerné.
        </p>

        <p><strong>7. Modération et suppression de contenu</strong></p>
        <p>
          AlloArtiste se réserve le droit de suspendre ou supprimer, sans préavis, tout profil dont le contenu serait
          manifestement illicite, trompeur, ou contraire aux présentes conditions, sans que cela ne puisse engager sa
          responsabilité ni donner lieu à indemnisation.
        </p>

        <p><strong>8. Suppression de compte et droit à l&apos;oubli</strong></p>
        <p>
          Tout utilisateur peut demander à tout moment la suppression de son compte et de ses données personnelles en
          en faisant la demande via la page{" "}
          <a href="/contact" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Contact
          </a>
          . Cette suppression entraîne l&apos;effacement définitif et irréversible du profil, de son contenu et des
          informations associées ; elle ne peut être annulée une fois effectuée. La suppression d&apos;un compte
          artiste met fin, le cas échéant, à tout abonnement en cours sans donner lieu à un remboursement de la
          période déjà écoulée.
        </p>

        <p><strong>9. Propriété intellectuelle</strong></p>
        <p>
          Le nom « AlloArtiste », le logo, la structure du site, son design et l&apos;ensemble des éléments qui le
          composent (à l&apos;exception du contenu déposé par les artistes) sont la propriété exclusive
          d&apos;AlloArtiste. Toute reproduction, extraction ou réutilisation non autorisée de ces éléments est
          interdite.
        </p>
        <p>
          Chaque artiste demeure seul titulaire des droits sur les photos, vidéos, textes et tout autre contenu
          qu&apos;il dépose sur son profil. En publiant ce contenu sur la Plateforme, l&apos;artiste garantit être
          titulaire des droits nécessaires (ou disposer des autorisations requises) et accorde à AlloArtiste une
          licence non exclusive, limitée à l&apos;affichage de ce contenu sur le site et ses supports de
          communication, dans le cadre normal du fonctionnement de la Plateforme. Cette licence prend fin à la
          suppression du contenu ou du profil concerné.
        </p>
        <p>
          AlloArtiste ne saurait être tenu responsable d&apos;une violation de droits de propriété intellectuelle
          commise par un artiste via le contenu qu&apos;il publie. Toute personne estimant qu&apos;un contenu publié
          sur la Plateforme porte atteinte à ses droits peut le signaler via la page{" "}
          <a href="/contact" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Contact
          </a>
          .
        </p>

        <p><strong>10. Données personnelles et cookies</strong></p>
        <p>
          Le traitement des données personnelles collectées sur la Plateforme (à l&apos;inscription, via le
          formulaire de contact, ou par les cookies déposés lors de la navigation) est détaillé dans notre{" "}
          <a href="/confidentialite" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Politique de confidentialité
          </a>
          , qui fait partie intégrante des présentes conditions.
        </p>

        <p><strong>11. Droit applicable</strong></p>
        <p>
          Les présentes conditions sont régies par le droit belge. Tout litige relatif à leur interprétation ou leur
          exécution relève, à défaut de résolution amiable, des tribunaux compétents de Belgique.
        </p>

      </div>
    </div>
  );
}
