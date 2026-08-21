import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/requireAdmin";
import { generateArticleDraft } from "@/lib/anthropic";

const schema = z.object({ topic: z.string().min(3).max(200) });

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Sujet invalide." }, { status: 400 });

  try {
    const draft = await generateArticleDraft(parsed.data.topic);
    return NextResponse.json(draft);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "La génération a échoué." }, { status: 500 });
  }
}
