import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/security/prisma';
import { hashPassword, verifyPassword } from '@/lib/security/passwords';
import { redis } from '@/lib/security/redis';
import { signEmailVerificationToken, verifyEmailVerificationToken } from '@/lib/security/tokens';
import { sendVerificationEmail } from '@/lib/security/email';
import { createSession, revokeSessionFamily } from '@/lib/security/session-service';
import { AuditLogCategory, audit } from '@/lib/security/audit-log';

export async function createUnverifiedUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: 'PENDING_VERIFICATION' },
    create: {
      email,
      passwordHash,
      status: 'PENDING_VERIFICATION',
      riskScore: 10
    }
  });
  const verificationToken = await signEmailVerificationToken({ userId: user.id, email });
  await sendVerificationEmail({ email, token: verificationToken });
  await audit({
    category: AuditLogCategory.AUTH,
    message: `Registration initiated for ${email}`,
    actorId: user.id
  });
}

export async function verifyEmailToken(token: string) {
  const claims = await verifyEmailVerificationToken(token);
  if (!claims) {
    return { ok: false, error: 'Invalid token' } as const;
  }
  await prisma.user.update({
    where: { id: claims.userId },
    data: { status: 'ACTIVE', emailVerifiedAt: new Date() }
  });
  await audit({
    category: AuditLogCategory.AUTH,
    message: 'Email verified',
    actorId: claims.userId
  });
  return { ok: true } as const;
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || user.status !== 'ACTIVE') {
    return null;
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await audit({ category: AuditLogCategory.AUTH, message: 'Failed login attempt', actorId: user.id });
    return null;
  }
  return user;
}

export async function issueSession(userId: string, userAgent?: string) {
  const session = await createSession(userId, userAgent ?? headers().get('user-agent') ?? 'unknown');
  const cookieStore = cookies();
  cookieStore.set({
    name: 'session',
    value: session.accessToken,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15
  });
  cookieStore.set({
    name: 'refresh',
    value: session.refreshToken,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/internal',
    maxAge: 60 * 60 * 24 * 7
  });
  return session;
}

export async function rotateRefreshToken(familyId: string, refreshToken: string) {
  const revoked = await redis.sismember(`session:revoked:${familyId}`, refreshToken);
  if (revoked) {
    return null;
  }
  const session = await prisma.session.findFirst({ where: { familyId, refreshToken } });
  if (!session) {
    return null;
  }
  await revokeSessionFamily(familyId);
  return createSession(session.userId, 'token-rotation');
}

export async function enforceHiddenPrefix(prefix: string | undefined) {
  if (!prefix || prefix !== process.env.INTERNAL_ROUTE_PREFIX) {
    throw new Error('Hidden prefix invalid');
  }
}

export async function enforceAdminPrefix(prefix: string | undefined) {
  if (!prefix || prefix !== process.env.ADMIN_ROUTE_PREFIX) {
    throw new Error('Admin route prefix invalid');
  }
}
