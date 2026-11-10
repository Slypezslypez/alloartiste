import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendGeneralContactEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";
import { checkContactSpam } from "@/lib/spamFilter";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  role: z.enum(["organisateur", "artiste", "autre"]),
  message: z.string().min(10).max(3000),
  // Anti-spam : champ piège (doit rester vide) et durée de remplissage du formulaire.
  website: z.string().max(200).optional(),
  elapsedMs: z.number().optional()
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });

  const verdict = checkContactSpam({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    honeypot: parsed.data.website,
    elapsedMs: parsed.data.elapsedMs
  });
  // Robot : on répond "ok" sans rien enregistrer ni envoyer.
  if (verdict === "bot") return NextResponse.json({ ok: true });
  if (verdict === "link") {
    return NextResponse.json(
      { error: "Les liens ne sont pas autorisés dans ce formulaire. Retirez-les et réessayez." },
      { status: 400 }
    );
  }

  const { website: _website, elapsedMs: _elapsed, ...clean } = parsed.data;

  await prisma.contactMessage.create({
    data: {
      name: clean.name,
      email: clean.email,
      phone: clean.phone || null,
      role: clean.role,
      message: clean.message
    }
  });

  try {
    const settings = await getSiteSettings();
    await sendGeneralContactEmail({ ...clean, receiverOverride: settings.contactReceiverEmail || undefined });
  } catch (err) {
    console.error("Échec de l'envoi de l'email de contact général:", err);
  }

  return NextResponse.json({ ok: true });
}
