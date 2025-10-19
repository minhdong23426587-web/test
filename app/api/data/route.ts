import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fingerprintToken, verifyToken } from "@/lib/crypto/hmac";

async function validateApiKey(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return null;
  }

  const key = await prisma.apiKey.findUnique({ where: { tokenFingerprint: fingerprintToken(apiKey) } });
  if (!key || key.revokedAt || (key.expiresAt && key.expiresAt < new Date())) {
    return null;
  }

  const valid = await verifyToken(apiKey, key.tokenHash);
  if (!valid) {
    return null;
  }

  return key;
}

export async function GET(request: Request) {
  const key = await validateApiKey(request);
  if (!key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ message: "Secure data", scopes: key.scopes });
}

export async function POST(request: Request) {
  const key = await validateApiKey(request);
  if (!key || !key.scopes.includes("write:data")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();

  await prisma.auditLog.create({
    data: {
      actorAdminId: null,
      actorUserId: key.userId,
      event: "api_data_write",
      context: payload
    }
  });

  return NextResponse.json({ ok: true });
}
