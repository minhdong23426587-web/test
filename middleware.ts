import { NextResponse, type NextRequest } from "next/server";
import { consumeToken } from "@/lib/rate-limit/token-bucket";

const PROTECTED_ADMIN_PATH = /^\/admin(?!\/login)/;
const PUBLIC_API_PATH = /^\/api\/.*$/;

const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS ?? "").split(",").filter(Boolean));

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");

  if (PROTECTED_ADMIN_PATH.test(request.nextUrl.pathname)) {
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  }

  if (PUBLIC_API_PATH.test(request.nextUrl.pathname)) {
    const apiKey = request.headers.get("x-api-key");
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown";
    const allowed = await consumeToken({
      identifier: `public-api:${apiKey ?? ip}`,
      tokens: 1,
      maxTokens: 30,
      refillRatePerSec: 0.1
    });

    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  if (allowedOrigins.size > 0) {
    if (!allowedOrigins.has(request.headers.get("origin") ?? "")) {
      return new NextResponse(null, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/auth/:path*"]
};
