import { NextRequest, NextResponse } from 'next/server';
import { enforceHiddenPrefix, createUnverifiedUser } from '@/lib/security/user-service';

export async function POST(request: NextRequest, context: { params: { prefix: string } }) {
  await enforceHiddenPrefix(context.params.prefix);
  if (request.headers.get('x-internal-route-key') !== process.env.INTERNAL_ROUTE_HEADER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await request.json();
  const { email, password } = payload;
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  await createUnverifiedUser(email, password);
  return NextResponse.json({ ok: true });
}
