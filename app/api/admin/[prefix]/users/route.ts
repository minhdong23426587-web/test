import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/security/prisma';
import { enforceAdminPrefix } from '@/lib/security/user-service';

export async function GET(request: NextRequest, context: { params: { prefix: string } }) {
  await enforceAdminPrefix(context.params.prefix);
  if (headers().get('host') !== process.env.ADMIN_DOMAIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, status: true, createdAt: true }
  });
  return NextResponse.json(users);
}
