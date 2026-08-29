import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EvenementsClient } from "./EvenementsClient";

export const dynamic = "force-dynamic";

export default async function EvenementsPage() {
  const artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");

  // Nettoyage au passage : les événements déjà passés sont supprimés, pas besoin de tâche
  // planifiée pour garder la table légère.
  await prisma.event.deleteMany({ where: { artistId: artist.id, date: { lt: new Date() } } });

  const events = await prisma.event.findMany({ where: { artistId: artist.id }, orderBy: { date: "asc" } });

  return (
    <>
      <Link className="backlink" href="/dashboard">
        ← Retour à mon espace
      </Link>
      <h2 className="section-title">Mes événements</h2>
      <p className="sub" style={{ marginTop: -8, marginBottom: 24 }}>
        Dès qu&apos;un événement est ajouté, un bouton « Mes événements » apparaît sur votre vignette dans
        « Découvrir les artistes » et renvoie vers votre fiche publique, où chaque événement est présenté en
        détail. Les événements passés sont retirés automatiquement.
      </p>

      <EvenementsClient initialEvents={JSON.parse(JSON.stringify(events))} />
    </>
  );
}
