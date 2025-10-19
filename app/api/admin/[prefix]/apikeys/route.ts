import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/security/prisma';
import { enforceAdminPrefix } from '@/lib/security/user-service';
import { createHash, randomUUID } from 'crypto';
import { audit, AuditLogCategory } from '@/lib/security/audit-log';

export async function POST(request: NextRequest, context: { params: { prefix: string } }) {
  await enforceAdminPrefix(context.params.prefix);
  if (headers().get('host') !== process.env.ADMIN_DOMAIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, scopes, ownerId } = await request.json();
  const rawKey = randomUUID().replace(/-/g, '');
  const hashed = createHash('sha256').update(rawKey).digest('hex');
  await prisma.apiKey.create({
    data: {
      name,
      ownerId,
      scopes,
      hashedKey: hashed,
      lastFour: rawKey.slice(-4)
    }
  });
  await audit({ category: AuditLogCategory.ADMIN, message: `API key created for ${ownerId}` });
  return NextResponse.json({ apiKey: rawKey });
}

export async function DELETE(request: NextRequest, context: { params: { prefix: string } }) {
  await enforceAdminPrefix(context.params.prefix);
  if (headers().get('host') !== process.env.ADMIN_DOMAIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { keyId } = await request.json();
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() }
  });
  await audit({ category: AuditLogCategory.ADMIN, message: `API key revoked ${keyId}` });
  return NextResponse.json({ ok: true });
}
