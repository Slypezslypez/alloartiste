import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";

/** Retourne une réponse 401 si l'appelant n'est pas admin, sinon null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await isAdminAuthenticated();
  if (!ok) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  return null;
}
