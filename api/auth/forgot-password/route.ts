import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email invalide." }, { status: 400 });

  const artist = await prisma.artist.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

  // Toujours répondre pareil, que le compte existe ou non — évite de révéler quels emails sont inscrits.
  if (artist) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.artist.update({
      where: { id: artist.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 heure
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reinitialiser-mot-de-passe?token=${rawToken}`;
    try {
      await sendPasswordResetEmail(artist.email, resetUrl);
    } catch (err) {
      console.error("Échec de l'envoi de l'email de réinitialisation:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
