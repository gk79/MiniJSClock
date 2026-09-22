# ADR-002: Static hosting target

- Status: Accepted
- Date: 2026-09-22
- Owners: Product owner / repository owner

## Context

MiniJSClock is a client-only Vue/Vite single-page application whose production output is static assets. The repository already lives on GitHub and the approved architecture does not require a backend, server-side rendering, runtime secrets, or a separate application platform.

The hosting target should therefore minimize operational surface and additional services while supporting a repeatable build-and-deploy path from the repository.

## Decision

Use **GitHub Pages** as the first-release hosting target.

Deployment shall use **GitHub Actions** to build the Vite application and publish the generated static artifact to GitHub Pages.

For a repository Pages URL of the form `https://<owner>.github.io/MiniJSClock/`, Vite must be configured with the repository sub-path as its production base path (for this repository, `/MiniJSClock/`) unless a custom domain or user-level Pages URL changes that requirement.

The deployment workflow, exact action versions, Node version, and verification gates will be defined during bootstrap. Production deployment remains subject to the project's human-controlled release decision.

## Alternatives considered

### Cloudflare Pages

A strong static-hosting option with CDN and deployment features, but it would add another external service and account-level integration without a current product requirement that justifies it.

### Netlify / Vercel

Both support Vite/static deployments well, but their additional platform capabilities are unnecessary for a client-only application with no backend or SSR requirements.

### Manual static hosting

Technically possible, but it would add avoidable operational steps and weaken the repository-driven deployment path.

## Consequences

Positive:
- repository and hosting stay within the same GitHub workflow;
- no new runtime backend or service dependency is introduced;
- GitHub Actions can build and deploy the static Vite artifact;
- operational setup remains small and reviewable in versioned workflow files.

Negative / trade-offs:
- the project depends on GitHub Pages and GitHub Actions availability for hosted releases;
- repository sub-path hosting requires correct Vite base-path configuration;
- preview-environment capabilities are more limited than some dedicated frontend hosting platforms.

Security/operations:
- deployment should use the minimal Pages permissions required by GitHub;
- no application secrets should be needed for the static site itself;
- the deployment workflow becomes part of the release surface and must pass normal repository review and verification.

## Verification / revisit trigger

Verify during bootstrap/release setup that:
- `npm run build` produces a self-contained static artifact;
- the deployed GitHub Pages URL loads application assets correctly under the repository sub-path;
- direct reload of the application entry point works for the no-router first-release design;
- the GitHub Actions deployment uses the repository's approved verification gates before deployment.

Revisit this ADR if:
- the application requires server-side functionality, SSR, edge functions, authenticated infrastructure, or runtime secrets;
- a custom domain or hosting policy materially changes deployment requirements;
- GitHub Pages limitations become a product or operational blocker.
