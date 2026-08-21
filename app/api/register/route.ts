import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { CATEGORIES, BELGIAN_CITIES } from "@/lib/categories";

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
  category: z.enum(CATEGORIES),
  city: z.enum(BELGIAN_CITIES).optional().default("Autre"),
  bio: z.string().max(600).optional().default("")
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }
  const { name, email, password, category, city, bio } = parsed.data;

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
      city,
      bio
    }
  });

  await createSession(artist.id);
  sendWelcomeEmail(artist.name, artist.email).catch(() => {});

  return NextResponse.json({ ok: true, artistId: artist.id });
}
