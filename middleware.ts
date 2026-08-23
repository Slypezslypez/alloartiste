import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "aa_access";

// Chemins toujours autorisés, même sans le cookie d'accès (webhooks externes, page de construction elle-même, etc.)
const ALWAYS_ALLOWED_PREFIXES = ["/api/stripe", "/api/access", "/en-construction", "/robots.txt", "/sitemap.xml"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const code = process.env.SITE_ACCESS_CODE;
  // Si aucun code n'est configuré, le site reste public normalement (pas de blocage accidentel).
  if (!code) return NextResponse.next();

  const hasAccess = req.cookies.get(COOKIE_NAME)?.value === code;
  if (hasAccess) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/en-construction";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
