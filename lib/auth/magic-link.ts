import { addMinutes } from "date-fns";
import { prisma } from "@/lib/db";
import { createHmacSignature, fingerprintToken, randomToken } from "@/lib/crypto/hmac";
import { sendMagicLinkEmail } from "@/lib/email/magic-link";
import { createUserSession } from "@/lib/auth/sessions";

const MAGIC_LINK_TTL_MINUTES = Number(process.env.MAGIC_LINK_TTL_MINUTES ?? 15);

export async function requestMagicLink(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email },
    create: { email },
    update: {}
  });

  const token = randomToken(48);
  const tokenHash = fingerprintToken(token);
  const tokenHmac = createHmacSignature(token);

  await prisma.magicLinkToken.create({
    data: {
      userId: user.id,
      tokenHash,
      tokenHmac,
      expiresAt: addMinutes(new Date(), MAGIC_LINK_TTL_MINUTES),
      ipAddress,
      userAgent
    }
  });

  await sendMagicLinkEmail({ email, token, ipAddress });
}

export async function verifyMagicLinkToken({
  token,
  ipAddress,
  userAgent
}: {
  token: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  if (!token) {
    throw new Error("Token missing");
  }

  const tokenHash = fingerprintToken(token);
  const tokenHmac = createHmacSignature(token);
  const record = await prisma.magicLinkToken.findFirst({
    where: {
      tokenHash,
      tokenHmac,
      consumedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!record) {
    throw new Error("Token invalid or expired");
  }

  await prisma.$transaction([
    prisma.magicLinkToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date(), ipAddress, userAgent }
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: record.userId,
        event: "magic_link_verified",
        context: {
          ipAddress,
          userAgent
        }
      }
    })
  ]);

  await createUserSession(record.userId);
}
