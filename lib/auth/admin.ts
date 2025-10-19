import argon2 from "argon2";
import { authenticator } from "otplib";
import { prisma } from "@/lib/db";
import { createAdminSession } from "@/lib/auth/admin-session";
import { randomToken } from "@/lib/crypto/hmac";

const MAX_FAILED_ATTEMPTS = Number(process.env.ADMIN_MAX_FAILED_ATTEMPTS ?? 5);
const LOCKOUT_MINUTES = Number(process.env.ADMIN_LOCKOUT_MINUTES ?? 15);

export async function ensureAdminSeed(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const totpSecret = process.env.SEED_ADMIN_TOTP_SECRET;
  if (!email || !password || !totpSecret) {
    return;
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return;
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.admin.create({
    data: {
      email,
      passwordHash,
      totpSecret
    }
  });
}

export async function adminLogin({
  email,
  password,
  totpCode,
  ipAddress
}: {
  email: string;
  password: string;
  totpCode: string;
  ipAddress?: string;
}): Promise<void> {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new Error("Invalid credentials");
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    throw new Error("Account locked");
  }

  const passwordValid = await argon2.verify(admin.passwordHash, password);
  const totpValid = authenticator.check(totpCode, admin.totpSecret);

  if (!passwordValid || !totpValid) {
    const failed = admin.failedLoginCount + 1;
    const lockedUntil = failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null;

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginCount: failed,
        lockedUntil
      }
    });

    throw new Error("Invalid credentials");
  }

  await prisma.$transaction([
    prisma.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    }),
    prisma.auditLog.create({
      data: {
        actorAdminId: admin.id,
        event: "admin_login",
        context: {
          ipAddress,
          userAgent: "internal",
          nonce: randomToken(16)
        }
      }
    })
  ]);

  await createAdminSession(admin.id);
}
