import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isFreeAccount } from "@/lib/categories";
import { ProducteursClient } from "./ProducteursClient";

export const dynamic = "force-dynamic";

export default async function ProducteursPage() {
  const artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");

  const locked = isFreeAccount(artist);
  // Compte gratuit : aucune donnée n'est envoyée, seulement le nombre de producteurs.
  const count = await prisma.producer.count({ where: { published: true } });
  const producers = locked ? [] : await prisma.producer.findMany({ where: { published: true }, orderBy: { name: "asc" } });

  return (
    <>
      <Link className="backlink" href="/dashboard">
        ← Retour à mon espace
      </Link>
      <h2 className="section-title">Liste de producteurs</h2>

      {locked ? (
        <div className="card" style={{ padding: 24 }}>
          <p style={{ marginTop: 0 }}>
            <strong>Réservé à la version PRO.</strong> {count > 0 ? `${count} producteurs sont référencés` : "Une liste de producteurs est disponible"} avec
            leurs styles, leur localisation et leurs coordonnées, pour proposer directement votre travail.
          </p>
          <Link href="/version-pro" className="btn btn-gold">
            Découvrir la version PRO
          </Link>
        </div>
      ) : (
        <ProducteursClient initial={JSON.parse(JSON.stringify(producers))} />
      )}
    </>
  );
}
