import { redirect } from "next/navigation";
import Link from "next/link";
import { validateAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/db";

export default async function AdminHome() {
  const adminId = await validateAdminSession();
  if (!adminId) {
    redirect("/admin/login");
  }

  const [admin, apiKeyCount, userCount] = await Promise.all([
    prisma.admin.findUnique({ where: { id: adminId } }),
    prisma.apiKey.count(),
    prisma.user.count()
  ]);

  return (
    <main>
      <h1>Admin control center</h1>
      <p>Signed in as {admin?.email}</p>
      <div className="alert">
        <h2>Stats</h2>
        <ul>
          <li>Total users: {userCount}</li>
          <li>Total API keys: {apiKeyCount}</li>
        </ul>
      </div>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link href="/admin/api-keys">API key management</Link>
        <Link href="/admin/audit">Audit explorer</Link>
      </nav>
    </main>
  );
}
