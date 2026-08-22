import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8)
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");

  const artist = await prisma.artist.findUnique({ where: { resetTokenHash: tokenHash } });

  if (!artist || !artist.resetTokenExpiresAt || artist.resetTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Ce lien est invalide ou a expiré. Refaites une demande." }, { status: 400 });
  }

  await prisma.artist.update({
    where: { id: artist.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      resetTokenHash: null,
      resetTokenExpiresAt: null
    }
  });

  return NextResponse.json({ ok: true });
}
