import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Incrémente le compteur de vues d'un profil (appelé par le navigateur du visiteur).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await prisma.artist.update({ where: { id: params.id }, data: { views: { increment: 1 } } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
