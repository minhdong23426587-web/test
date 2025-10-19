import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { authenticateUser, issueSession } from '@/lib/security/user-service';
import { audit, AuditLogCategory } from '@/lib/security/audit-log';
import { consumeRateLimit } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  if (request.headers.get('x-internal-route-key') !== process.env.INTERNAL_ROUTE_HEADER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const limiter = await consumeRateLimit(`login:${request.ip ?? 'unknown'}`, 5, 60);
  if (!limiter.allowed) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }
  const { email, password, otp } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }
  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  if (user.mfaEnabled) {
    if (!otp || !user.mfaSecret || !authenticator.verify({ token: otp, secret: user.mfaSecret })) {
      await audit({ category: AuditLogCategory.AUTH, message: 'Failed MFA verification', actorId: user.id });
      return NextResponse.json({ error: 'MFA required' }, { status: 401 });
    }
  }
  await issueSession(user.id, request.headers.get('user-agent') ?? 'unknown');
  await audit({
    category: AuditLogCategory.AUTH,
    message: 'User signed in',
    actorId: user.id
  });
  return NextResponse.json({ ok: true });
}
