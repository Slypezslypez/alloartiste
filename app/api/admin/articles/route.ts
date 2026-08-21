import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(articles);
}

const schema = z.object({
  title: z.string().min(3).max(140),
  excerpt: z.string().min(10).max(400),
  category: z.string().min(2).max(60),
  body: z.string().min(20),
  imageUrl: z.string().url().optional().nullable(),
  icon: z.string().max(4).optional(),
  gradient: z.string().max(200).optional(),
  readTime: z.string().max(20).optional(),
  published: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  let slug = slugify(parsed.data.title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const article = await prisma.article.create({
    data: { ...parsed.data, slug }
  });

  return NextResponse.json(article);
}
