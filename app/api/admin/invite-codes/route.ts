import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const codes = await prisma.inviteCode.findMany({ orderBy: { code: "asc" } });
  const usedIds = codes.map((c) => c.usedByArtistId).filter((id): id is string => !!id);
  const artists = usedIds.length
    ? await prisma.artist.findMany({ where: { id: { in: usedIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(artists.map((a) => [a.id, a.name]));

  const result = codes.map((c) => ({
    code: c.code,
    usedAt: c.usedAt,
    usedByArtistName: c.usedByArtistId ? nameById.get(c.usedByArtistId) || null : null
  }));

  return NextResponse.json({ codes: result });
}
