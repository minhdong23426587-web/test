import { prisma } from '@/lib/security/prisma';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">User Directory</h2>
      <table className="w-full table-fixed text-left text-sm">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="w-1/4">Email</th>
            <th className="w-1/6">Status</th>
            <th className="w-1/6">Risk</th>
            <th className="w-1/3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {users.map((user) => (
            <tr key={user.id} className="text-slate-300">
              <td>{user.email}</td>
              <td>{user.status}</td>
              <td>{user.riskScore}</td>
              <td>{user.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
