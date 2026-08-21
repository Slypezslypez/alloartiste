import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";
import { createPresignedUpload, deleteObjectByUrl } from "@/lib/storage";
import { MAX_PHOTOS } from "@/lib/categories";

const ALLOWED = ["jpg", "jpeg", "png", "webp"];

// 1) Demande d'une URL pré-signée pour uploader un fichier directement vers le bucket.
const requestSchema = z.object({
  fileExt: z.string().min(1).max(5),
  contentType: z.string().startsWith("image/")
});

export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (artist.photos.length >= MAX_PHOTOS) {
    return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos.` }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !ALLOWED.includes(parsed.data.fileExt.toLowerCase())) {
    return NextResponse.json({ error: "Format d'image non supporté." }, { status: 400 });
  }

  const { uploadUrl, publicUrl } = await createPresignedUpload(
    artist.id,
    parsed.data.fileExt.toLowerCase(),
    parsed.data.contentType
  );

  return NextResponse.json({ uploadUrl, publicUrl });
}

// 2) Une fois le fichier uploadé vers le bucket, on confirme et on l'ajoute au profil.
const confirmSchema = z.object({ publicUrl: z.string().url() });

export async function PUT(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (artist.photos.length >= MAX_PHOTOS) {
    return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos.` }, { status: 400 });
  }

  const parsed = confirmSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const updated = await prisma.artist.update({
    where: { id: artist.id },
    data: { photos: { push: parsed.data.publicUrl } }
  });

  return NextResponse.json({ photos: updated.photos });
}

// 3) Suppression d'une photo.
const deleteSchema = z.object({ url: z.string().url() });

export async function DELETE(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const nextPhotos = artist.photos.filter((p) => p !== parsed.data.url);
  await prisma.artist.update({ where: { id: artist.id }, data: { photos: nextPhotos } });
  deleteObjectByUrl(parsed.data.url).catch(() => {});

  return NextResponse.json({ photos: nextPhotos });
}
