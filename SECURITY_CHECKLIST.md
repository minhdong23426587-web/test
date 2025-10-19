# Production Security Checklist

## Identity & Access
- [ ] Rotate `SESSION_SECRET`, `EMAIL_TOKEN_SECRET`, `INTERNAL_ROUTE_PREFIX`, `ADMIN_ROUTE_PREFIX`, and all API keys every 90 days.
- [ ] Enforce mTLS on the admin ingress and restrict DNS exposure to trusted networks.
- [ ] Configure admin IP allowlist in both WAF (e.g., Cloudflare) and application-level middleware.
- [ ] Require TOTP + WebAuthn for all admin accounts; store WebAuthn credentials in HSM-backed key vault.

## Infrastructure
- [ ] Deploy PostgreSQL and Redis within private subnets; deny public internet access.
- [ ] Enable automated backups with PITR and test restores quarterly.
- [ ] Run Terraform from CI with OIDC + least-privilege IAM roles.
- [ ] Apply Kubernetes NetworkPolicies to isolate pods and restrict egress.

## Application Hardening
- [ ] Set `Secure`, `HttpOnly`, `SameSite=Strict` cookies and confirm TLS termination at edge.
- [ ] Enable Cloudflare Bot Management or equivalent device fingerprinting provider.
- [ ] Configure dynamic rate limits per IP/user/API key via Redis + WAF rules.
- [ ] Confirm all Prisma queries use prepared statements (default) and review logs for anomalies.

## Observability & Response
- [ ] Ship structured logs to SIEM (Elastic, Splunk, Loki) with tamper detection.
- [ ] Configure Prometheus alerts for auth anomalies, rate limit spikes, and backup failures.
- [ ] Maintain on-call rotation with documented runbooks and paging policies.
- [ ] Exercise incident response playbook bi-annually.

## Compliance
- [ ] Perform dependency scanning (Snyk/Dependabot) and static analysis each CI run.
- [ ] Conduct annual penetration tests and remediate findings.
- [ ] Document data retention schedules and privacy assessments.

