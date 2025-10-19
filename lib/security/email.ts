import nodemailer from 'nodemailer';

const smtpUser = process.env.SMTP_USER ?? '';
const smtpPass = process.env.SMTP_PASS ?? '';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'localhost',
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
});

export async function sendVerificationEmail({ email, token }: { email: string; token: string }) {
  const verifyUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/auth/verify/${token}`;
  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM ?? 'security@example.com',
    subject: 'Verify your email',
    text: `Verify your account using this link: ${verifyUrl}`,
    html: `<p>Verify your account using this link: <a href="${verifyUrl}">${verifyUrl}</a></p>`
  });
}
