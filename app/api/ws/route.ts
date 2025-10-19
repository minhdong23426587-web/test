import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { verifyAccessToken } from '@/lib/security/session-service';

export const runtime = 'edge';

const redis = Redis.fromEnv();
const allowedOrigins = (process.env.WS_ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);

export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  const origin = request.headers.get('origin');
  if (allowedOrigins.length > 0 && origin && !allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  const token = request.headers.get('sec-websocket-protocol');
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  const claims = await verifyAccessToken(token);
  if (!claims) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { socket, response } = Deno.upgradeWebSocket(request);
  const controller = new AbortController();

  (async () => {
    for await (const message of redis.subscribe('broadcast', { signal: controller.signal })) {
      if (socket.readyState === socket.OPEN) {
        socket.send(typeof message === 'string' ? message : JSON.stringify(message));
      }
    }
  })();

  socket.onopen = () => {
    socket.send(JSON.stringify({ event: 'CONNECTED', user: claims.sub }));
  };
  socket.onmessage = async (event) => {
    if (event.data && event.data.length > 1024) {
      socket.close(1009, 'Payload too large');
      return;
    }
    await redis.publish('broadcast', event.data);
  };
  socket.onclose = () => {
    controller.abort();
  };
  socket.onerror = () => controller.abort();

  return response;
}
