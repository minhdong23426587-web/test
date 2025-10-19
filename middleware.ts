import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const ADMIN_DOMAIN = process.env.ADMIN_DOMAIN ?? 'admin.localhost';
const INTERNAL_HEADER = 'x-internal-route-key';
const redis = Redis.fromEnv();

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const key = `edge:rl:${request.ip ?? 'unknown'}:${request.nextUrl.pathname}`;
    const count = ((await redis.incr(key)) as number) ?? 0;
    if (count === 1) {
      await redis.expire(key, 1);
    }
    if (count > Number(process.env.GLOBAL_RATE_LIMIT ?? 50)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  if (request.nextUrl.pathname.startsWith('/api/internal')) {
    const header = request.headers.get(INTERNAL_HEADER);
    if (!header || header !== process.env.INTERNAL_ROUTE_HEADER_SECRET) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  const ua = request.headers.get('user-agent') ?? '';
  if (/curl|bot|spider|crawler/i.test(ua) && !request.nextUrl.pathname.startsWith('/robots')) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (request.nextUrl.hostname === ADMIN_DOMAIN) {
    const allowlist = (process.env.ADMIN_IP_ALLOWLIST ?? '').split(',').filter(Boolean);
    if (allowlist.length > 0 && request.ip && !allowlist.includes(request.ip)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
