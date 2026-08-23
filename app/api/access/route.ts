import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "aa_access";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const expected = process.env.SITE_ACCESS_CODE;

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";

  if (!expected || code !== expected) {
    return NextResponse.redirect(url);
  }

  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90 // 90 jours
  });
  return res;
}
