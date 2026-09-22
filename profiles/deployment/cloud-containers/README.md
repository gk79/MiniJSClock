# Deployment profile: managed cloud containers

Use when internet-facing availability, managed scaling/operations, immutable artifacts, or environment separation justify cloud container hosting.

The cloud provider/service is a project ADR, not a generic starter assumption.

Recommended delivery shape:

1. CI verifies source and builds one immutable image/artifact.
2. Scan/sign/record provenance as required by risk level.
3. Push to registry.
4. Deploy the exact digest to staging.
5. Apply controlled database migrations with compatibility/rollback strategy.
6. Run smoke/acceptance/security checks.
7. Require production approval where risk warrants it.
8. Promote the same image digest to production.
9. Run post-deploy health checks and monitor telemetry.

Infrastructure-as-Code belongs under `infra/` once a provider is selected.
