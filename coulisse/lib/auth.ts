import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "coulisse_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "dev-secret-change-me");

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(artistId: string) {
  const token = await new SignJWT({ artistId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSessionArtistId(): Promise<string | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.artistId as string) ?? null;
  } catch {
    return null;
  }
}

/** À utiliser dans les Server Components / route handlers protégés. */
export async function getCurrentArtist() {
  const artistId = await getSessionArtistId();
  if (!artistId) return null;
  return prisma.artist.findUnique({ where: { id: artistId } });
}
