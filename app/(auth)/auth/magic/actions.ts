"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";

export async function verifyMagicLink(token: string): Promise<never> {
  const headerList = headers();
  const ipAddress = headerList.get("x-forwarded-for") ?? headerList.get("x-real-ip") ?? "unknown";
  const userAgent = headerList.get("user-agent") ?? "unknown";

  await verifyMagicLinkToken({ token, ipAddress, userAgent });

  redirect("/dashboard");
}
