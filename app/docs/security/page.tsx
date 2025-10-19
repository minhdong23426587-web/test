export const metadata = {
  title: "Security baseline"
};

export default function SecurityDocsPage() {
  return (
    <main style={{ alignItems: "flex-start", maxWidth: "960px", margin: "0 auto" }}>
      <h1>Security baseline</h1>
      <p>
        This application enforces a zero-trust posture where every call is authenticated and rate limited. Magic link
        flows are server-only, API keys are hashed using SHA-512 + Argon2, and sessions are rotated on access.
      </p>
      <section>
        <h2>Defense layers</h2>
        <ul>
          <li>Strict CSP, HSTS, and secure cookies configured globally.</li>
          <li>Server actions replace public auth APIs, reducing CSRF/XSS risk.</li>
          <li>Redis-backed rate limiting and anomaly detection audit logs.</li>
          <li>Dedicated admin perimeter with MFA, WebAuthn, and lockouts.</li>
        </ul>
      </section>
      <section>
        <h2>Observability</h2>
        <p>
          Integrate Sentry for runtime exceptions and Prometheus metrics to monitor request anomalies. Alerts should be
          routed to PagerDuty or Slack for immediate triage.
        </p>
      </section>
    </main>
  );
}
