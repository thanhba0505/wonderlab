# CI/CD Pipeline & GitHub Actions — Wonderlab

## 1. Overview

Wonderlab utilizes GitHub Actions for continuous integration, automated release drafting, and continuous production deployment across decoupled Render workspaces:

- **Frontend Client (`client/`)**: Deployed to Render Frontend Workspace via `render.client.yaml` and Webhook Deploy Hook.
- **Backend Server (`server/`)**: Deployed to Render Backend Workspace via `render.server.yaml` and Webhook Deploy Hook.

Workflows reside in `.github/workflows/`:

- **`ci.yml`** (`🧪 CI`): Automated linting, typechecking, testing, and production builds on every Pull Request and push to `develop` or `main` with containerized PostgreSQL 16.
- **`release-drafter.yml`** (`📝 Release Drafter`): Parses commit history following Conventional Commits, calculates the next SemVer version, and maintains a comprehensive GitHub Draft Release targeting `main`.
- **`deploy.yml`** (`🚀 Deploy Production Services`): Merges `origin/develop` into `main` (`--no-ff`), synchronizes `package.json` versions, tags the official release, syncs back to `develop`, and triggers concurrent deployments on Render when a release is published (`release: [published]`).

---

## 2. CI Workflow (`.github/workflows/ci.yml`)

The CI workflow runs on `ubuntu-latest` and executes **4 parallel & decoupled jobs** to minimize developer wait times, achieve instant fail-fast feedback, and eliminate unnecessary database container overhead:

1. **`quality` (🎨 Quality & Types)**:
   - **Environment**: Lightweight VM without database container.
   - **Steps**: Checkout -> Setup pnpm / Node 24 -> Install dependencies -> `db:generate` -> `pnpm format:check` -> `pnpm lint` -> `pnpm typecheck`.
   - **Objective**: Delivers formatting, linting, and typecheck feedback in ~30-40s.

2. **`unit-tests` (🧪 Unit Tests)**:
   - **Environment**: Runs independently in parallel without database dependencies.
   - **Steps**: Checkout -> Setup pnpm / Node 24 -> Install dependencies -> `db:generate` -> `pnpm test` (Vitest Client + Jest Server unit tests).
   - **Objective**: Ensures 100% of mathematical simulation engines, algorithms, and components execute correctly in ~30-35s.

3. **`e2e-tests` (🛡️ E2E Tests - Database)**:
   - **Environment**: Launches Service Container `postgres:16-alpine` (port `5434:5432`) with automated health checks.
   - **Steps**: Environment setup -> `prisma migrate deploy` -> `db:seed` -> `pnpm test:e2e`.
   - **Objective**: Validates end-to-end integration with PostgreSQL (authentication, Argon2id password hashing, session cookies, comments, telemetry).

4. **`build` (📦 Build Applications)**:
   - **Constraint**: Runs strictly after `quality` and `unit-tests` pass successfully (`needs: [quality, unit-tests]`).
   - **Steps**: Production Next.js standalone SSG bundle compilation and NestJS production build (`pnpm build`).

---

## 3. Release Drafter Workflow (`.github/workflows/release-drafter.yml`)

