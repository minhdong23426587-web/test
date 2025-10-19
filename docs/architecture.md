# High-Security Next.js Platform Architecture

## 1. Application Topology
```
┌──────────────────────────┐        ┌──────────────────────────┐
│        Browser /         │  HTTPS │      Next.js App Router  │
│   Trusted Client (SSR)   │◀──────▶│  (React 18, TypeScript)  │
└──────────────────────────┘        └──────────────────────────┘
                                         │Server Actions / RSC
                                         ▼
                                 ┌────────────────┐
                                 │  Internal API  │
                                 │  (HMAC-gated)  │
                                 └────────────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          ▼                             ▼
                 ┌────────────────────┐        ┌────────────────────┐
                 │ PostgreSQL (RDS)   │        │ Redis Cluster      │
                 │ Prisma ORM         │        │ Sessions / RateLim │
                 └────────────────────┘        │ WS Pub/Sub / Cache │
                                               └────────────────────┘
                                         │
                                         ▼
                                 ┌──────────────────┐
                                 │ WebSocket Nodes  │
                                 │ (socket.io/ws)   │
                                 └──────────────────┘
                                         │
                                         ▼
                                 ┌──────────────────┐
                                 │ Monitoring Stack │
                                 │ Sentry / Prom    │
                                 └──────────────────┘
```

- **App Router** delivers both interactive UI and server-rendered pages.
- **Server Actions & Route Handlers** encapsulate all sensitive logic; exposed API routes require API key or session verification.
- **Redis** acts as the coordination layer for sessions, rate limits, and real-time events.
- **WebSocket tier** runs separately (e.g., containerized on Cloud Run or Kubernetes) and authenticates using short-lived tokens minted by server actions.

## 2. Data Storage & Models
| Concern | Technology | Notes |
|---------|------------|-------|
| Primary application data | PostgreSQL via Prisma | Schema migrations via Prisma Migrate; use prepared statements; encrypt PII columns with pgcrypto or application-level AES-GCM |
| Sessions | Redis | Session IDs are random 256-bit values stored with HttpOnly/Secure cookies; admin & user sessions separated by namespace |
| Audit Logs | Append-only storage (e.g., AWS S3 + Glacier) | Logs hashed (Merkle chain) for tamper detection; access via admin panel with export controls |
| API Keys | PostgreSQL | Store Argon2id hashes; maintain metadata (owner, scopes, rate limit policy, created/updated timestamps) |
| Magic Link Tokens | PostgreSQL (short-lived table) | Tokens hashed (Argon2), expire in ≤10 minutes, single-use flag |
| Rate Limit Buckets | Redis | Token bucket per IP/user/API key; escalate to CAPTCHA after thresholds |

## 3. Authentication Flows
### 3.1 User Magic Link Login
1. Client submits email through a server action `sendMagicLink(email)`.
2. Server generates random 32-byte token, stores Argon2 hash with user ID and expiry, signs opaque payload with HMAC secret.
3. Email contains link `https://example.com/auth/magic?t=<opaque>`.
4. `/auth/magic` route handler (server-only) validates HMAC, verifies hashed token, marks single-use, and issues session cookie with rotating refresh token stored server-side.
5. Session cookie: `__Host-app_sid`, HttpOnly, Secure, SameSite=Strict, TTL 12h; refresh token rotated at each use.
6. No public API endpoint; route handler rejects requests lacking internal header set by Next.js server action middleware.

### 3.2 Admin Authentication
- Admin login UI at `/admin/login` posts to server action `adminLogin(password, totp, webauthnResponse)`.
- Password stored as Argon2id hash with pepper stored in HSM/Secrets Manager.
- Verify TOTP (RFC6238) using enrollment secrets stored encrypted.
- Optional WebAuthn challenge/response validated via FIDO2 library; require at least two factors (password + TOTP or WebAuthn).
- Admin session cookie `__Host-admin_sid` stored with separate Redis namespace, TTL 1h, enforced IP allowlist and device fingerprint.
- Account lockout after 5 failed attempts, requiring manual unlock via secure workflow.

## 4. Authorization & API Keys
- Role-based access control (RBAC) enforced via middleware and server actions.
- API keys created by admins; each key includes scopes (e.g., `read:data`, `write:data`), rate limit policy, and expiration.
- Keys presented via `Authorization: Bearer <key>`; middleware hashes presented key (Argon2id with same params) and performs constant-time comparison.
- API responses include response signatures (`X-Response-Signature`) using HMAC with per-client secret to prevent tampering.
- Rotation & revocation handled instantly: marking key as revoked invalidates via Redis cache invalidation event.

