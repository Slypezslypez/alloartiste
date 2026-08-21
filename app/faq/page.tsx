const FAQ_ITEMS = [
  {
    q: "Combien coûte un profil sur La Coulisse ?",
    a: "L'inscription est gratuite. La visibilité dans le catalogue public nécessite un abonnement annuel, renouvelable automatiquement, résiliable à tout moment depuis votre espace."
  },
  {
    q: "Comment les organisateurs me contactent-ils ?",
    a: "Directement via le formulaire présent sur votre profil public. Vous recevez un email et retrouvez également la demande dans votre espace, sous « Demandes de contact »."
  },
  {
    q: "Combien de photos et vidéos puis-je ajouter ?",
    a: "Jusqu'à 5 photos et 5 vidéos par profil (liens YouTube, Vimeo, ou fichier vidéo direct)."
  },
  {
    q: "Puis-je modifier mon profil à tout moment ?",
    a: "Oui, votre espace personnel vous permet de modifier votre bio, vos coordonnées, vos photos et vos vidéos à tout moment, sans validation préalable."
  },
  {
    q: "La Coulisse prend-elle une commission sur mes contrats ?",
    a: "Non, aucune commission. Vous négociez et gérez vos prestations directement avec les organisateurs qui vous contactent."
  },
  {
    q: "Comment annuler mon abonnement ?",
    a: "Depuis votre espace, le bouton « Gérer / annuler mon abonnement » vous redirige vers un portail sécurisé où vous pouvez arrêter le renouvellement automatique à tout moment."
  }
];

export default function FaqPage() {
  return (
    <div className="panel">
      <h2>Questions fréquentes</h2>
      <p className="sub">Tout ce qu&apos;il faut savoir avant de rejoindre le catalogue.</p>
      <div className="faq-list">
        {FAQ_ITEMS.map((item, i) => (
          <details key={i} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
