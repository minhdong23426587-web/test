import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/security/prisma';

export async function GET() {
  const host = headers().get('host');
  if (host !== process.env.ADMIN_DOMAIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return NextResponse.json(
    logs.map((log) => ({
      id: log.id,
      actor: log.actorId ?? 'system',
      action: log.message,
      createdAt: log.createdAt,
      riskScore: 10
    }))
  );
}
