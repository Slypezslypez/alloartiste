import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { prisma } from "@/lib/prisma";

// Vue globale (lecture seule) de tous les contrats enregistrés par les artistes, pour l'admin.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: { artist: { select: { name: true, email: true } } }
  });

  const totalAmount = contracts.reduce((sum, c) => sum + (c.amount || 0), 0);

  return NextResponse.json({ contracts: JSON.parse(JSON.stringify(contracts)), totalAmount });
}
