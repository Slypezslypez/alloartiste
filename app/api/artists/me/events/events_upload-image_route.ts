import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentArtist } from "@/lib/auth";
import { createPresignedEventUpload } from "@/lib/storage";

const ALLOWED = ["jpg", "jpeg", "png", "webp"];

const schema = z.object({
  fileExt: z.string().min(1).max(5),
  contentType: z.string().startsWith("image/")
});

export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !ALLOWED.includes(parsed.data.fileExt.toLowerCase())) {
    return NextResponse.json({ error: "Format d'image non supporté." }, { status: 400 });
  }

  const { uploadUrl, publicUrl } = await createPresignedEventUpload(
    artist.id,
    parsed.data.fileExt.toLowerCase(),
    parsed.data.contentType
  );

  return NextResponse.json({ uploadUrl, publicUrl });
}
