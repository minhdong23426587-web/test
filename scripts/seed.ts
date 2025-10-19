import { randomUUID } from 'crypto';
import { authenticator } from 'otplib';
import { prisma } from '@/lib/security/prisma';
import { hashPassword } from '@/lib/security/passwords';

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = await hashPassword(process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!234');
  const mfaSecret = authenticator.generateSecret();

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { status: 'ACTIVE', passwordHash: password, mfaEnabled: true, mfaSecret },
    create: {
      email: adminEmail,
      passwordHash: password,
      status: 'ACTIVE',
      riskScore: 5,
      mfaEnabled: true,
      mfaSecret
    }
  });

  await prisma.auditLog.create({
    data: {
      id: randomUUID(),
      actorId: admin.id,
      category: 'ADMIN',
      message: 'Seed admin created',
      metadata: { mfaSecretMasked: `${mfaSecret.slice(0, 3)}****` },
      tamperHash: 'seed'
    }
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
