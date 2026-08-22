import { NextResponse } from "next/server";
import { getCurrentArtist } from "@/lib/auth";
import { generateServicesSuggestions } from "@/lib/anthropic";

export async function POST() {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  try {
    const services = await generateServicesSuggestions({ category: artist.category, bio: artist.bio });
    return NextResponse.json({ services });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "La génération a échoué." }, { status: 500 });
  }
}
