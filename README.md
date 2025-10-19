# High-Security Next.js Application Architecture

## Overview
This document outlines a production-ready architecture for a high-security full-stack application built with Next.js (App Router) and React 18+. The focus is on rigorous security controls, isolated administrative access, and defense-in-depth strategies for both the web application and supporting infrastructure.

## Core Stack
- **Frontend / Backend Framework:** Next.js (App Router) with TypeScript and React 18+
- **Runtime:** Node.js 18+
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache & Coordination:** Redis for sessions, rate limiting, job queues, and WebSocket pub/sub
- **Realtime:** Dedicated WebSocket service (socket.io or `ws`) connected via Redis pub/sub
- **Email Delivery:** SMTP provider (Postfix, SendGrid, or AWS SES)
- **Monitoring & Observability:** Sentry, Prometheus, Grafana
- **Infrastructure:** Terraform-managed deployments to Vercel/Cloud Run plus dedicated WebSocket worker nodes

## High-Level Architecture
- Next.js App Router serves both public pages and server components.
- Authentication flows and sensitive mutations live in server actions, never as public API routes.
- Middleware enforces content security policies (CSP), strict transport security (HSTS), and granular auth checks.
- WebSocket service authenticates clients using short-lived tokens issued by the Next.js server.
- Admin application resides under `/admin` with separate authentication stacks, cookies, and CSP policies.
- Immutable audit logging pipeline writes to append-only storage with retention and export capabilities.

See [`docs/architecture.md`](docs/architecture.md) for detailed diagrams, security controls, and implementation specifics.
