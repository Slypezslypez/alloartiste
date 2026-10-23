import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";
import { verifyTurnstile } from "@/lib/turnstile";

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

  // Vérification anti-robot (Cloudflare Turnstile) avant de révéler le numéro.
  const body = await req.json().catch(() => null);
  const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const isHuman = await verifyTurnstile(typeof body?.turnstileToken === "string" ? body.turnstileToken : undefined, remoteIp);
  if (!isHuman) {
    return NextResponse.json({ error: "Vérification anti-robot échouée." }, { status: 400 });
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
