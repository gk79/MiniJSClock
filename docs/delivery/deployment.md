# Deployment and release

## Release model and evidence

Document the artifact or distribution model, immutable artifact identity (version/commit/checksum as appropriate), representative acceptance target and evidence, release limitations, and explicit human release verdict. For each release, retain build/publish results and acceptance evidence. Distinguish build/publish correctness, representative runtime acceptance, and host/distribution compatibility when relevant; do not bypass host security controls to launch an artifact.

## Environment deployment, when applicable

Describe the actual deployment topology. A local desktop/CLI tool or library may have no staging or production environment deployment; record those steps as not applicable when true. For a service, adapt this example path:

`PR checks -> merge -> build artifact -> staging deploy -> smoke/acceptance -> approval -> production -> post-deploy checks`

When environments exist, record their purpose, deployment trigger, data policy, and approval. Prefer promoting the same verified artifact between environments instead of rebuilding it differently.

## Configuration, migrations, and recovery, when applicable

For deployed environments, describe configuration sources, secret storage, runtime identity, and least-privilege access; never store real secrets in the repository. For schema changes, document compatibility, migration order, backups, rollback limits, and recovery tests. Define rollback or roll-forward triggers and post-deploy health checks. Retain deployment result and post-deploy evidence for each release where these controls apply.
