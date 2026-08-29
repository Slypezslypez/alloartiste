import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { sendPromoCodeEmail } from "@/lib/email";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Code manquant." }, { status: 400 });
  }

  const invite = await prisma.inviteCode.findUnique({ where: { id } });
  if (!invite) {
    return NextResponse.json({ error: "Code introuvable." }, { status: 404 });
  }
  if (!invite.email) {
    return NextResponse.json({ error: "Aucun email associé à ce code." }, { status: 400 });
  }
  if (invite.usedAt) {
    return NextResponse.json({ error: "Ce code a déjà été utilisé." }, { status: 400 });
  }

  try {
    await sendPromoCodeEmail(invite.email, invite.code);
  } catch {
    return NextResponse.json({ error: "Échec de l'envoi de l'email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
