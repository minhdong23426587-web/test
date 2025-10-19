"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { requestMagicLink } from "@/lib/auth/magic-link";
import { consumeToken } from "@/lib/rate-limit/token-bucket";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" })
});

export async function requestLoginMagicLink(formData: FormData): Promise<{ success: boolean; message: string }> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase();
  const headerList = headers();
  const ipAddress = headerList.get("x-forwarded-for") ?? headerList.get("x-real-ip") ?? "unknown";
  const userAgent = headerList.get("user-agent") ?? "unknown";
  const allowed = await consumeToken({
    identifier: `magic:${ipAddress}`,
    tokens: 1,
    maxTokens: 5,
    refillRatePerSec: 0.1
  });

  if (!allowed) {
    return { success: false, message: "Too many attempts. Try again later." };
  }

  await requestMagicLink(email, ipAddress, userAgent);

  return { success: true, message: "Magic link sent. Check your inbox." };
}
