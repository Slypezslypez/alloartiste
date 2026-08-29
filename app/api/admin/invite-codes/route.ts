import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const codes = await prisma.inviteCode.findMany({ orderBy: { createdAt: "desc" } });
  const usedIds = codes.map((c) => c.usedByArtistId).filter((id): id is string => !!id);
  const artists = usedIds.length
    ? await prisma.artist.findMany({ where: { id: { in: usedIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(artists.map((a) => [a.id, a.name]));

  const result = codes.map((c) => ({
    id: c.id,
    code: c.code,
    email: c.email,
    usedAt: c.usedAt,
    usedByArtistName: c.usedByArtistId ? nameById.get(c.usedByArtistId) || null : null
  }));

  return NextResponse.json({ codes: result });
}

// Génère un code lisible (ex: ALLO-7K3F9Q2M) en évitant les caractères ambigus (0/O, 1/I).
function generateCode() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[crypto.randomInt(alphabet.length)];
  }
  return `ALLO-${code}`;
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  // Très faible probabilité de collision, mais on réessaie proprement si jamais le code existe déjà.
  let created = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    try {
      created = await prisma.inviteCode.create({ data: { code: generateCode(), email } });
    } catch {
      created = null;
    }
  }
  if (!created) {
    return NextResponse.json({ error: "Impossible de générer un code, réessayez." }, { status: 500 });
  }

  return NextResponse.json({ code: created.code, email: created.email });
}
