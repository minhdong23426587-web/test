import Link from 'next/link';
import { Suspense } from 'react';
import { AuditFeed } from '@/components/admin/audit-feed';
import { SystemOverview } from '@/components/admin/system-overview';
import { TotpSetupForm } from '@/forms/totp-setup';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold">Admin Security Console</h1>
        <p className="text-slate-400">
          All actions audited and protected by mandatory MFA, IP allowlists, and client certificates. Use
          the tools below to manage users, sessions, and infrastructure safely.
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6 rounded border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-2xl font-semibold">Realtime Controls</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/users"
              className="rounded border border-brand-accent px-4 py-3 text-center text-sm font-medium text-brand-accent"
            >
              Manage Users
            </Link>
            <Link href="/admin/api-keys" className="rounded bg-brand-accent px-4 py-3 text-center text-sm font-semibold text-slate-950">
              Issue API Keys
            </Link>
            <Link href="/admin/logs" className="rounded border border-slate-700 px-4 py-3 text-center text-sm font-medium text-slate-200">
              Audit Logs
            </Link>
            <Link href="/admin/rate-limits" className="rounded border border-slate-700 px-4 py-3 text-center text-sm font-medium text-slate-200">
              Rate Limit Overrides
            </Link>
          </div>
          <div className="rounded border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold">MFA Device Provisioning</h3>
            <p className="mt-2 text-xs text-slate-400">
              Generate a one-time TOTP secret for secure authenticator enrollment. Secrets are masked and logged with tamper
              detection.
            </p>
            <TotpSetupForm />
          </div>
        </div>
        <Suspense fallback={<div>Loading system status…</div>}>
          <SystemOverview />
        </Suspense>
      </section>
      <section className="rounded border border-slate-800 bg-slate-950/60 p-6">
        <Suspense fallback={<div>Loading audit feed…</div>}>
          <AuditFeed />
        </Suspense>
      </section>
    </div>
  );
}
