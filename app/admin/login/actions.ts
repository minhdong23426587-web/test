"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminLogin } from "@/lib/auth/admin";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  totp: z.string().length(6)
});

export async function handleAdminLogin(formData: FormData): Promise<never | { error: string }> {
  const parsed = adminLoginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
    await adminLogin({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      totpCode: parsed.data.totp,
      ipAddress: ip
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Unable to login" };
  }

  redirect("/admin");
}
