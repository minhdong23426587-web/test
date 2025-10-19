"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fingerprintToken, hashToken, randomToken } from "@/lib/crypto/hmac";
import { validateAdminSession } from "@/lib/auth/admin-session";

const createSchema = z.object({
  userId: z.string().cuid().optional(),
  name: z.string().min(3),
  scopes: z.string().min(1),
  rateLimit: z.coerce.number().int().positive().default(1000)
});

export async function createApiKey(formData: FormData): Promise<{ error?: string; token?: string }> {
  const adminId = await validateAdminSession();
  if (!adminId) {
    redirect("/admin/login");
  }

  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  const token = randomToken(48);
  const fingerprint = fingerprintToken(token);
  const hashed = await hashToken(token);

  await prisma.apiKey.create({
    data: {
      userId: parsed.data.userId,
      name: parsed.data.name,
      scopes: parsed.data.scopes.split(",").map((scope) => scope.trim()),
      tokenFingerprint: fingerprint,
      tokenHash: hashed,
      rateLimit: parsed.data.rateLimit
    }
  });

  await prisma.auditLog.create({
    data: {
      actorAdminId: adminId,
      event: "api_key_created",
      context: {
        name: parsed.data.name,
        scopes: parsed.data.scopes,
        rateLimit: parsed.data.rateLimit
      }
    }
  });

  revalidatePath("/admin/api-keys");
  return { token };
}

const revokeSchema = z.object({ keyId: z.string().cuid() });

export async function revokeApiKey(formData: FormData): Promise<{ error?: string }> {
  const adminId = await validateAdminSession();
  if (!adminId) {
    redirect("/admin/login");
  }

  const parsed = revokeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payload" };
  }

  await prisma.apiKey.update({
    where: { id: parsed.data.keyId },
    data: { revokedAt: new Date() }
  });

  await prisma.auditLog.create({
    data: {
      actorAdminId: adminId,
      event: "api_key_revoked",
      context: {
        keyId: parsed.data.keyId
      }
    }
  });

  revalidatePath("/admin/api-keys");
  return {};
}
