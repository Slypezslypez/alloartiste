import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const schema = z.union([
  z.object({ isVerified: z.boolean() }),
  z.object({ extendOneYear: z.literal(true) })
]);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  if ("extendOneYear" in parsed.data) {
    const artist = await prisma.artist.findUnique({ where: { id: params.id }, select: { currentPeriodEnd: true } });
    if (!artist) return NextResponse.json({ error: "Artiste introuvable." }, { status: 404 });

    // Prolonge depuis la date d'expiration actuelle si elle est encore à venir, sinon depuis aujourd'hui
    // (évite de "perdre" du temps déjà payé/offert en repartant systématiquement d'aujourd'hui).
    const base = artist.currentPeriodEnd && artist.currentPeriodEnd.getTime() > Date.now() ? artist.currentPeriodEnd : new Date();
    const newPeriodEnd = new Date(base.getTime() + 365 * 24 * 60 * 60 * 1000);

    const updated = await prisma.artist.update({
      where: { id: params.id },
      data: { subscriptionStatus: "active", currentPeriodEnd: newPeriodEnd }
    });
    return NextResponse.json({ id: updated.id, currentPeriodEnd: updated.currentPeriodEnd });
  }

  const updated = await prisma.artist.update({
    where: { id: params.id },
    data: { isVerified: parsed.data.isVerified }
  });
  return NextResponse.json({ id: updated.id, isVerified: updated.isVerified });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await prisma.artist.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
