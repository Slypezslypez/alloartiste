import { redirect } from "next/navigation";
import { getCurrentArtist } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");
  if (!artist.emailVerified) redirect("/verifier-email");

  const leads = await prisma.lead.findMany({
    where: { artistId: artist.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const unavailableDates = await prisma.unavailableDate.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "asc" }
  });

  const { passwordHash, ...safe } = artist;
  return (
    <DashboardClient
      initialArtist={JSON.parse(JSON.stringify(safe))}
      initialLeads={JSON.parse(JSON.stringify(leads))}
      initialUnavailableDates={unavailableDates.map((d) => d.date.toISOString().slice(0, 10))}
    />
  );
}
