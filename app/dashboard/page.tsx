import { redirect } from "next/navigation";
import { getCurrentArtist } from "@/lib/auth";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");

  const { passwordHash, ...safe } = artist;
  return <DashboardClient initialArtist={JSON.parse(JSON.stringify(safe))} />;
}
