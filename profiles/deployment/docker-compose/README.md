# Deployment profile: Docker / Compose

Use when reproducible multi-service local/staging runtime or container packaging is valuable.

Keep containers purposeful:

- separate independently deployed/runtime services, not every code module
- pin base images/digests according to project policy
- health checks for services
- non-root execution where practical
- secrets outside images/source
- minimal runtime images
- deterministic migrations/startup ordering

For local development, Compose is especially useful for PostgreSQL and other external dependencies while the application itself may still run directly under the debugger if that gives a better development loop.
