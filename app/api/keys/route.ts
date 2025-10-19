import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/security/prisma';
import { createHash, timingSafeEqual } from 'crypto';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  const timestamp = request.headers.get('x-request-timestamp');
  const signature = request.headers.get('x-request-signature');
  if (!apiKey || !timestamp || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const key = await prisma.apiKey.findFirst({ where: { revokedAt: null, lastFour: apiKey.slice(-4) } });
  if (!key) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const hash = createHash('sha256').update(apiKey).digest('hex');
  if (hash !== key.hashedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const computed = createHash('sha256').update(`${timestamp}.${apiKey}`).digest('hex');
  const provided = Buffer.from(signature, 'utf8');
  const expected = Buffer.from(computed, 'utf8');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  if (Math.abs(Date.now() - Number(timestamp)) > 1000 * 60) {
    return NextResponse.json({ error: 'Expired' }, { status: 401 });
  }
  await prisma.apiKeyUsage.create({
    data: {
      apiKeyId: key.id,
      endpoint: request.nextUrl.pathname
    }
  });
  return NextResponse.json({ ok: true });
}
