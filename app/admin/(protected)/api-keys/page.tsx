import { redirect } from "next/navigation";
import { ApiKeyForm } from "@/components/admin/ApiKeyForm";
import { createApiKey, revokeApiKey } from "./actions";
import { validateAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/db";

export default async function ApiKeysPage() {
  const adminId = await validateAdminSession();
  if (!adminId) {
    redirect("/admin/login");
  }

  const apiKeys = await prisma.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <main>
      <h1>API key management</h1>
      <section>
        <h2>Create key</h2>
        <ApiKeyForm action={createApiKey} />
      </section>
      <section>
        <h2>Existing keys</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Label</th>
              <th>Owner</th>
              <th>Scopes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td>{key.user?.email ?? "Unassigned"}</td>
                <td>{key.scopes.join(", ")}</td>
                <td>{key.revokedAt ? "Revoked" : "Active"}</td>
                <td>
                  {!key.revokedAt && (
                    <form action={revokeApiKey}>
                      <input type="hidden" name="keyId" value={key.id} />
                      <button type="submit">Revoke</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
