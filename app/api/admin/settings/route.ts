import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

const schema = z.object({
  siteName: z.string().min(1).max(60).optional(),
  logoPart1: z.string().min(1).max(30).optional(),
  logoPart2: z.string().min(1).max(30).optional(),
  tagline: z.string().min(1).max(200).optional(),
  headerBackgroundUrl: z.string().url().optional().nullable(),
  headerBackgroundPositionX: z.number().min(0).max(100).optional(),
  headerBackgroundPositionY: z.number().min(0).max(100).optional(),
  heroLine1: z.string().min(1).max(60).optional(),
  heroEmphasis: z.string().min(1).max(60).optional(),
  heroLine2: z.string().min(1).max(60).optional(),
  heroSubtitle: z.string().min(1).max(500).optional(),
  statCommissionValue: z.string().min(1).max(20).optional(),
  statCommissionLabel: z.string().min(1).max(60).optional(),
  statDirectValue: z.string().min(1).max(20).optional(),
  statDirectLabel: z.string().min(1).max(60).optional(),
  spotlightArtistId1: z.string().optional().nullable(),
  spotlightArtistId2: z.string().optional().nullable(),
  promoImages: z.array(z.string().url()).max(10).optional(),
  howArtistsImageUrl: z.string().url().optional().nullable(),
  howArtistsImagePositionX: z.number().min(0).max(100).optional(),
  howArtistsImagePositionY: z.number().min(0).max(100).optional(),
  howOrganizersImageUrl: z.string().url().optional().nullable(),
  howOrganizersImagePositionX: z.number().min(0).max(100).optional(),
  howOrganizersImagePositionY: z.number().min(0).max(100).optional(),
  contactReceiverEmail: z.string().email().optional().nullable().or(z.literal(""))
});

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  await getSiteSettings(); // garantit que la ligne existe déjà

  const data = { ...parsed.data };
  if (data.contactReceiverEmail === "") data.contactReceiverEmail = null;
  if (data.spotlightArtistId1 === "") data.spotlightArtistId1 = null;
  if (data.spotlightArtistId2 === "") data.spotlightArtistId2 = null;

  const updated = await prisma.siteSettings.update({ where: { id: "singleton" }, data });
  return NextResponse.json(updated);
}
