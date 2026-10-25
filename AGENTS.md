# AGENTS.md — Wonderlab AI Coding Guidelines

Welcome to **Wonderlab**. This document is the primary source of truth and authoritative set of rules for AI coding assistants working in this repository.

> [!CRITICAL]
>
> ### 🚨 MANDATORY WORKTREE-EXCLUSIVE CODING PROTOCOL
>
> **Before executing ANY git command, editing ANY file, or creating ANY branch**:
>
> 1. **MANDATORY**: Run `git worktree list` on the very first turn to inspect active worktree allocations across the repository.
> 2. **STRICT WORKTREE-EXCLUSIVE RULE**:
>    - The main workspace (`Wonderlab`) is strictly an idle root anchor on `develop`.
>    - **NEVER** edit files, run development commands, `git checkout`, `git checkout -b`, or `git stash` in `/Users/lethanhba/workspace/app/Wonderlab`!
>    - **ALL CODING MUST OCCUR INSIDE A PERSISTENT WORKTREE**:
>      - `Wonderlab-worktree-1` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-1`, Client `4200`, Server `4201`, branch `worktree-1`)
>      - `Wonderlab-worktree-2` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-2`, Client `4300`, Server `4301`, branch `worktree-2`)
>      - `Wonderlab-worktree-3` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-3`, Client `4400`, Server `4401`, branch `worktree-3`)
>      - `Wonderlab-worktree-4` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-4`, Client `4500`, Server `4501`, branch `worktree-4`)
>      - `Wonderlab-worktree-5` (`/Users/lethanhba/workspace/app/Wonderlab-worktree-5`, Client `4600`, Server `4601`, branch `worktree-5`)
> 3. Inside the selected idle worktree, sync and create a task branch via `git fetch origin && git checkout -B <type>/<task-name> origin/develop` (never `git checkout develop`).
> 4. All file edits (`edit_file`, `write_file`) and command executions (`run_command`) MUST strictly use absolute paths or `cd` targeting the chosen worktree directory.
> 5. When implementation passes `pnpm check`, push directly to `develop` via `git fetch origin && git rebase origin/develop && git push origin HEAD:develop`, reset the worktree back to `worktree-N`, and pull `develop` in the main workspace.

---

## 1. Product Overview

Wonderlab is an interactive web platform dedicated to exploring science, probability, paradoxes, logic puzzles, thought experiments, visual simulations, and mind games.

- **Audience**: General public with curiosity for science, math, and logic; no formal prerequisite knowledge required.
- **Mission**: Demystify counter-intuitive concepts into hands-on visual experiences where users directly manipulate parameters, observe outcomes, and develop intuitive understanding.
- **Current Scope**: Monorepo foundation stage. Includes Next.js client with high-fidelity dark-mode homepage and admin placeholder, NestJS backend with `/health` endpoint, Docker Compose for local PostgreSQL, comprehensive tooling, test suites, and CI/CD.

---

## 2. Monorepo Architecture

Wonderlab uses a unified **pnpm workspace** monorepo:

```text
wonderlab/
├── client/          # Next.js 15 App Router frontend
├── server/          # NestJS 10 REST API backend
├── docs/            # Engineering & architecture documentation
├── .github/         # CI/CD workflows, issue templates, PR template
├── .agents/skills/  # Project-specific AI agent playbooks
├── scripts/         # Local development & verification scripts
├── docker-compose.yml # Local PostgreSQL container service
└── render.yaml      # Render blueprint deployment specification
```

### Boundaries & Responsibilities:

- **Client (`/client`)**: User interface, routing, interactive simulations, client-side state. Communicates with server via REST (`NEXT_PUBLIC_API_BASE_URL`).
- **Server (`/server`)**: Standalone REST API backend. Global prefix `/api/v1`. Swagger documentation at `/api/docs`. Currently exposes only `/health`.
- **Database (`docker-compose.yml`)**: Local PostgreSQL 16 on loopback `127.0.0.1:5434`. Not connected to server in foundation phase; ORM choice is intentionally deferred.

---

## 3. Technology & Version Policy

- **Node.js**: `v24.x` / LTS (see `.nvmrc`).
- **Package Manager**: `pnpm@12.11.2` (pinned in root `package.json`). Never use `npm` or `yarn`. Never edit `pnpm-lock.yaml` manually.
- **Client**: Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS, Lucide React, Motion.
- **Server**: NestJS 10, TypeScript strict, `@nestjs/terminus`, `@nestjs/swagger`, `class-validator`, `class-transformer`.
- **Database**: PostgreSQL 16 Alpine containerized with Docker Compose.

