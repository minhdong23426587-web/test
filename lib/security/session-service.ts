import { nanoid } from 'nanoid';
import { prisma } from '@/lib/security/prisma';
import { redis } from '@/lib/security/redis';
import { SignJWT, jwtVerify } from 'jose';

const sessionSecret = new TextEncoder().encode(process.env.SESSION_SECRET ?? 'replace-me');

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  familyId: string;
}

export async function createSession(userId: string, userAgent: string): Promise<SessionTokens> {
  const familyId = nanoid(24);
  const accessToken = await new SignJWT({ sub: userId, scope: 'session:access' })
    .setProtectedHeader({ alg: 'HS512' })
    .setExpirationTime('15m')
    .setIssuer('enterprise-next-app')
    .sign(sessionSecret);
  const refreshToken = nanoid(48);
  await prisma.session.create({
    data: {
      userId,
      familyId,
      refreshToken,
      userAgent,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  });
  return { accessToken, refreshToken, familyId };
}

export async function verifyAccessToken(token: string) {
  try {
    const result = await jwtVerify(token, sessionSecret, {
      issuer: 'enterprise-next-app'
    });
    return result.payload;
  } catch (error) {
    console.error('Access token invalid', error);
    return null;
  }
}

export async function revokeSessionFamily(familyId: string) {
  const sessions = await prisma.session.findMany({ where: { familyId } });
  await prisma.session.deleteMany({ where: { familyId } });
  if (sessions.length > 0) {
    await redis.sadd(
      `session:revoked:${familyId}`,
      sessions.map((session) => session.refreshToken)
    );
    await redis.expire(`session:revoked:${familyId}`, 60 * 60 * 24 * 7);
  }
}
