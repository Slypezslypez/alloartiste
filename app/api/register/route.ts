import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { CATEGORIES, COUNTRIES, CITIES_BY_COUNTRY } from "@/lib/categories";

const schema = z
  .object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z.string().min(8),
    category: z.string().min(2).max(60),
    country: z.enum(COUNTRIES).optional().default("Belgique"),
    city: z.string().min(1).max(60).optional().default("Autre"),
    bio: z.string().max(600).optional().default("")
  })
  .refine((data) => CITIES_BY_COUNTRY[data.country].includes(data.city as any), {
    message: "Ville invalide pour ce pays.",
    path: ["city"]
  });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }
  const { name, email, password, category, country, city, bio } = parsed.data;

  const existing = await prisma.artist.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const artist = await prisma.artist.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      category,
      country,
      city,
      bio
    }
  });

  await createSession(artist.id);
  try {
    await sendWelcomeEmail(artist.name, artist.email);
  } catch (err) {
    console.error("Échec de l'envoi de l'email de bienvenue:", err);
  }

  return NextResponse.json({ ok: true, artistId: artist.id });
}
