import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";

// Le numéro de téléphone n'est jamais écrit dans le HTML de la fiche (pour décourager les robots de
// collecte) : il n'est renvoyé que sur demande explicite (clic sur « Afficher le numéro »),
// uniquement pour un profil visible et uniquement depuis le site lui-même.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  }

  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    select: { phone: true, subscriptionStatus: true, currentPeriodEnd: true }
  });
  if (!artist || !artist.phone || !isSubscriptionVisible(artist)) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  return NextResponse.json({ phone: artist.phone }, { headers: { "Cache-Control": "no-store" } });
}
