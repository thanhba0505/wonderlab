# CI/CD Pipeline & GitHub Actions — Wonderlab

## 1. Overview

Wonderlab utilizes GitHub Actions for continuous integration and automated quality gates.

Workflows reside in `.github/workflows/`:

- **`ci.yml`**: Validates every pull request and push to the `main` branch.
- **`deploy.yml`**: Manual or dispatch trigger for Render deployment webhooks.

---

## 2. CI Workflow (`.github/workflows/ci.yml`)

The CI job runs on `ubuntu-latest` and executes the following deterministic steps:

1. **Checkout**: Checks out source code via `actions/checkout@v4`.
2. **Install pnpm**: Sets up `pnpm` pinned to `12.11.2` using `pnpm/action-setup@v4`.
3. **Setup Node.js**: Installs Node 22 with automatic pnpm store caching via `actions/setup-node@v4`.
4. **Install Dependencies**: Runs `pnpm install --frozen-lockfile`.
5. **Code Style Check**: Runs `pnpm format:check` using Prettier.
6. **Linting**: Runs `pnpm lint` across client and server.
7. **Type Checking**: Runs `pnpm typecheck` with strict TypeScript.
8. **Unit Tests**: Executes `pnpm test`.
9. **E2E Tests**: Executes `pnpm test:e2e` (Server NestJS health contract).
10. **Build**: Compiles production bundles via `pnpm build`.

### Principles:

- **Zero Secret Dependency**: The CI workflow does not require production secrets or database access to pass.
- **Fail Fast**: If formatting or linting fails, subsequent heavy build steps are aborted early.
- **No Compromises**: No tests or type errors may be bypassed to turn the pipeline green.

---

## 3. CD Deployment Workflow (`.github/workflows/deploy.yml`)

When Render Blueprints are connected directly to GitHub, Render automatically triggers builds upon merge to `main`.

For explicit control or manual promotions:

- Workflow dispatch in `deploy.yml` allows triggering Render deploy webhooks (`RENDER_CLIENT_DEPLOY_HOOK`, `RENDER_SERVER_DEPLOY_HOOK`) configured in GitHub repository secrets.
