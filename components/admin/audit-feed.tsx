'use client';

import useSWR from 'swr';
import clsx from 'clsx';
import { fetcher } from '@/lib/security/public-client';

interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  createdAt: string;
  riskScore: number;
}

export function AuditFeed() {
  const { data, error } = useSWR<AuditLogEntry[]>(
    ['/api/admin/logs', typeof window !== 'undefined' ? window.crypto.randomUUID() : ''],
    ([url]) => fetcher(url, { cache: 'no-store' })
  );

  if (error) {
    return <div className="text-sm text-red-400">Failed to load audit logs.</div>;
  }

  if (!data) {
    return <div className="text-sm text-slate-400">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((entry) => (
        <article
          key={entry.id}
          className={clsx('rounded border p-4 text-sm', {
            'border-red-500/60': entry.riskScore >= 80,
            'border-yellow-500/40': entry.riskScore < 80 && entry.riskScore >= 50,
            'border-slate-800': entry.riskScore < 50
          })}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">{entry.action}</span>
            <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Actor: {entry.actor}</p>
          <p className="mt-2 text-xs text-slate-500">Risk score: {entry.riskScore}</p>
        </article>
      ))}
    </div>
  );
}