---

## 4. Environment & Security Rules

1. **Zero Secret Leakage**: Never commit `.env`, `.env.local`, API tokens, or database passwords. All environment files with secrets must be ignored by `.gitignore`.
2. **Client Boundaries**: Only variables prefixed with `NEXT_PUBLIC_` are accessible in client bundles. Never place server secrets or credentials in `NEXT_PUBLIC_*`.
3. **Database Security**: Local PostgreSQL must bind exclusively to `127.0.0.1` (loopback) to prevent public network exposure.
4. **Admin Route**: `/admin` is a secure administrative console requiring active `Role.ADMIN` authentication verified via HttpOnly session cookies. Unauthenticated visitors are routed through the authentication wall.
5. **CORS Policy**: CORS origins must be explicitly matched against `CORS_ORIGINS` environment variables.

---

## 5. UI/UX Design Principles & Anti-AI Standards for Wonderlab

- **Visual Aesthetic**: "Clean Paper & Lab Editorial" — high-craft scientific editorial design with slate-100 canvas (`#f1f5f9`), crisp white surfaces (`#ffffff`), hairline technical borders (`border-slate-300/85`), layered depth (`shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]`), and semantic accents (Cobalt, Violet, Amber, Emerald).
- **Typography Architecture**:
  - `Be Vietnam Pro` (Sans) for optical Vietnamese readability, balanced tone diacritics, and relaxed reading lines.
  - `Space Grotesk` (Heading) for geometric, authoritative scientific titles (`text-slate-900`).
  - `JetBrains Mono` (Mono) with `tabular-nums` for simulation counters, probabilities, and formulas.
  - **Minimum Font Size Standard ($\ge 12\text{px}$)**: Strictly forbid any font size below `12px` (`text-xs`). Never use `text-[11px]`, `text-[10px]`, `text-[9px]`, `text-[8px]`, or any micro-text. All captions, badges, metadata, and helper text must be at least `text-xs` (12px / 0.75rem) to guarantee visual accessibility and clean editorial sharpness.
  - **Section Headings Standard (18px)**: Standardize all primary section headings (`h2`) in simulation workflows and editorial views to `18px` (`text-[18px]` or `text-lg`), keeping titles clean, prominent, and proportional without aggressive oversized headers.
- **Anti-AI Slop Guardrails**:
  1. _No unmotivated purple/pink linear gradients_ on buttons or text.
  2. _No muddy glassmorphism everywhere_ (`backdrop-blur` stacked blindly). Use crisp, opaque surfaces.
  3. _No cookie-cutter 3-column identical card grids_. Use asymmetric Bento Grids and editorial rhythms.
  4. _No SaaS buzzword copy_ ("Supercharge your mind", "Revolutionary platform"). Keep copy intellectually curious, authentic, and scientific.
  5. _No oversized toy-like border radiuses_. Calibrate radii: `rounded-md` (badges/inputs), `rounded-lg` (buttons), `rounded-xl` (cards).
  6. _No multi-nested border boxes (> 2 layers)_. Never wrap container boxes inside cards when children already have borders. Use borderless background tints (`bg-slate-100/70`), left accents (`border-l-4`), or dividers.
  7. _No internal tech stack boasting or leaking dev endpoints to public UI_.
     - **NEVER** expose internal library/algorithm names (e.g. `Argon2id`, `HttpOnly Cookie`, `OWASP compliant`, `Prisma`, `JWT`) on public forms or user screens.
     - **NEVER** place internal developer links, localhost ports, or raw health endpoints (e.g. `http://localhost:4101/api/docs`, `NestJS Server API: Sẵn sàng hoạt động (/api/v1/health)`) in public footers or public navigation.
     - **NEVER** dump framework version strings into client UI copy.
  8. _No micro font sizes (< 12px)_. Never use arbitrary micro font sizes (`text-[11px]`, `text-[10px]`, `text-[9px]`, `text-[8px]`). The minimum allowed font size across the entire platform is strictly 12px (`text-xs`). Section headings are standardized to `18px` (`text-[18px]`).
  9. _No developer self-narration, code concepts, config names, or architecture descriptions on user UI_.
     - **NEVER** expose architecture models, backend implementation details, configuration labels, code concepts, or developer self-narration on any user-facing screens or public UI.
     - **Strictly Forbidden Examples**:
       - Architecture/pattern jargon: `"Mô hình phản biện 2 cấp"`, `"cấu trúc lồng 2 cấp (Root -> Reply)"`, `"xử lý bất đồng bộ"`, `"REST API"`, `"MVC pattern"`.
       - Formatting / implementation self-narration: `"Biểu diễn phân số & số mũ"`, `"render trực tiếp từ state"`, `"dữ liệu tính toán live"`, `"cấu hình tham số"`, `"component"`.
       - Developer / code jargon: Variable names, database column names, internal algorithm versions, config keys.
     - **Rule of Thumb**: If a phrase describes _how the software is coded, configured, or architected_ rather than the _scientific subject matter or authentic user action_, it MUST NOT appear in the UI. Keep all copy strictly scientific, editorial, and natural.
