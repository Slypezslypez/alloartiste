import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";
import { deleteObjectByUrl } from "@/lib/storage";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const contract = await prisma.contract.findUnique({ where: { id: params.id } });
  if (!contract || contract.artistId !== artist.id) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  await prisma.contract.delete({ where: { id: contract.id } });
  await deleteObjectByUrl(contract.fileUrl).catch(() => {});
  return NextResponse.json({ ok: true });
}
