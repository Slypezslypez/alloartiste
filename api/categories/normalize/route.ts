import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeCategoryName } from "@/lib/anthropic";

const schema = z.object({ raw: z.string().min(2).max(60) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Texte invalide." }, { status: 400 });

  try {
    const category = await normalizeCategoryName(parsed.data.raw);
    return NextResponse.json({ category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "La correction a échoué." }, { status: 500 });
  }
}