- **No Faux Data**: Never display mock user counters, fake review badges, or placeholder vanity statistics. Show honest simulation counters calculated live in the browser.
- **No Lorem Ipsum**: All copy must be meaningful, scientific, engaging, and in Vietnamese or English according to user language settings.
- **Interactive Authenticity & Tactile Feel**: Every clickable element (e.g. Monty Hall doors) must function accurately with physical feedback (`active:scale-[0.98]`) and update mathematical probabilities live with `font-mono tabular-nums`.
- **Accessibility & Motion**: Respect `prefers-reduced-motion`. Provide clear keyboard focus indicators (`focus-visible:ring-2 focus-visible:ring-cyan-400`).

---

## 6. Coding & TypeScript Conventions

- **TypeScript Strict Mode**: No `any`. Explicit function return types and interface contracts.
- **Clean Code & Guard Clauses**: Validate inputs early; return early. Avoid nested `if/else` past 2 levels.
- **Naming**: Intent-revealing names (`isDoorRevealed`, `calculateMontyProbabilities`). No abbreviations or single-character variables except standard loop indices.
- **Imports**: Group imports (standard/external first, internal path aliases `@/...` second, relative third).

---

## 7. Testing & Verification Policy

Always run the unified root scripts before declaring work complete:

```bash
pnpm format:check   # Prettier formatting verification
pnpm lint           # ESLint across all workspaces
pnpm typecheck      # TypeScript typecheck for client and server
pnpm test           # Unit tests across packages
pnpm test:e2e       # Server E2E tests
pnpm build          # Production builds for client and server
pnpm check          # Runs all verification steps in sequence
```

### Lean & Core-Only Testing Standard (Avoid CI Slowdown & Test Bloat):

