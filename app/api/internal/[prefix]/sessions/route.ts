import { NextRequest, NextResponse } from 'next/server';
import { enforceHiddenPrefix, rotateRefreshToken } from '@/lib/security/user-service';

export async function POST(request: NextRequest, context: { params: { prefix: string } }) {
  await enforceHiddenPrefix(context.params.prefix);
  if (request.headers.get('x-internal-route-key') !== process.env.INTERNAL_ROUTE_HEADER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { familyId, refreshToken } = await request.json();
  const session = await rotateRefreshToken(familyId, refreshToken);
  if (!session) {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', session.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15
  });
  response.cookies.set('refresh', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/internal',
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
