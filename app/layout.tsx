import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fortified Next App",
  description: "A hardened Next.js stack with magic link auth and admin MFA"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
