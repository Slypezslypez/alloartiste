import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect("/admin/login");

  const [artists, leads, messages] = await Promise.all([
    prisma.artist.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, include: { artist: { select: { name: true } } } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  return (
    <AdminClient
      initialArtists={JSON.parse(JSON.stringify(artists))}
      initialLeads={JSON.parse(JSON.stringify(leads))}
      initialMessages={JSON.parse(JSON.stringify(messages))}
    />
  );
}
