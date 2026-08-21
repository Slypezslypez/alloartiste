import { NextRequest, NextResponse } from "next/server";
import { createAdminSession } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (!process.env.ADMIN_PASSWORD || !password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