The workflow employs an automated Python script [`.github/scripts/update_draft_release.py`](file:///Users/lethanhba/workspace/app/Wonderlab/.github/scripts/update_draft_release.py):

- **Commit Aggregation**:
  - Independent of PR labels, capturing 100% of commits pushed directly or via Pull Requests.
  - Queries `git log` from the previous official release tag to `HEAD`.
- **Conventional Commits Categorization**:
  - 🚀 **Features & Simulations**: `feat:`, `feat(...):`
  - 🐛 **Bug Fixes**: `fix:`, `fix(...):`
  - ⚡ **Performance & Refactoring**: `perf:`, `refactor:`
  - 📚 **Documentation**: `docs:`, `docs(...):`
  - 🔧 **Maintenance & Tooling**: `chore:`, `ci:`, `test:`, `build:`
- **Release Notes Formatting**:
  - Direct commit links with author credits: `• {msg} ([{short_hash}](https://github.com/.../commit/{full_hash})) by @{author}`.
- **SemVer Calculation**:
  - Identifies breaking changes (`BREAKING CHANGE:`, `feat!:`) to bump Major, `feat` for Minor, or `fix` for Patch.
  - Updates or creates GitHub Draft Releases with predicted tag and detailed change log without polluting branch histories.

---

## 4. Production Deployment Workflow (`.github/workflows/deploy.yml`)

Triggered automatically upon official GitHub Release publishing or manual tag pushes:

- **Trigger Events & Automated Merge**:
  - `release: [published]`: When clicking **Publish release** on GitHub Draft:
    1. Merges `origin/develop` into `main` with a non-fast-forward merge commit (`git merge origin/develop --no-ff`).
    2. Synchronizes version numbers in `package.json` files and commits to `main` (`chore(release): vX.Y.Z [skip ci]`).
    3. Tags the official release commit on `main`.
    4. Syncs the release commit back into `origin/develop` to ensure branch parity.
    5. Dispatches deployment notification `STARTED` to Central Gateway (`#deployments`).
    6. Triggers `wonderlab-server` build via Render REST API and registers `production - server` in GitHub Deployments with `state: in_progress` ⏳.
    7. Triggers `wonderlab-client` build via Render REST API and registers `production - client` in GitHub Deployments with `state: in_progress` ⏳.
    8. Registers overall `production` deployment with `state: in_progress` ⏳.
    9. Executes [`scripts/verify-deployment.sh`](file:///Users/lethanhba/workspace/app/Wonderlab/scripts/verify-deployment.sh) with fail-fast polling against Render Deploy API and live `/health` endpoints.
    10. Transitions individual GitHub Deployments (`production - server` and `production - client`) to `success` 🟢 as soon as each service responds healthy.
    11. Finalizes overall `production` deployment to `success` 🟢 and dispatches `SUCCESS` alert to Slack `#deployments`.
    12. On failure: catches errors and marks all pending GitHub Deployments as `failure` ❌ with direct links to Render logs, dispatching `FAIL` alert to Slack.
  - `push: tags: ['v*']`: Dispatches on manual version tag pushes.
  - `workflow_dispatch`: Enables emergency manual deployment triggering per service (`client`, `server`, or `all`).

- **GitHub Repository Secrets**:
  - `RENDER_API_KEY`: Render Account REST API Bearer Token.
  - `RENDER_SERVER_SERVICE_ID`: Render Service ID for `wonderlab-server`.
  - `RENDER_CLIENT_SERVICE_ID`: Render Service ID for `wonderlab-client`.
  - `GATEWAY_URL`: Central Gateway endpoint (`https://central-gateway-server.onrender.com/api/v1`).
  - `GATEWAY_SECRET_KEY`: Central Gateway Bearer secret for authenticated Slack dispatching.

- **GitHub Deployments Architecture**:
  - 🟢 `production - client` (`https://wonderlab.io.vn`)
  - 🟢 `production - server` (`https://wonderlab-server.onrender.com/api/v1/health`)
  - 🟢 `production` (`https://wonderlab.io.vn`)

---

## 5. Git Activity & Central Gateway Orchestration (`.github/workflows/git-activity.yml`)

The repository communicates all repository events (pushes, pull requests, and branch creations) to Slack via Central Gateway:

- **Events Handled**:
  - `push`: Dispatches commit summaries, authors, commit count, and compare URLs to `#git-activity`.
  - `pull_request`: Dispatches `opened`, `closed`, and `reopened` events. Specifically formats `closed` PRs with `merged: true` as `🟣 [WONDERLAB] Pull Request Merged` with distinct violet styling.
  - `create`: Dispatches new branch announcements to `#git-activity`.
- **Security Policy**: Upstream repositories only hold `GATEWAY_SECRET_KEY` and never access raw Slack bot tokens.
