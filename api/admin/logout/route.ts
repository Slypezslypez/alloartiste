import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/adminAuth";

export async function POST() {
  destroyAdminSession();
  return NextResponse.json({ ok: true });
}
