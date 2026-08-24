import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// Exporte tout le contenu de la base en un seul fichier JSON téléchargeable — sert de
// sauvegarde manuelle, en complément de la restauration automatique de Neon.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [artists, inviteCodes, leads, unavailableDates, contactMessages, articles, settings] = await Promise.all([
    prisma.artist.findMany(),
    prisma.inviteCode.findMany(),
    prisma.lead.findMany(),
    prisma.unavailableDate.findMany(),
    prisma.contactMessage.findMany(),
    prisma.article.findMany(),
    prisma.siteSettings.findMany()
  ]);

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { artists, inviteCodes, leads, unavailableDates, contactMessages, articles, settings }
  };

  const filename = `alloartiste-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
