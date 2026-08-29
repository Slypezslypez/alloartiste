import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DemandesListClient } from "./DemandesListClient";

export const dynamic = "force-dynamic";

const VALID_FILTERS = ["new", "replied", "archived"];

export default async function DemandesPage({ searchParams }: { searchParams: { filter?: string } }) {
  const artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");

  const leads = await prisma.lead.findMany({ where: { artistId: artist.id }, orderBy: { createdAt: "desc" } });

  const filter = searchParams.filter && VALID_FILTERS.includes(searchParams.filter) ? searchParams.filter : "all";
  const visible = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const counts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    replied: leads.filter((l) => l.status === "replied").length,
    archived: leads.filter((l) => l.status === "archived").length
  };

  return (
    <>
      <Link className="backlink" href="/dashboard">
        ← Retour à mon espace
      </Link>
      <h2 className="section-title">Message(s) reçu(s)</h2>

      <div className="demandes-filters">
        <Link href="/dashboard/demandes" className={`demandes-filter ${filter === "all" ? "active" : ""}`}>
          Toutes ({counts.all})
        </Link>
        <Link href="/dashboard/demandes?filter=new" className={`demandes-filter ${filter === "new" ? "active" : ""}`}>
          Nouvelles ({counts.new})
        </Link>
        <Link href="/dashboard/demandes?filter=replied" className={`demandes-filter ${filter === "replied" ? "active" : ""}`}>
          Traitées ({counts.replied})
        </Link>
        <Link href="/dashboard/demandes?filter=archived" className={`demandes-filter ${filter === "archived" ? "active" : ""}`}>
          Archivées ({counts.archived})
        </Link>
      </div>

      <DemandesListClient initialLeads={JSON.parse(JSON.stringify(visible))} />
    </>
  );
}
