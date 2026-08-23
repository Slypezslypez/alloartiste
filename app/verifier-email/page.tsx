import { redirect } from "next/navigation";
import { getCurrentArtist } from "@/lib/auth";
import { VerifyEmailClient } from "./VerifyEmailClient";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: { erreur?: string };
}) {
  const artist = await getCurrentArtist();
  if (!artist) redirect("/connexion");
  if (artist.emailVerified) redirect("/dashboard");

  return <VerifyEmailClient email={artist.email} error={searchParams.erreur} />;
}
