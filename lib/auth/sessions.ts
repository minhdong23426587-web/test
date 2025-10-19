import { addMinutes } from "date-fns";
import { prisma } from "@/lib/db";
import { hashToken, randomToken, verifyToken } from "@/lib/crypto/hmac";
import { setUserSessionCookie, clearUserSessionCookie, getUserSessionCookie } from "@/lib/session/cookies";

const SESSION_TTL_MINUTES = Number(process.env.SESSION_TTL_MINUTES ?? 30);
const REFRESH_TOKEN_TTL_MINUTES = Number(process.env.REFRESH_TOKEN_TTL_MINUTES ?? 43200);

export async function createUserSession(userId: string): Promise<void> {
  const sessionId = randomToken(24);
  const refreshToken = randomToken(48);
  const refreshTokenHash = await hashToken(refreshToken);
  const expires = addMinutes(new Date(), SESSION_TTL_MINUTES);
  const refreshExpires = addMinutes(new Date(), REFRESH_TOKEN_TTL_MINUTES);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt: refreshExpires,
      refreshToken: refreshTokenHash
    }
  });

  setUserSessionCookie(`${sessionId}.${refreshToken}`, expires);
}

export async function rotateUserSession(sessionToken: string): Promise<void> {
  const [sessionId, refreshToken] = sessionToken.split(".");
  if (!sessionId || !refreshToken) {
    throw new Error("Invalid session token");
  }

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new Error("Session not found");
  }

  const refreshTokenValid = await verifyToken(refreshToken, session.refreshToken);
  if (!refreshTokenValid) {
    throw new Error("Refresh token mismatch");
  }

  const newRefreshToken = randomToken(48);
  const newRefreshHash = await hashToken(newRefreshToken);
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      refreshToken: newRefreshHash,
      expiresAt: addMinutes(new Date(), REFRESH_TOKEN_TTL_MINUTES)
    }
  });

  const expires = addMinutes(new Date(), SESSION_TTL_MINUTES);
  setUserSessionCookie(`${sessionId}.${newRefreshToken}`, expires);
}

export async function revokeUserSession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } });
  clearUserSessionCookie();
}

export async function getActiveSession(): Promise<{
  sessionId: string;
  refreshToken: string;
} | null> {
  const token = getUserSessionCookie();
  if (!token) return null;
  const [sessionId, refreshToken] = token.split(".");
  if (!sessionId || !refreshToken) return null;
  return { sessionId, refreshToken };
}
