import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const schema = z.object({
  title: z.string().min(3).max(140).optional(),
  excerpt: z.string().min(10).max(400).optional(),
  category: z.string().min(2).max(60).optional(),
  body: z.string().min(20).optional(),
  imageUrl: z.string().url().optional().nullable(),
  icon: z.string().max(4).optional(),
  gradient: z.string().max(200).optional(),
  readTime: z.string().max(20).optional(),
  published: z.boolean().optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const updated = await prisma.article.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await prisma.article.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
