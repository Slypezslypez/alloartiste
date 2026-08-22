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

function HowItWorksHero() {
  return (
    <div className="how-hero">
      <svg viewBox="0 0 900 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration reliant un artiste et un organisateur d'événements">
        <ellipse cx="450" cy="170" rx="400" ry="150" fill="var(--gold-soft)" />

        {/* petites étincelles décoratives */}
        <circle cx="120" cy="60" r="3" fill="var(--gold)" opacity="0.6" />
        <circle cx="800" cy="90" r="4" fill="var(--gold)" opacity="0.5" />
        <circle cx="770" cy="260" r="3" fill="var(--gold)" opacity="0.6" />
        <circle cx="140" cy="270" r="4" fill="var(--gold)" opacity="0.5" />

        {/* arc de connexion en pointillés */}
        <path d="M255,165 Q450,55 645,165" fill="none" stroke="var(--gold-deep)" strokeWidth="3" strokeDasharray="7,9" strokeLinecap="round" />
        <text x="450" y="92" textAnchor="middle" fontSize="30" fill="var(--gold)">✦</text>

        {/* bulle gauche — artiste / micro */}
        <circle cx="180" cy="170" r="78" fill="var(--white)" stroke="var(--gold)" strokeWidth="2" />
        <rect x="165" y="132" width="30" height="46" rx="15" fill="var(--gold-deep)" />
        <path d="M150,162 a30,30 0 0 0 60,0" stroke="var(--gold-deep)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <line x1="180" y1="192" x2="180" y2="208" stroke="var(--gold-deep)" strokeWidth="4" strokeLinecap="round" />
        <line x1="165" y1="208" x2="195" y2="208" stroke="var(--gold-deep)" strokeWidth="4" strokeLinecap="round" />
        <text x="180" y="278" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="700" fontSize="17" fill="var(--ink)">Artiste</text>

        {/* bulle droite — organisateur / loupe */}
        <circle cx="720" cy="170" r="78" fill="var(--white)" stroke="var(--gold)" strokeWidth="2" />
        <circle cx="712" cy="160" r="20" fill="none" stroke="var(--gold-deep)" strokeWidth="5" />
        <line x1="726" x2="745" y1="174" y2="193" stroke="var(--gold-deep)" strokeWidth="5" strokeLinecap="round" />
        <text x="720" y="278" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="700" fontSize="17" fill="var(--ink)">Organisateur</text>
      </svg>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      <div className="panel">
        <h2>Comment ça marche</h2>
        <p className="sub">Deux parcours simples, sans commission ni intermédiaire.</p>
      </div>

      <div className="panel wide">
        <HowItWorksHero />
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
