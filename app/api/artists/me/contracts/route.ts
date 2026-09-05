import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";

// Cahier de comptes de l'artiste : liste et ajout de contrats (PDF déjà uploadé sur R2).
export async function GET() {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const contracts = await prisma.contract.findMany({
    where: { artistId: artist.id },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(contracts);
}

const schema = z.object({
  clientName: z.string().min(1).max(120),
  eventDate: z.string().optional().nullable(),
  eventLocation: z.string().max(120).optional().nullable(),
  amount: z.number().min(0).max(1000000).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  fileUrl: z.string().url()
});

export async function POST(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  // Sécurité : n'accepte que des fichiers réellement hébergés sur notre propre stockage.
  const base = process.env.S3_PUBLIC_BASE_URL as string;
  if (!parsed.data.fileUrl.startsWith(base)) {
    return NextResponse.json({ error: "Fichier invalide." }, { status: 400 });
  }

  const contract = await prisma.contract.create({
    data: {
      artistId: artist.id,
      clientName: parsed.data.clientName,
      eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
      eventLocation: parsed.data.eventLocation || null,
      amount: parsed.data.amount ?? null,
      note: parsed.data.note || null,
      fileUrl: parsed.data.fileUrl
    }
  });
  return NextResponse.json(contract);
}
