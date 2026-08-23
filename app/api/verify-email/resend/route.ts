import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentArtist } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  const artist = await getCurrentArtist();
  if (!artist) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  if (artist.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.artist.update({
    where: { id: artist.id },
    data: { emailVerificationTokenHash: tokenHash, emailVerificationExpiresAt: tokenExpiresAt }
  });

  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://alloartiste.be"}/api/verify-email?token=${rawToken}`;
    await sendVerificationEmail(artist.name, artist.email, verifyUrl);
  } catch (err) {
    console.error("Échec de l'envoi de l'email de confirmation:", err);
    return NextResponse.json({ error: "Échec de l'envoi de l'email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
