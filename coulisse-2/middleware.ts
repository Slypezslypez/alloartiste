import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "dev-secret-change-me");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("coulisse_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/connexion", req.url));
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/connexion", req.url));
  }
}

export const config = { matcher: ["/dashboard/:path*"] };
