import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";
import { COUNTRIES, CITIES_BY_COUNTRY, FREE_BIO_MAX, isFreeAccount } from "@/lib/categories";

export async function GET() {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const { passwordHash, ...safe } = artist;
  return NextResponse.json(safe);
}

const schema = z
  .object({
    name: z.string().min(2).max(60).optional(),
    category: z.string().min(2).max(60).optional(),
    specialties: z.array(z.string().max(60)).max(5).optional(),
    country: z.enum(COUNTRIES).optional(),
    city: z.string().min(1).max(60).optional(),
    bio: z.string().max(600).optional(),
    priceMin: z.number().int().min(0).max(100000).optional().nullable(),
    priceMax: z.number().int().min(0).max(100000).optional().nullable(),
    tagline: z.string().max(180).optional().nullable(),
    services: z.array(z.string().max(40)).max(6).optional(),
    phone: z.string().max(30).optional().nullable(),
    website: z.string().max(200).optional().nullable(),
    facebook: z.string().max(200).optional().nullable(),
    instagram: z.string().max(200).optional().nullable(),
    calendarVisible: z.boolean().optional()
  })
  .refine(
    (data) => {
      if (!data.city || !data.country) return true; // pas les deux à la fois : pas de croisement à vérifier
      return CITIES_BY_COUNTRY[data.country].includes(data.city as any);
    },
    { message: "Ville invalide pour ce pays.", path: ["city"] }
  )
  .refine((data) => data.priceMin == null || data.priceMax == null || data.priceMax >= data.priceMin, {
    message: "Le prix maximum doit être supérieur ou égal au prix minimum.",
    path: ["priceMax"]
  });

export async function PATCH(req: NextRequest) {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  let data: typeof parsed.data = parsed.data;
  if (isFreeAccount(artist)) {
    // Compte gratuit : bio courte, pas de formules, de citation ni de liens directs.
    if (data.bio && data.bio.length > FREE_BIO_MAX) {
      return NextResponse.json({ error: `Bio limitée à ${FREE_BIO_MAX} caractères avec le compte gratuit.` }, { status: 400 });
    }
    const { tagline, services, phone, website, facebook, instagram, ...allowed } = data;
    data = allowed;
  }

  const updated = await prisma.artist.update({ where: { id: artist.id }, data });
  const { passwordHash, ...safe } = updated;
  return NextResponse.json(safe);
}
