import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const schema = z.object({
  name: z.string().min(2).max(120).optional(),
  company: z.string().max(120).optional().nullable(),
  genres: z.string().max(200).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  email: z.string().max(160).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  published: z.boolean().optional()
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  return NextResponse.json(await prisma.producer.update({ where: { id: params.id }, data: parsed.data }));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await prisma.producer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
