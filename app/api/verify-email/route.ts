import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/verifier-email?erreur=lien_invalide", req.url));
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const artist = await prisma.artist.findUnique({ where: { emailVerificationTokenHash: tokenHash } });

  if (!artist || !artist.emailVerificationExpiresAt || artist.emailVerificationExpiresAt.getTime() < Date.now()) {
    return NextResponse.redirect(new URL("/verifier-email?erreur=lien_expire", req.url));
  }

  await prisma.artist.update({
    where: { id: artist.id },
    data: { emailVerified: true, emailVerificationTokenHash: null, emailVerificationExpiresAt: null }
  });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
