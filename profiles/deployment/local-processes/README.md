# Deployment profile: local host, no containers

Use when a controlled single host or workstation is the intended runtime and containers add more operational complexity than value.

Typical components:

- pinned runtime installed on the host
- service manager such as systemd for long-running backend processes
- reverse proxy/static serving only if required
- environment/secret files with restricted permissions or an OS secret store
- explicit application/data backup and restore procedure
- health check and log location documented in the runbook

CI still builds/tests in a clean environment even if production is not containerized.
