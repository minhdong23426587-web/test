# Incident Response Playbook

1. **Detection**
   - SIEM triggers high severity alert (auth anomaly, mTLS failure, rate limit exhaustion).
   - On-call acknowledges within 5 minutes.

2. **Containment**
   - Revoke affected session families via Redis revocation list.
   - Rotate API keys and secrets using Vault automation.
   - Isolate impacted Kubernetes pods via NetworkPolicy quarantine namespace.

3. **Eradication**
   - Deploy patched container image through GitHub Actions `deploy` job.
   - Run Snyk + dependency diff to confirm CVE coverage.
   - Validate database integrity using tamper-evident audit log hash chain.

4. **Recovery**
   - Restore service via progressive rollout (25% → 50% → 100%) using Kubernetes rollout strategy.
   - Monitor Prometheus, Grafana dashboards, and WebSocket presence for anomalies for 24 hours.

5. **Post-Incident**
   - Conduct blameless retrospective within 72 hours.
   - File compliance report summarizing detection, timeline, impact, and remediation.
   - Update runbooks and Terraform security controls as required.

## Token & Key Rotation Procedures
- Use Vault transit engine to generate replacement secrets.
- Update GitHub Actions OIDC deployment job to pull new secret version.
- Trigger `terraform apply` with rotated secret references.

## Forensic Data Collection
- Snapshot PostgreSQL via RDS automated snapshot.
- Export Redis memory profile and slow log.
- Archive Kubernetes audit logs and Cloudflare/WAF request logs.
