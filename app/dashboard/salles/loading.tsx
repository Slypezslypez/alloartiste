// Next.js affiche automatiquement ce fichier pendant que la page principale (page.tsx) fait
// ses recherches (géocodage de la ville + interrogation OpenStreetMap), qui peuvent prendre
// quelques secondes. Sans ça, l'écran ne bouge pas pendant l'attente et donne l'impression
// que le clic n'a rien fait.
export default function Loading() {
  return (
    <div className="page-loading">
      <div className="page-spinner" aria-hidden="true" />
      <p className="hint" style={{ margin: 0 }}>Recherche des salles à proximité en cours...</p>
    </div>
  );
}
