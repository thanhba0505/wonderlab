# 5. Commit-Aware Draft Release Generation & Automated Render CD

Date: 2026-10-24
Status: Accepted

## Context

Following the initial CI pipeline setup, Wonderlab required a streamlined release and deployment workflow:

1. **Commit Tracking**: The initial release drafting action (`release-drafter/release-drafter@v6`) relied exclusively on merged Pull Request labels. Commits pushed directly to `main` via Conventional Commits were not captured, producing empty release notes (`• No changes`).
2. **Automated CD**: Deployments needed to happen deterministically upon publishing official releases, rather than rebuilding unnecessarily on every micro-commit to `main`.
3. **Environment Visibility**: Deployments needed clear, legible environment names on GitHub (`Wonderlab Server`, `Wonderlab Client`, `Wonderlab DB`) rather than internal branch prefixes (`main - wonderlab-server`).

## Decision

We implemented a commit-aware release drafter script and Render Deploy Hook CD pipeline modeled after the `nexus` ecosystem architecture:

1. **Commit-Aware Python Release Drafter**:
   - Implemented `.github/scripts/update_draft_release.py` executed in `.github/workflows/release-drafter.yml`.
   - Directly inspects `git log` since the latest release tag (or repository inception) without depending on PR labels.
   - Categorizes commits by Conventional Commit conventions:
     - 🚀 Features (`feat:`)
     - 🐛 Bug Fixes (`fix:`)
     - ⚡ Performance & Refactoring (`perf:`, `refactor:`)
     - 📚 Documentation (`docs:`)
     - 🔧 Maintenance & CI/CD (`chore:`, `ci:`, `test:`, `build:`)
   - Links each item to its GitHub commit with author attribution.
   - Automatically bumps SemVer (Major, Minor, Patch) and synchronizes monorepo `package.json` versions.
   - Updates or creates the GitHub Draft Release via GitHub CLI (`gh release`).

2. **Automated Render CD via Deploy Hooks**:
   - In `render.yaml`, set `autoDeploy: false` for `wonderlab-server` and `wonderlab-client`.
   - Implemented `.github/workflows/deploy.yml` triggered on `release: [published]` or manual `workflow_dispatch`.
   - Connects to Render using `RENDER_SERVER_DEPLOY_HOOK` and `RENDER_CLIENT_DEPLOY_HOOK`.
   - Handles asynchronous `HTTP 202 Accepted` response status from Render deploy hooks.
   - Records deployments under human-readable GitHub Environments: `Wonderlab Server`, `Wonderlab Client`, and `Wonderlab DB`.

## Consequences

- Every commit pushed to `main` updates the GitHub Draft Release in real time.
- Official releases can be published with a single click, instantly triggering automated deployment of backend and frontend services on Render.
- CI and CD pipelines maintain 100% deterministic green status with automated PostgreSQL container testing.
