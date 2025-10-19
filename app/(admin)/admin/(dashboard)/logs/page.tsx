import { prisma } from '@/lib/security/prisma';

export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Audit Trail</h2>
      <ul className="space-y-2 text-sm text-slate-300">
        {logs.map((log) => (
          <li key={log.id} className="rounded border border-slate-800 bg-slate-900/50 p-3">
            <span className="font-semibold">{log.category}</span> — {log.message}
            <span className="block text-xs text-slate-500">{log.createdAt.toISOString()}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
