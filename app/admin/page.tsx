import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { parseSponsorLogos } from "@/lib/sponsors";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect("/admin/login");

  const [artists, leads, messages, articles, settings] = await Promise.all([
    prisma.artist.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, include: { artist: { select: { name: true } } } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.article.findMany({ orderBy: { createdAt: "desc" } }),
    getSiteSettings()
  ]);

  return (
    <AdminClient
      initialArtists={JSON.parse(JSON.stringify(artists))}
      initialLeads={JSON.parse(JSON.stringify(leads))}
      initialMessages={JSON.parse(JSON.stringify(messages))}
      initialArticles={JSON.parse(JSON.stringify(articles))}
      initialSettings={{ ...JSON.parse(JSON.stringify(settings)), sponsorLogos: parseSponsorLogos(settings.sponsorLogos) }}
    />
  );
}
