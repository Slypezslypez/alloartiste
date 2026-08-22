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

        <p><strong>3. Clause de non-responsabilité</strong></p>
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

        <p><strong>4. Abonnement des artistes</strong></p>
        <p>
          L&apos;abonnement souscrit par l&apos;artiste donne accès à la visibilité de son profil dans le catalogue
          public de la Plateforme pendant la durée de l&apos;abonnement. Il est renouvelable automatiquement chaque
          année, sauf résiliation par l&apos;artiste avant la date de renouvellement, depuis son espace personnel. En
          cas d&apos;interruption ou de panne technique empêchant temporairement l&apos;affichage du profil,
          AlloArtiste s&apos;efforcera de rétablir le service dans les meilleurs délais, sans que cela ne puisse
          donner lieu à un remboursement automatique, sauf disposition légale contraire applicable.
        </p>

        <p><strong>5. Modération et suppression de contenu</strong></p>
        <p>
          AlloArtiste se réserve le droit de suspendre ou supprimer, sans préavis, tout profil dont le contenu serait
          manifestement illicite, trompeur, ou contraire aux présentes conditions, sans que cela ne puisse engager sa
          responsabilité ni donner lieu à indemnisation.
        </p>

        <p><strong>6. Propriété intellectuelle</strong></p>
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

        <p><strong>7. Droit applicable</strong></p>
        <p>
          Les présentes conditions sont régies par le droit belge. Tout litige relatif à leur interprétation ou leur
          exécution relève, à défaut de résolution amiable, des tribunaux compétents de Belgique.
        </p>

        <p style={{ marginTop: 30, fontSize: 13, color: "var(--muted)" }}>
          Ce document est fourni à titre indicatif et ne constitue pas un avis juridique. AlloArtiste recommande de le
          faire valider par un professionnel du droit avant toute publication définitive.
        </p>
      </div>
    </div>
  );
}
