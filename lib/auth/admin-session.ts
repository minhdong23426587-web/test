import { addMinutes } from "date-fns";
import { prisma } from "@/lib/db";
import { randomToken } from "@/lib/crypto/hmac";
import { setAdminSessionCookie, clearAdminSessionCookie, getAdminSessionCookie } from "@/lib/session/cookies";

const ADMIN_SESSION_TTL_MINUTES = Number(process.env.ADMIN_SESSION_TTL_MINUTES ?? 15);

export async function createAdminSession(adminId: string): Promise<void> {
  const sessionId = randomToken(24);
  const expires = addMinutes(new Date(), ADMIN_SESSION_TTL_MINUTES);

  await prisma.adminSession.create({
    data: {
      id: sessionId,
      adminId,
      expiresAt: expires
    }
  });

  setAdminSessionCookie(sessionId, expires);
}

export async function validateAdminSession(): Promise<string | null> {
  const token = getAdminSessionCookie();
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({ where: { id: token } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({ where: { id: token } });
    clearAdminSessionCookie();
    return null;
  }
  return session.adminId;
}

export async function revokeAdminSession(sessionId: string): Promise<void> {
  await prisma.adminSession.delete({ where: { id: sessionId } });
  clearAdminSessionCookie();
}
