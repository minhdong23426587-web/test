import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-12">
      <section>
        <h1 className="text-4xl font-bold">Enterprise Security Platform</h1>
        <p className="mt-4 text-lg text-slate-300">
          Production-ready Next.js platform featuring uncompromising security controls, privacy-first
          architecture, and developer ergonomics.
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100">User Portal</h2>
          <p className="mt-2 text-sm text-slate-400">Secure onboarding, session management, and user tools.</p>
          <Link
            href="/auth/register"
            className="mt-4 inline-block rounded bg-brand-accent px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Get Started
          </Link>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100">Admin Console</h2>
          <p className="mt-2 text-sm text-slate-400">
            Locked-down admin workflows with mandatory MFA, auditing, and network policies.
          </p>
          <Link
            href="https://admin.example.com"
            className="mt-4 inline-block rounded border border-brand-accent px-4 py-2 text-sm font-semibold text-brand-accent"
          >
            Admin Access
          </Link>
        </div>
      </section>
      <section className="rounded-lg border border-slate-800 bg-slate-950/50 p-6">
        <h2 className="text-xl font-semibold">Realtime Observability</h2>
        <p className="mt-2 text-sm text-slate-400">
          WebSockets secured with JWT/API key authentication stream live metrics through Redis Pub/Sub.
        </p>
      </section>
    </main>
  );
}
