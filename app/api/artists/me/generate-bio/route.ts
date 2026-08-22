import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentArtist } from "@/lib/auth";
import { generateBioDraft } from "@/lib/anthropic";

const schema = z.object({ notes: z.string().min(5).max(1000) });

export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Décrivez-vous en quelques mots." }, { status: 400 });

  try {
    const bio = await generateBioDraft({
      name: artist.name,
      category: artist.category,
      city: artist.city,
      notes: parsed.data.notes
    });
    return NextResponse.json({ bio });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "La génération a échoué." }, { status: 500 });
  }
}
