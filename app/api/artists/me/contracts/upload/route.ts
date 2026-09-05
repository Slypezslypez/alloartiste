import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentArtist } from "@/lib/auth";
import { createPresignedContractUpload } from "@/lib/storage";

const ALLOWED = ["pdf"];

const schema = z.object({
  fileExt: z.string().min(1).max(5),
  contentType: z.string()
});

export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !ALLOWED.includes(parsed.data.fileExt.toLowerCase()) || parsed.data.contentType !== "application/pdf") {
    return NextResponse.json({ error: "Seuls les fichiers PDF sont acceptés." }, { status: 400 });
  }

  const { uploadUrl, publicUrl } = await createPresignedContractUpload(
    artist.id,
    parsed.data.fileExt.toLowerCase(),
    parsed.data.contentType
  );

  return NextResponse.json({ uploadUrl, publicUrl });
}
