import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <h1>Fortified Next App</h1>
      <p>An enterprise-grade Next.js starter hardened for sensitive workloads.</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link href="/login">User login</Link>
        <Link href="/admin/login">Admin console</Link>
        <Link href="/docs/security">Security docs</Link>
      </div>
    </main>
  );
}
