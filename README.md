# Enterprise Next.js Security Platform

This repository provides a hardened full-stack web platform template built with Next.js (App Router), TypeScript, React, Tailwind CSS, Prisma, PostgreSQL, and Redis. The project is engineered for regulated environments that require defense-in-depth, strict authentication controls, and production-ready DevSecOps tooling.

## Highlights

- **Next.js App Router** using server components, server actions, and edge middleware for zero-trust enforcement.
- **Security-first authentication** with Argon2id password hashing, signed email verification links, JWT sessions with rotation, and enforced 2FA flows.
- **Realtime WebSocket** infrastructure backed by Upstash Redis Pub/Sub with authenticated upgrades and message constraints.
- **RBAC-ready admin console** hosted on a segregated subdomain, guarded by IP allowlists, mTLS, and mandatory MFA.
- **API key management** supporting scoped keys, hashed storage, HMAC request signing, quotas, and auditing.
- **Comprehensive DevOps**: Docker, docker-compose, Kubernetes manifests with HPA, Terraform IaC skeleton, and GitHub Actions CI/CD pipeline.
- **Observability and incident response** hooks for audit logs, SIEM forwarding, metrics, and backup verification.

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install # or npm/yarn
   ```

2. **Generate Prisma client & migrate**

   ```bash
   pnpm prisma generate
   pnpm prisma migrate deploy
   pnpm run seed
   ```

3. **Run locally**

   ```bash
   pnpm dev
   ```

   Visit `https://localhost:3000` (HTTPS enforced) and `https://admin.localhost:3000` for the admin console (configure `/etc/hosts`).

## Architecture Overview

- **App Router** organizes public and admin segments using parallel routing folders (`app/(public)` and `app/(admin)`).
- **API Route Handlers** under `/api/internal/[prefix]` are hidden behind non-public prefixes and authenticated headers. Admin APIs live under `/api/admin/[prefix]` and require mTLS/IP allowlists.
- **Redis** handles caching, rate limiting, session revocation, and Pub/Sub for WebSockets via Upstash REST endpoints.
- **PostgreSQL** persists core data with Prisma using prepared statements by default.
- **Edge Middleware** (`middleware.ts`) enforces rate limits, hidden prefixes, and bot detection at the perimeter.

## Environment Variables

See `.env.example` for the complete list. Secrets must be stored in Vault or your cloud provider's secret manager—never commit real values.

## Testing & CI

- `pnpm test` for unit/integration (Jest placeholder).
- `pnpm test:e2e` for Playwright E2E suites.
- GitHub Actions pipeline runs linting, tests, Snyk security scan, Docker build/push, and deploy job with OIDC.

## Infrastructure

- **Docker** multi-stage build and docker-compose for local PostgreSQL + Redis.
- **Kubernetes** manifests (base + prod overlay) with HPA, network policies, and TLS-ready ingress.
- **Terraform** skeleton provisioning VPC, subnets, RDS, ElastiCache/MemoryDB, and Application Load Balancer.

## Incident Response

Refer to `docs/incident-response.md` for rotation procedures, token revocation, and forensic collection guidelines.

## Postman Collection

`collections/enterprise-platform.postman_collection.json` contains secured request templates (requires environment variables for secrets).

## Roadmap

- Integrate device fingerprinting vendor.
- Add WebAuthn support for admin login.
- Expand SIEM integration examples.
