import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Boolean(process.env.SMTP_SECURE === "true"),
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    : undefined
});

export async function sendMagicLinkEmail({
  email,
  token,
  ipAddress
}: {
  email: string;
  token: string;
  ipAddress?: string;
}): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info("Magic link generated", { email, token, ipAddress });
  }

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/magic?t=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    to: email,
    from: process.env.SMTP_FROM ?? "no-reply@example.com",
    subject: "Your secure login link",
    text: `Click the secure link to sign in. This link expires shortly. ${verifyUrl}`,
    html: `<p>Click the secure link to sign in. This link expires shortly.</p><p><a href="${verifyUrl}">Sign in</a></p>`
  });
}
