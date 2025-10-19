import crypto from "crypto";
import argon2 from "argon2";

const HMAC_ALGORITHM = "sha256";

export function createHmacSignature(payload: string, secret = process.env.HMAC_SECRET ?? ""): string {
  if (!secret) {
    throw new Error("HMAC secret is not configured");
  }

  return crypto.createHmac(HMAC_ALGORITHM, secret).update(payload).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function fingerprintToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function hashToken(token: string): Promise<string> {
  return argon2.hash(token, { type: argon2.argon2id });
}

export async function verifyToken(token: string, hashed: string): Promise<boolean> {
  return argon2.verify(hashed, token);
}
