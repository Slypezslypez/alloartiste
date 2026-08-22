import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendGeneralContactEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  role: z.enum(["organisateur", "artiste", "autre"]),
  message: z.string().min(10).max(3000)
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      role: parsed.data.role,
      message: parsed.data.message
    }
  });

  try {
    const settings = await getSiteSettings();
    await sendGeneralContactEmail({ ...parsed.data, receiverOverride: settings.contactReceiverEmail || undefined });
  } catch (err) {
    console.error("Échec de l'envoi de l'email de contact général:", err);
  }

  return NextResponse.json({ ok: true });
}
