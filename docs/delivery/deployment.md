# Deployment and release

## Release model and evidence

Document the artifact or distribution model, immutable artifact identity (version/commit/checksum as appropriate), representative acceptance target and evidence, release limitations, and explicit human release verdict. For each release, retain build/publish results and acceptance evidence. Distinguish build/publish correctness, representative runtime acceptance, and host/distribution compatibility when relevant; do not bypass host security controls to launch an artifact.

## Environment deployment, when applicable

Describe the actual deployment topology. A local desktop/CLI tool or library may have no staging or production environment deployment; record those steps as not applicable when true. For a service, adapt this example path:

`PR checks -> merge -> build artifact -> staging deploy -> smoke/acceptance -> approval -> production -> post-deploy checks`

When environments exist, record their purpose, deployment trigger, data policy, and approval. Prefer promoting the same verified artifact between environments instead of rebuilding it differently.

## Configuration, migrations, and recovery, when applicable

For deployed environments, describe configuration sources, secret storage, runtime identity, and least-privilege access; never store real secrets in the repository. For schema changes, document compatibility, migration order, backups, rollback limits, and recovery tests. Define rollback or roll-forward triggers and post-deploy health checks. Retain deployment result and post-deploy evidence for each release where these controls apply.

## MiniJSClock GitHub Pages path

Routine `.github/workflows/ci.yml` runs for pull requests targeting `main` and pushes to `main`. It has `contents: read` only and runs the canonical `make ci` contract on `ubuntu-24.04` after restoring exact Node/npm, checksum-verified security tools, project dependencies, Chromium, and Chromium native libraries. It cannot publish a release.

`.github/workflows/deploy-pages.yml` is manual (`workflow_dispatch`) and its build and deploy jobs run only for `refs/heads/main`. The build job repeats `make ci`, reads the existing Pages configuration, and uploads only `dist/` as the `github-pages` artifact. The dependent deploy job consumes that artifact in the `github-pages` environment using `pages: write` and `id-token: write`. Deployment concurrency does not cancel an in-progress release. The deploy action exposes `page_url` as the environment URL.

Repository Settings → Pages → Build and deployment → Source must be `GitHub Actions`; this was human-confirmed on 2026-09-24. Triggering the deployment workflow is a separate human release action. Its production result and hosted site checks remain release evidence; implementing or reviewing this task does not trigger deployment.
