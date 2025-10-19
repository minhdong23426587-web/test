# Fortified Next.js Application

A hardened full-stack starter built with Next.js App Router, React 18, TypeScript, Prisma, and Redis. The project implements
magic-link authentication, an isolated MFA-enforced admin console, hashed API keys, Redis-backed rate limiting, and a secure
WebSocket gateway.

## Features
- **Magic link sign-in** implemented with server actions that never expose public authentication APIs.
- **Session hardening** via short-lived HttpOnly cookies, automatic rotation, and Argon2-hashed refresh tokens.
- **Admin control plane** at `/admin` with password + TOTP, WebAuthn-ready session storage, and audit logs.
- **API key lifecycle** management UI that creates Argon2/HMAC protected keys, revocation, and scope-based authorization.
- **Realtime gateway** powered by Socket.IO with Redis pub/sub enforcing per-key scopes.
- **Defense in depth** using middleware rate limiting, strict security headers, allow-listed origins, and append-only audit logs.

## Getting started
1. Install dependencies and generate Prisma client:
   ```bash
   pnpm install
   pnpm prisma:generate
   ```
2. Copy `.env.example` to `.env.local` and configure secrets (PostgreSQL, Redis, SMTP, HMAC secret, etc.).
3. Apply database schema:
   ```bash
   pnpm prisma migrate dev
   ```
4. Seed the initial admin by setting `SEED_ADMIN_*` variables and running:
   ```bash
   pnpm ts-node --esm scripts/seed-admin.ts
   ```
5. Run the web app:
   ```bash
   pnpm dev
   ```
6. Start the secure WebSocket worker in a separate process:
   ```bash
   pnpm ts-node --esm server/ws/index.ts
   ```

## Project structure
```
app/                 # App Router routes (marketing, auth, dashboard, admin)
  (auth)/            # Magic link request + verification flows
  (dashboard)/       # Authenticated user experience with rotating sessions
  admin/             # Admin login and control center
  api/               # Protected API endpoints requiring hashed API keys
  docs/security/     # Security baseline overview
lib/                 # Prisma client, auth, crypto, rate limiting helpers
server/ws/           # Dedicated Socket.IO worker secured by Redis adapter
scripts/             # Operational scripts (admin seeding)
prisma/schema.prisma # PostgreSQL data model for users, sessions, keys, audits
```

## Security checklist
- CSP, HSTS, `X-Frame-Options`, and `Referrer-Policy` headers enforced globally via middleware and `next.config.mjs`.
- Authentication endpoints live exclusively in server actions; middleware rejects non-allowlisted origins.
- Redis-backed token bucket rate limiting covers login, magic links, and public APIs.
- Audit log records every sensitive action (magic link verification, API key lifecycle, admin logins).
- Admin sessions are isolated with dedicated cookies, lockouts, and MFA verification through TOTP/WebAuthn.
- WebSocket connections are authenticated via hashed API keys and scoped event emission.

For deeper architectural rationale, see [`docs/architecture.md`](docs/architecture.md).
