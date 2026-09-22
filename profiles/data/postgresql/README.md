# Data profile: PostgreSQL

Choose PostgreSQL when multi-user concurrency, managed backups/HA, richer operational controls, or cloud deployment requirements justify a separate database service.

Required project decisions:

- supported PostgreSQL version/service tier
- connection/credential management
- migration ownership and deployment ordering
- connection pooling
- backup/restore and retention
- production access policy
- integration-test strategy using a real PostgreSQL engine (container/service/ephemeral database)

Avoid silently using SQLite as the integration-test substitute when database semantics are material to correctness.