- **Strict Core-Only Scope**: Tests must **ONLY** be written for **core, critical functionality**. Never write tests indiscriminately for every file, component, or utility. Bloated, superficial test suites increase maintenance overhead and needlessly slow down CI and local verification cycles.
- **What MUST Be Tested (Core Functionality Only)**:
  1. **Scientific & Mathematical Simulation Engines**: Mathematical correctness, probabilistic convergence, quantum wave formulas, game-theory payoffs, and paradox simulation logic (e.g., Monty Hall, Birthday Paradox, Zeno's Paradox, Double-Slit).
  2. **Critical Backend Business Logic & Security**: Core service logic in NestJS (`*.service.spec.ts`) dealing with authentication, hashing (Argon2id), token issuance/validation, permissions, data soft-deletion, and transactional mutations.
  3. **High-Value HTTP Integration (E2E Tests)**: Complete request/response lifecycle verification via Supertest (`server/test/*.e2e-spec.ts`) for primary API routes (`/health`, `/auth`, `/comments`, `/simulations`).
- **What MUST NOT Be Tested (Strictly Forbidden Test Bloat)**:
  1. **Generic UI Components & Styling**: Do **NOT** write unit tests for React presentational components, buttons, inputs, dropdowns, badges, tags, modals, or page layouts just to assert that DOM nodes render or CSS classes exist.
  2. **Static Data & Dictionaries**: Do **NOT** write tests verifying hardcoded array lengths, essay content strings, category lists, or static configuration objects.
  3. **Boilerplate Controller Pass-Throughs**: Do **NOT** write unit tests for simple controller methods that merely pass arguments directly to a service (`controller.spec.ts` mocking services). These are redundant and already covered by E2E tests and service specs.
  4. **Trivial Utilities & Third-Party Wrappers**: Do **NOT** write tests for simple library wrappers (e.g., `cn()` wrapping `clsx` and `tailwind-merge`) or basic environment variable getters.
  5. **Mock-Heavy Component Lifecycle Tests**: Do **NOT** create fragile client component tests that mock every React hook, router, or API call just to verify form submissions or button clicks.
- **Fast CI Execution Target**: The unit test suite must remain lean, highly targeted, and fast (< 5s). Every test must provide clear, high-value regression prevention for critical logic.

### Development Server Execution Policy:

- **Strictly Use `pnpm dev` or `pnpm dev:client` — NEVER Run `pnpm start` / `next start`**:
  - Agents must **NEVER** launch development servers using `pnpm start`, `pnpm --filter wonderlab-client start`, or `next start`.
  - `next start` runs an immutable production server that binds to a static in-memory `BUILD_ID`. Whenever `next build` or `pnpm check` runs, `.next/` assets on disk are overwritten with a new build hash, throwing `next start` into an irrecoverable `400 Bad Request` state for all CSS and JS chunks (rendering broken, unstyled HTML).
  - Agents must strictly use the development server commands:
    - Full stack: `pnpm dev`
    - Client only: `pnpm dev:client` (runs `next dev -p ${PORT:-4100}`)
    - Server only: `pnpm dev:server` (runs NestJS with `--watch`)
  - `next dev` provides Hot Module Replacement (HMR) and dynamic on-demand compilation, remaining fully immune to build-ID lockouts.

---

## 8. Git & Workflow Conventions

- Commit format: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`).
- Always verify working tree and secrets with `git status` before committing.
- Never force push (`--force`) to `main` or `develop`.
- **Branching & Direct Merge Workflow (Default: `develop`, Production: `main`)**:
  - **Default Branch (`develop`)**: `develop` is the default active branch where all engineering occurs. The `main` branch is reserved strictly for production releases.
  - **Branch-First Development**: Never edit or commit directly on `develop` or `main` without creating a dedicated branch first. All development must take place on dedicated task branches (`feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`).
  - **Direct Merge into `develop` (No Pull Requests)**:
    - Pull Requests are eliminated for agent tasks.
    - Upon completing code and passing `pnpm check`, the agent merges the task branch directly into `develop` and pushes `develop` to `origin develop` autonomously without requiring user intervention.
    - Each push to `develop` automatically updates the Draft Release on GitHub via `release-drafter.yml`.
  - **Branch Cleanup**:
    - After merging into `develop` and pushing to `origin develop`, delete the local task branch immediately to keep the workspace clean.
  - **Concurrent Tasks & Persistent Worktree Pool (Strict Worktree-Exclusive Coding)**:
    - The repository maintains five persistent Git Worktrees alongside the main workspace. The main workspace (`Wonderlab`) is strictly an idle root anchor on `develop` and must NEVER be used for direct coding or task branches.
    - **Worktree Allocation & Partitioned Ports**:
      - `Wonderlab` (Main workspace): Idle root anchor on `develop` (no coding). Client: `4100`, Server: `4101`.
      - `Wonderlab-worktree-1`: Client on `http://localhost:4200`, Server on `http://localhost:4201`. Idle branch: `worktree-1` (tracking `origin/develop`).
      - `Wonderlab-worktree-2`: Client on `http://localhost:4300`, Server on `http://localhost:4301`. Idle branch: `worktree-2` (tracking `origin/develop`).
      - `Wonderlab-worktree-3`: Client on `http://localhost:4400`, Server on `http://localhost:4401`. Idle branch: `worktree-3` (tracking `origin/develop`).
      - `Wonderlab-worktree-4`: Client on `http://localhost:4500`, Server on `http://localhost:4501`. Idle branch: `worktree-4` (tracking `origin/develop`).
      - `Wonderlab-worktree-5`: Client on `http://localhost:4600`, Server on `http://localhost:4601`. Idle branch: `worktree-5` (tracking `origin/develop`).
      - PostgreSQL: Shared container on `127.0.0.1:5434` (`docker compose up -d`).
    - **Worktree Invariant (Git Rule)**: Git does NOT permit checking out `develop` in multiple worktrees simultaneously because `develop` is checked out in `Wonderlab`. Always branch off `origin/develop` in worktrees (`git checkout -B <type>/<task-name> origin/develop`).
    - **Standard Execution & Direct Merge Workflow**:
      - Choose any available idle worktree (e.g. `Wonderlab-worktree-1` through `Wonderlab-worktree-5`):
        ```bash
        cd /Users/lethanhba/workspace/app/Wonderlab-worktree-1
        git fetch origin
        git checkout -B <type>/<task-name> origin/develop
        # Perform implementation edits and verify:
        pnpm check
        # Rebase onto latest origin/develop and push directly to develop:
        git fetch origin
        git rebase origin/develop
        git push origin HEAD:develop
        # Reset worktree back to idle tracking branch:
        git checkout -B worktree-1 origin/develop
        git branch -d <type>/<task-name>
        # Sync main workspace clean develop copy:
        git -C /Users/lethanhba/workspace/app/Wonderlab pull origin develop
        ```
    - **Persistent Retention Policy**: Do NOT delete the worktrees upon task completion. Keeping them persistent preserves `node_modules`, Prisma artifacts, and build caches, eliminating repetitive installation overhead.
    - Worktrees guarantee zero port collision, zero dirty stash risk, and total process isolation for parallel development.
- **Single Source of Truth for Versioning**:
  - Root `package.json` is the sole, authoritative source of truth for the project version (`version`).
  - Both `client` (`next.config.ts` -> `process.env.NEXT_PUBLIC_APP_VERSION`) and `server` (`server/src/common/version.ts`) dynamically consume this single root version.
  - Never hardcode version strings in health endpoints, Swagger, or application copy.
  - **Version Update Policy**: The project version in `package.json` must ONLY be bumped upon official release events (`release: [published]` or tag release `push: tags: ['v*']`). NEVER bump version numbers on draft releases or regular commits pushed to `develop`.
- **Automated Production Release & Tag-Driven Deployment**:
  - **Releasing to Production (`main`)**: When the user publishes an official GitHub Release (or pushes a `v*` tag), GitHub Actions (`deploy.yml`) automatically:
    1. Merges `origin/develop` into `main` (`git merge origin/develop --no-ff`).
    2. Bumps `package.json` version and commits to `main` (`chore(release): vX.Y.Z [skip ci]`).
    3. Tags the commit and pushes `main` and tag to GitHub.
    4. Syncs the version bump commit back to `origin/develop`.
    5. Triggers deployment hooks to Render.
  - **NEVER** deploy to Render manually or trigger ad-hoc `workflow_dispatch` runs for regular releases.

---

## 9. Non-Negotiable Agent Rules

1. **Mandatory Worktree-Exclusive Protocol**: Run `git worktree list` on your very first turn to identify an idle worktree (`Wonderlab-worktree-1` through `Wonderlab-worktree-5`). The main workspace `Wonderlab` is strictly an idle root anchor on `develop` — NEVER edit files, checkout task branches, or code in `Wonderlab`. Always branch off `origin/develop` inside an idle worktree, code and verify with `pnpm check`, push directly to `origin develop`, and reset the worktree to its tracking branch.
2. **Read Before Writing**: Inspect existing files and documentation before editing.
3. **No Unrequested Scope Creep**: Do not add user management, authentication, payment, or complex databases until explicitly requested.
4. **No Fake Completions**: Never declare tests or builds have succeeded without actually executing them and inspecting the output.
5. **Preserve Documentation Integrity**: Update docs in `docs/` whenever architectural decisions or workflows change.
6. **Publish-Tag Deployments Only**: Never trigger production deployments to Render via manual commands or arbitrary scripts. Always use official tag releases (`git tag vX.Y.Z && git push origin vX.Y.Z` or publishing a GitHub Release).
7. **Branch-First Development & Direct Merge into Develop**: Never commit directly onto `develop` or `main` without a dedicated branch. Always create a task branch (`feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`), verify with `pnpm check`, merge directly into `develop` (or push `HEAD:develop` from worktrees), and push to `origin develop`. `main` is updated strictly via the automated Release workflow.
8. **Development Server Execution Standard (`pnpm dev` only)**: Agents must NEVER start the client application using `pnpm start`, `pnpm --filter wonderlab-client start`, or `next start`. Always use `pnpm dev` or `pnpm dev:client`. `next start` is strictly an immutable production server that binds to a static in-memory `BUILD_ID`, resulting in catastrophic `400 Bad Request` asset errors, CSS stylesheet drop (FOUC), and permanent client-side chunk loading failures whenever background builds run.
9. **Strict English for All Commits and Repository Guidelines**: All commit messages, merge commit messages, and repository guidelines must be authored strictly and exclusively in English.
10. **Lean & Core-Only Testing Rule**: Write tests ONLY for core, critical business logic, scientific/mathematical simulation calculations, and essential E2E API flows. NEVER write superficial tests for generic UI components, static dictionaries, trivial utilities, or pass-through controller mocks. Eliminate redundant test bloat to keep CI fast and maintainable.
