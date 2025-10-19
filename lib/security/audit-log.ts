import { createHash, randomUUID } from 'crypto';
import { prisma } from '@/lib/security/prisma';

export enum AuditLogCategory {
  AUTH = 'AUTH',
  ADMIN = 'ADMIN',
  API = 'API',
  SECURITY = 'SECURITY'
}

interface AuditOptions {
  category: AuditLogCategory;
  message: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
}

export async function audit(options: AuditOptions) {
  await prisma.auditLog.create({
    data: {
      id: randomUUID(),
      category: options.category,
      message: options.message,
      actorId: options.actorId,
      metadata: options.metadata ?? {},
      tamperHash: computeTamperHash(options)
    }
  });
}

function computeTamperHash(options: AuditOptions) {
  const hash = createHash('sha512');
  hash.update(JSON.stringify({
    category: options.category,
    message: options.message,
    actorId: options.actorId,
    metadata: options.metadata
  }));
  return hash.digest('hex');
}
