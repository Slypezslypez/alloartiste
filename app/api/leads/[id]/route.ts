import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";
import { isFreeAccount } from "@/lib/categories";
import { lockLeadsForFreeAccount } from "@/lib/leadLock";

const schema = z.object({ status: z.enum(["new", "replied", "archived"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.artistId !== artist.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  // Compte gratuit : une demande verrouillée ne peut être ni lue ni modifiée (la réponse renverrait son contenu).
  if (isFreeAccount(artist)) {
    const all = await prisma.lead.findMany({ where: { artistId: artist.id } });
    const isLocked = lockLeadsForFreeAccount(all, true).find((l) => l.id === lead.id)?.locked;
    if (isLocked) {
      return NextResponse.json({ error: "Demande réservée à la version PRO : passez à la version PRO pour la consulter." }, { status: 403 });
    }
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const updated = await prisma.lead.update({ where: { id: lead.id }, data: { status: parsed.data.status } });
  return NextResponse.json(updated);
}

// Suppression définitive d'une demande (et de tout son fil de conversation, en cascade).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead || lead.artistId !== artist.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  // Compte gratuit : supprimer la demande lisible ferait « glisser » la suivante en lecture libre. On bloque donc
  // la suppression tant que l'abonnement n'est pas actif (l'artiste peut archiver la demande à la place).
  if (isFreeAccount(artist)) {
    return NextResponse.json({ error: "La suppression est réservée à la version PRO. Vous pouvez archiver la demande." }, { status: 403 });
  }

  await prisma.lead.delete({ where: { id: lead.id } });
  return NextResponse.json({ ok: true });
}
