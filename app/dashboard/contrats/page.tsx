import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContratsClient } from "./ContratsClient";

export const dynamic = "force-dynamic";

export default async function ContratsPage() {
  const artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");

  const contracts = await prisma.contract.findMany({
    where: { artistId: artist.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <Link className="backlink" href="/dashboard">
        ← Retour à mon espace
      </Link>
      <h2 className="section-title">Mes contrats</h2>
      <p className="sub" style={{ marginTop: -8, marginBottom: 24 }}>
        Ajoutez ici les contrats signés avec vos clients (au format PDF) pour garder une trace centralisée de vos
        prestations — client, date, montant. Utile pour votre suivi et votre comptabilité.
      </p>

      <ContratsClient initialContracts={JSON.parse(JSON.stringify(contracts))} />
    </>
  );
}
