import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';

export function POST(request: NextRequest) {
  if (request.headers.get('x-internal-route-key') !== process.env.INTERNAL_ROUTE_HEADER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const secret = authenticator.generateSecret();
  return NextResponse.json({ secret });
}