## 5. Middleware & Edge Protections
- Global `middleware.ts` enforces:
  - HTTP security headers (CSP with nonces, HSTS preload, X-Frame-Options=DENY, X-Content-Type-Options=nosniff, Referrer-Policy=strict-origin).
  - API key/JWT validation before reaching route handlers.
  - Rate limiting per IP + session using Redis token bucket.
  - Bot detection (fingerprinting heuristics, honeypot check, invisible challenge).
  - Internal request validation (signed header `X-Internal-Request` using rotating HMAC).
- Admin routes enforce stricter CSP (disallow inline scripts) and require verified admin session before rendering.

## 6. Realtime Architecture
- WebSocket server authenticates via short-lived socket tokens minted through server action `issueSocketToken(scope)`; tokens embed user ID, scopes, expiration, and are signed with HMAC.
- Upon connection, server verifies token and attaches rate limits; unauthorized attempts logged and counted.
- Redis pub/sub channels separate tenant data; use ACLs or channel naming with random suffix.
- Heartbeats enforced every 30s; idle connections closed.

## 7. Anti-Crawl & Bot Mitigations
- **Behavioral analytics:** Track mouse/keyboard/scroll metrics; suspicious patterns trigger invisible challenge.
- **Challenge flow:** Invisible reCAPTCHA-style scoring; if low score, serve proof-of-work JS or fallback CAPTCHA.
- **Honeypot routes:** Hidden forms and fake endpoints; hitting them flags IP/user and requires CAPTCHA or blocks.
- **IP reputation:** Integrate with third-party IP intelligence; after threshold, require CAPTCHA and decrease rate limits.
- **Response obfuscation:** Serve critical HTML after JS execution challenge to deter static scraping.

## 8. Security Hardening
- Strict CSP with per-request nonces; only allow `self` and known domains for scripts/styles.
- CSRF tokens for state-changing server actions exposed via forms; tokens stored in HttpOnly cookies and validated server-side.
- Input validation via zod/yup schemas at every server action boundary.
- Dependency updates enforced via Renovate and npm audit CI step.
- Use `helmet`-like custom middleware to ensure headers consistently applied.
- Database queries via Prisma with parameterization; apply row-level security for multi-tenant scenarios.
- Encrypt sensitive secrets (SMTP credentials, HMAC keys) within Secret Manager; rotate quarterly.

## 9. Logging, Auditing, and Monitoring
- Centralized logging via structured logs (JSON) shipped to ELK or CloudWatch.
- Audit log entries signed and chained; include actor, action, metadata, IP, user-agent.
- Anomaly detection pipeline (e.g., AWS GuardDuty, custom Prometheus alerts) triggers PagerDuty notifications for suspicious activity.
- Sentry captures exceptions with PII scrubbing; Prometheus metrics exported for request latency, auth failures, rate-limit hits.
- Admin panel provides audit search, export (CSV/JSON), and anomaly summaries.

## 10. CI/CD & Operations
- Terraform provisions Vercel/Cloud Run projects, PostgreSQL (managed), Redis (managed), networking, and secret stores.
- GitHub Actions pipeline:
  - Lint & type check (ESLint, TypeScript)
  - Unit/integration tests (Jest/Playwright)
  - Security scans (npm audit, Snyk, Trivy, gitleaks)
  - Infrastructure plan/apply gating (manual approval for production)
- Secrets injected via environment variables using OIDC with secret manager (no plaintext in pipeline).
- Deployments use blue/green or canary strategy; WebSocket nodes rolled out sequentially with health checks.

## 11. Testing & Hardening Checklist
- Penetration testing prior to production launch and after significant changes.
- Automated rate-limit/bot simulation tests to tune thresholds and ensure correct responses.
- Verify CSP using tools like Mozilla Observatory; ensure no inline script violations.
- Confirm admin MFA flow works with Authy, Google Authenticator, and hardware keys (WebAuthn).
- Execute incident response drills; ensure audit logs immutable and accessible.
- Regular backup/restore tests for PostgreSQL and Redis snapshots.

## 12. Environment Variables (Non-exhaustive)
```
DATABASE_URL=postgres://...
REDIS_URL=redis://...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
NEXT_PUBLIC_APP_URL=https://example.com
INTERNAL_HMAC_SECRET=...
SESSION_SECRET=...
ADMIN_SESSION_SECRET=...
SENTRY_DSN=...
PROMETHEUS_ENDPOINT=...
ADMIN_ALLOWLIST_IPS=1.2.3.4,5.6.7.8
RATE_LIMIT_POLICY=default
CAPTCHA_SECRET=...
WEBAUTHN_RP_ID=example.com
```

## 13. Future Enhancements
- Integrate hardware-backed key management (KMS/HSM) for signing tokens.
- Add machine learning anomaly detection on login and transaction events.
- Support federated identity for enterprise customers via SAML/OIDC with strict mapping and auditing.

