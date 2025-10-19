import { prisma } from '@/lib/security/prisma';

export interface SystemOverviewSnapshot {
  activeUsers: number;
  rateLimitAlerts: number;
  pendingVerifications: number;
  lastBackup: string;
}

export async function getSystemOverview(): Promise<SystemOverviewSnapshot> {
  const [users, pending, lastBackupLog] = await Promise.all([
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.user.count({ where: { status: 'PENDING_VERIFICATION' } }),
    prisma.backupLog.findFirst({ orderBy: { createdAt: 'desc' } })
  ]);

  return {
    activeUsers: users,
    rateLimitAlerts: await prisma.securityEvent.count({ where: { type: 'RATE_LIMIT' } }),
    pendingVerifications: pending,
    lastBackup: lastBackupLog?.createdAt.toISOString() ?? 'Unknown'
  };
}
