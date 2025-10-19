import { getSystemOverview } from '@/lib/security/system-insights';

export async function SystemOverview() {
  const snapshot = await getSystemOverview();
  return (
    <aside className="space-y-4 rounded border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="text-xl font-semibold text-slate-100">System Status</h2>
      <dl className="space-y-2 text-sm text-slate-300">
        <div className="flex justify-between gap-4">
          <dt>Active users</dt>
          <dd>{snapshot.activeUsers}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Rate limit alerts</dt>
          <dd>{snapshot.rateLimitAlerts}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Pending verifications</dt>
          <dd>{snapshot.pendingVerifications}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Last backup</dt>
          <dd>{snapshot.lastBackup}</dd>
        </div>
      </dl>
    </aside>
  );
}
