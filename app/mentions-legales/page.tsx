import { LEGAL, LEGAL_LAST_UPDATE, hasOperatorIdentity } from "@/lib/legal";

export const metadata = { title: "Mentions légales — AlloArtiste" };

export default function MentionsLegalesPage() {
  return (
    <div className="panel">
      <h2>Mentions légales</h2>
      <p className="sub">AlloArtiste — Dernière mise à jour : {LEGAL_LAST_UPDATE}</p>

      <div className="article-body" style={{ marginTop: 0 }}>
        <p><strong>1. Éditeur du site</strong></p>
        {hasOperatorIdentity() ? (
          <p>
            {LEGAL.operatorName}
            {LEGAL.legalForm ? ` — ${LEGAL.legalForm}` : ""}
            {LEGAL.address && (
              <>
                <br />
                {LEGAL.address}
              </>
            )}
            {LEGAL.enterpriseNumber && (
              <>
                <br />
                Numéro d&apos;entreprise (BCE) : {LEGAL.enterpriseNumber}
              </>
            )}
            {LEGAL.vatNumber && (
              <>
                <br />
                Numéro de TVA : {LEGAL.vatNumber}
              </>
            )}
            {LEGAL.contactEmail && (
              <>
                <br />
                Email : {LEGAL.contactEmail}
              </>
            )}
          </p>
        ) : (
          <p>
            Les informations d&apos;identification de l&apos;exploitant du site (dénomination, adresse, numéro
            d&apos;entreprise et de TVA) seront publiées ici dès la finalisation de sa structure juridique. En
            attendant, vous pouvez nous joindre via la page{" "}
            <a href="/contact" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
              Contact
            </a>
            .
          </p>
        )}

        <p><strong>2. Contact</strong></p>
        <p>
          Pour toute question, réclamation ou demande relative à vos données personnelles, utilisez la page{" "}
          <a href="/contact" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Contact
          </a>
          {LEGAL.contactEmail ? ` ou écrivez à ${LEGAL.contactEmail}` : ""}.
        </p>

        <p><strong>3. Hébergement et prestataires techniques</strong></p>
        <p>
          Le site est hébergé par Vercel Inc. (États-Unis). La base de données est hébergée par Neon (infrastructure
          cloud), les fichiers (photos, vidéos, documents) sont stockés chez Cloudflare (R2), et les emails sont
          envoyés via Resend. Les paiements d&apos;abonnement, lorsqu&apos;ils sont ouverts, sont traités par Stripe.
          Le détail du traitement de vos données figure dans la{" "}
          <a href="/confidentialite" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Politique de confidentialité
          </a>
          .
        </p>

        <p><strong>4. Propriété intellectuelle</strong></p>
        <p>
          Le nom « AlloArtiste », le logo, la structure et le design du site sont protégés. Les contenus publiés par les
          artistes (photos, vidéos, textes) restent la propriété de leurs auteurs. Voir les{" "}
          <a href="/conditions" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
            Conditions Générales d&apos;Utilisation
          </a>
          , article 9.
        </p>

        <p><strong>5. Droit applicable</strong></p>
        <p>
          Le site est soumis au droit belge. Vous pouvez introduire une réclamation relative à vos données personnelles
          auprès de l&apos;Autorité de protection des données (www.autoriteprotectiondonnees.be).
        </p>
      </div>
    </div>
  );
}
