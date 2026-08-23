import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
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

  // Jeton de confirmation d'email : on ne stocke jamais le jeton en clair, seulement son empreinte.
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // valable 24h

  const artist = await prisma.artist.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      category,
      country,
      city,
      bio,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: tokenExpiresAt
    }
  });

  await createSession(artist.id);
  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/api/verify-email?token=${rawToken}`;
    await sendVerificationEmail(artist.name, artist.email, verifyUrl);
  } catch (err) {
    console.error("Échec de l'envoi de l'email de confirmation:", err);
  }

  return NextResponse.json({ ok: true, artistId: artist.id });
}
