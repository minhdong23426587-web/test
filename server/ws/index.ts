import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "@redis/client";
import { createAdapter } from "@socket.io/redis-adapter";
import { prisma } from "../../lib/db";
import { fingerprintToken, verifyToken } from "../../lib/crypto/hmac";

const redisPub = createClient({ url: process.env.REDIS_URL });
const redisSub = createClient({ url: process.env.REDIS_URL });

async function bootstrap() {
  await Promise.all([redisPub.connect(), redisSub.connect()]);

  const server = http.createServer();
  const io = new Server(server, {
    transports: ["websocket"],
    cors: {
      origin: process.env.WS_ALLOWED_ORIGINS?.split(",") ?? []
    }
  });

  io.adapter(createAdapter(redisPub, redisSub));

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Missing token"));
      }
      const apiKey = await prisma.apiKey.findUnique({ where: { tokenFingerprint: fingerprintToken(token) } });
      if (!apiKey || apiKey.revokedAt) {
        return next(new Error("Unauthorized"));
      }
      const valid = await verifyToken(token, apiKey.tokenHash);
      if (!valid) {
        return next(new Error("Unauthorized"));
      }
      socket.data.apiKeyId = apiKey.id;
      socket.data.scopes = apiKey.scopes;
      return next();
    } catch (error) {
      return next(error as Error);
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.data.apiKeyId);

    socket.on("secure-event", (payload: unknown) => {
      if (!socket.data.scopes?.includes("ws:emit")) {
        socket.disconnect(true);
        return;
      }

      io.to(socket.data.apiKeyId).emit("secure-event", payload);
    });
  });

  const port = Number(process.env.WS_PORT ?? 4001);
  server.listen(port, () => {
    console.info(`Secure WebSocket server listening on ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap WebSocket server", error);
  process.exit(1);
});
