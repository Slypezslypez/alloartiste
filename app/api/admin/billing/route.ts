import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";
import { isSubscriptionVisible } from "@/lib/categories";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const artists = await prisma.artist.findMany({
    where: { stripeCustomerId: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      createdAt: true
    }
  });

  const activeCount = artists.filter((a) =>
    isSubscriptionVisible({ subscriptionStatus: a.subscriptionStatus, currentPeriodEnd: a.currentPeriodEnd })
  ).length;

  return NextResponse.json({ artists: JSON.parse(JSON.stringify(artists)), activeCount });
}
