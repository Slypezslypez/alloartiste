import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";
import { MAX_VIDEOS } from "@/lib/categories";

const addSchema = z.object({ url: z.string().url() });

export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (artist.videos.length >= MAX_VIDEOS) {
    return NextResponse.json({ error: `Maximum ${MAX_VIDEOS} vidéos.` }, { status: 400 });
  }

  const parsed = addSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Lien invalide." }, { status: 400 });

  const updated = await prisma.artist.update({
    where: { id: artist.id },
    data: { videos: { push: parsed.data.url } }
  });

  return NextResponse.json({ videos: updated.videos });
}

const deleteSchema = z.object({ url: z.string().url() });

export async function DELETE(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const nextVideos = artist.videos.filter((v) => v !== parsed.data.url);
  await prisma.artist.update({ where: { id: artist.id }, data: { videos: nextVideos } });

  return NextResponse.json({ videos: nextVideos });
}
