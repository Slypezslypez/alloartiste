import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { checkAllResources } from "@/lib/resourceMonitor";

export const dynamic = "force-dynamic";

// Vérification manuelle, à usage de test/diagnostic : ouvrir cette URL dans le navigateur en
// étant connecté comme administrateur affiche les valeurs brutes récupérées auprès de Cloudflare
// et Neon, sans envoyer d'email ni toucher à l'historique d'alertes (contrairement au cron
// quotidien /api/cron/resource-check). Sert à vérifier que les jetons d'API fonctionnent.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const resources = await checkAllResources();
  return NextResponse.json({ resources });
}
