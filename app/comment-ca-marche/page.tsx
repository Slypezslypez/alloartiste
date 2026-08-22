import Link from "next/link";

const ARTIST_STEPS = [
  { title: "Créez votre profil", text: "Nom, catégorie, ville, bio, photos et vidéos — en quelques minutes." },
  { title: "Activez votre abonnement", text: "Rendez votre profil visible dans le catalogue public, renouvelable automatiquement." },
  { title: "Recevez des demandes", text: "Les organisateurs vous contactent directement, sans intermédiaire ni commission." }
];

const ORGANIZER_STEPS = [
  { title: "Parcourez le catalogue", text: "Filtrez par ville, discipline, ou recherchez un nom précis." },
  { title: "Consultez le profil", text: "Photos, vidéos, note, avis, coordonnées — tout ce qu'il faut pour décider." },
  { title: "Contactez l'artiste", text: "Envoyez votre demande directement depuis le profil, gratuitement." }
];

export default function HowItWorksPage() {
  return (
    <>
      <div className="panel">
        <h2>Comment ça marche</h2>
        <p className="sub">Deux parcours simples, sans commission ni intermédiaire.</p>
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Pour les artistes</h2>
        <div className="steps-grid">
          {ARTIST_STEPS.map((s, i) => (
            <div key={i} className="step-box">
              <span className="step-num">{i + 1}</span>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <Link className="btn btn-gold" href="/inscription" style={{ marginTop: 22, display: "inline-block" }}>
          Créer mon profil
        </Link>
      </div>

      <div className="panel wide">
        <h2 style={{ fontSize: 24 }}>Pour les organisateurs</h2>
        <div className="steps-grid">
          {ORGANIZER_STEPS.map((s, i) => (
            <div key={i} className="step-box">
              <span className="step-num">{i + 1}</span>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <Link className="btn btn-outline" href="/#catalogue" style={{ marginTop: 22, display: "inline-block" }}>
          Découvrir les artistes
        </Link>
      </div>
    </>
  );
}
