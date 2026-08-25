import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

// Restaure une sauvegarde exportée via /api/admin/backup/export.
// Comportement volontairement non destructif : chaque enregistrement du fichier est recréé s'il
// n'existe plus, ou mis à jour s'il existe déjà (upsert par id) — rien n'est supprimé, donc les
// données ajoutées après la sauvegarde restent intactes.

const record = z.record(z.any());

const backupSchema = z.object({
  data: z.object({
    artists: z.array(record).default([]),
    inviteCodes: z.array(record).default([]),
    leads: z.array(record).default([]),
    unavailableDates: z.array(record).default([]),
    contactMessages: z.array(record).default([]),
    articles: z.array(record).default([]),
    settings: z.array(record).default([])
  })
});

function toDate(v: any) {
  return v ? new Date(v) : v;
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = backupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ce fichier n'est pas une sauvegarde AlloArtiste valide." }, { status: 400 });
  }

  const { artists, inviteCodes, leads, unavailableDates, contactMessages, articles, settings } = parsed.data.data;

  try {
    const counts = await prisma.$transaction(
      async (tx) => {
        const c = { artists: 0, inviteCodes: 0, leads: 0, unavailableDates: 0, contactMessages: 0, articles: 0, settings: 0 };

        // Les artistes en premier : les demandes et dates bloquées dépendent de leur id.
        for (const a of artists) {
          const { id, ...rest } = a;
          if (!id) continue;
          const data: any = {
            ...rest,
            createdAt: toDate(rest.createdAt),
            updatedAt: toDate(rest.updatedAt),
            currentPeriodEnd: toDate(rest.currentPeriodEnd),
            emailVerificationExpiresAt: toDate(rest.emailVerificationExpiresAt),
            termsAcceptedAt: toDate(rest.termsAcceptedAt),
            resetTokenExpiresAt: toDate(rest.resetTokenExpiresAt)
          };
          await tx.artist.upsert({ where: { id }, create: { id, ...data }, update: data });
          c.artists++;
        }

        for (const code of inviteCodes) {
          const { id, ...rest } = code;
          if (!id) continue;
          const data: any = { ...rest, usedAt: toDate(rest.usedAt), createdAt: toDate(rest.createdAt) };
          await tx.inviteCode.upsert({ where: { id }, create: { id, ...data }, update: data });
          c.inviteCodes++;
        }

        for (const l of leads) {
          const { id, ...rest } = l;
          if (!id) continue;
          const data: any = { ...rest, createdAt: toDate(rest.createdAt) };
          await tx.lead.upsert({ where: { id }, create: { id, ...data }, update: data });
          c.leads++;
        }

        for (const u of unavailableDates) {
          const { id, ...rest } = u;
          if (!id) continue;
          const data: any = { ...rest, date: toDate(rest.date), createdAt: toDate(rest.createdAt) };
          await tx.unavailableDate.upsert({ where: { id }, create: { id, ...data }, update: data });
          c.unavailableDates++;
        }

        for (const m of contactMessages) {
          const { id, ...rest } = m;
          if (!id) continue;
          const data: any = { ...rest, createdAt: toDate(rest.createdAt) };
          await tx.contactMessage.upsert({ where: { id }, create: { id, ...data }, update: data });
          c.contactMessages++;
        }

        for (const art of articles) {
          const { id, ...rest } = art;
          if (!id) continue;
          const data: any = { ...rest, createdAt: toDate(rest.createdAt), updatedAt: toDate(rest.updatedAt) };
          await tx.article.upsert({ where: { id }, create: { id, ...data }, update: data });
          c.articles++;
        }

        for (const s of settings) {
          const { id, ...rest } = s;
          if (!id) continue;
          const data: any = { ...rest, updatedAt: toDate(rest.updatedAt) };
          await tx.siteSettings.upsert({ where: { id }, create: { id, ...data }, update: data });
          c.settings++;
        }

        return c;
      },
      { timeout: 30000 }
    );

    return NextResponse.json({ ok: true, counts });
  } catch (err) {
    console.error("Échec de la restauration de la sauvegarde :", err);
    return NextResponse.json({ error: "La restauration a échoué — aucune donnée n'a été modifiée." }, { status: 500 });
  }
}
