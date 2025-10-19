import { redirect } from "next/navigation";
import { validateAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/db";

export default async function AuditPage() {
  const adminId = await validateAdminSession();
  if (!adminId) {
    redirect("/admin/login");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 25
  });

  return (
    <main>
      <h1>Audit explorer</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Event</th>
            <th>Context</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.event}</td>
              <td>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(log.context, null, 2)}</pre>
              </td>
              <td>{log.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
