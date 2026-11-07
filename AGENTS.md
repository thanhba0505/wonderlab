# AGENTS.md — Wonderlab AI Coding Guidelines

Primary rules and standards for AI coding assistants working in Wonderlab.

> [!CRITICAL]
>
> ### 🚨 Mandatory Worktree-Exclusive Protocol
>
> 1. **Check allocations first**: Always run `git worktree list` on the very first turn.
> 2. **Never code in main workspace**: `/Users/lethanhba/workspace/app/Wonderlab` is strictly an idle root anchor on `develop`. Never edit files, checkout branches, or run dev servers here.
> 3. **Persistent Worktrees & Ports**:
>    - `Wonderlab-worktree-1`: Client `4200`, Server `4201`, branch `worktree-1`
>    - `Wonderlab-worktree-2`: Client `4300`, Server `4301`, branch `worktree-2`
>    - `Wonderlab-worktree-3`: Client `4400`, Server `4401`, branch `worktree-3`
>    - `Wonderlab-worktree-4`: Client `4500`, Server `4501`, branch `worktree-4`
>    - `Wonderlab-worktree-5`: Client `4600`, Server `4601`, branch `worktree-5`
>    - Database: Shared PostgreSQL container on `127.0.0.1:5434`
> 4. **Execution Workflow**:
>    ```bash
>    cd /Users/lethanhba/workspace/app/Wonderlab-worktree-N
>    git fetch origin && git checkout -B <type>/<task-name> origin/develop
>    # Edits & verification:
>    pnpm check
>    # Direct push to develop & cleanup:
>    git fetch origin && git rebase origin/develop && git push origin HEAD:develop
>    git checkout -B worktree-N origin/develop && git branch -d <type>/<task-name>
>    git -C /Users/lethanhba/workspace/app/Wonderlab pull origin develop
>    ```
> 5. **Tool Calls**: All `edit_file`, `write_file`, and `run_command` calls MUST use absolute paths or `cd` targeting the chosen worktree directory. Never delete worktrees (preserves caches).

---

## 1. Project Overview & Architecture

- **Mission**: Interactive science, probability, paradoxes, and logic simulation platform for the general public.
- **Monorepo**: Unified `pnpm` monorepo (`client/`, `server/`, `docs/`, `.agents/skills/`).
- **Client (`client/`)**: Next.js 15 App Router, React 19, Tailwind CSS, Lucide React, Motion. Public routes in `(public)/`, admin in `/admin/` (protected by HttpOnly session cookie). Communicates via `NEXT_PUBLIC_API_BASE_URL`.
- **Server (`server/`)**: NestJS 10 REST API. Global prefix `/api/v1`, Swagger `/api/docs`, health check `/api/v1/health`.
- **Database**: Local PostgreSQL 16 on `127.0.0.1:5434` (Docker Compose). ORM deferred.
- **Runtime & Tools**: Node `v24.x` (`.nvmrc`), `pnpm@12.11.2`. Never use `npm` or `yarn`.

---

## 2. Security & Environment

- **Zero Secret Leaks**: Never commit `.env*` or tokens (must be `.gitignore`d).
- **Client Boundaries**: Only `NEXT_PUBLIC_*` variables allowed in client code; never expose secrets or DB credentials.
- **Database**: Bind strictly to `127.0.0.1` (loopback).
- **Admin Security**: `/admin` requires active `Role.ADMIN` session via HttpOnly cookies.
- **CORS**: Explicit whitelist via `CORS_ORIGINS`.

---

## 3. UI/UX & Anti-AI Standards ("Clean Paper & Lab Editorial")

- **Aesthetic**: Slate-100 canvas (`#f1f5f9`), crisp white surfaces (`#ffffff`), hairline technical borders (`border-slate-300/85`), soft layered shadows (`shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]`), semantic accents (Cobalt: physics, Amber: probability, Violet: paradox, Emerald: logic).
- **Typography Architecture**:
  - `Be Vietnam Pro` (Sans) for body text and Vietnamese diacritics.
  - `Space Grotesk` (Heading) for geometric scientific titles (`text-slate-900`).
  - `JetBrains Mono` (Mono) with `tabular-nums` for simulation counters, probabilities, and formulas.
  - **Min Font Size ($\ge 12\text{px}$)**: Strictly forbid text below `12px` (`text-xs`). Never use `text-[11px]`, `text-[10px]`, etc.
  - **Section Headings**: Standardize `h2` headings to `18px` (`text-lg` or `text-[18px]`).
  - **Mathematical Typography**: Forbid raw ASCII math (`n/3`, `x^2`, `sqrt`, `sum` with variables). Mandatory `<MathFraction>`, `<sup>`, `<sub>`, `&radic;`, LaTeX `\frac{}{}`. Single allowed exception: constant numerical ratios without variables (e.g. `2/3`, `1/3`, `50/50`).
- **Strict Anti-AI Slop Guardrails**:
  1. _No purple/pink linear gradients_ on buttons or text.
  2. _No muddy glassmorphism_ (`backdrop-blur` stacked blindly); use crisp opaque surfaces.
  3. _No cookie-cutter 3-column identical card grids_; use asymmetric Bento Grids.
  4. _No SaaS buzzwords_ ("supercharge", "revolutionary"); keep copy authentic, intellectual, and scientific.
  5. _Calibrated radiuses_: `rounded-md` (badges/inputs), `rounded-lg` (buttons), `rounded-xl` (cards).
  6. _Max 2 nested border boxes_; use borderless tints (`bg-slate-100/70`) or dividers instead of borders inside borders.
  7. _No internal tech boasting or dev leaks_: Never display library/algorithm names (`Argon2id`, `HttpOnly`, `Prisma`, `JWT`, `OWASP`), localhost ports, or `/health` endpoints on public UI.
  8. _No developer self-narration or code concepts on UI_: Never expose architecture patterns ("Mô hình phản biện 2 cấp"), formatting narration ("Biểu diễn phân số & số mũ"), or code jargon in UI copy.
  9. _No faux data or vanity counters_: Display real live browser simulation counters only. No lorem ipsum.
  10. _Tactile & Accessible_: Tactile feedback (`active:scale-[0.98]`), `prefers-reduced-motion`, `focus-visible:ring-2`.

---

## 4. Coding & TypeScript Conventions

- **Strict Zero-`any` Policy**:
  - Forbidden: `any`, `Record<string, any>`, `Array<any>`, `@ts-ignore`, `@ts-nocheck`.
  - Use `unknown` + runtime narrowing / type guards, or generic constraints `<T extends Record<string, unknown>>`.
- **Explicit Contracts**: Mandatory explicit types/interfaces for all domain entities, DTOs, function signatures, React component props, and state.
- **Strict Null Safety**: Handle optionality via `?.`, `??`, or guard clauses (`strictNullChecks` & `noUncheckedIndexedAccess`). Avoid `!`.
- **Clean Code**: Guard clauses, early returns (max 2 levels nesting), intent-revealing names, grouped imports.
- **React Anti-Re-render Standard**:
  - _Zero derived state in `useEffect`_: Compute inline during render or with `useMemo`. Never duplicate props to state in effects.
  - _Event-driven actions_: Mutate state or trigger dispatches inside event handlers (`onClick`, `onSubmit`), not via effect trigger flags. Reserve `useEffect` strictly for external systems (DOM listeners, Canvas, Workers, WebSockets).
  - _Form watcher isolation_: Isolate `useWatch` / `watch()` to leaf components or read on demand via `getValues()` to avoid whole-tree re-renders.
  - _`useRef` for high-frequency state_: Store animation frames, canvas contexts, worker handles, and iteration indices in `useRef`, not `useState`. Throttle telemetry updates.
  - _Component granularity_: Decompose heavy simulation views so control changes (sliders, toggles) do not re-render heavy canvas or chart siblings. Memoize callbacks (`useCallback`) passed to `React.memo` children.

---

## 5. Testing & Dev Server Policy

- **Unified Verification**: Run `pnpm check` before claiming completion (`format:check`, `lint`, `typecheck`, `test`, `test:e2e`, `build`).
- **Lean & Core-Only Testing**:
  - _What to test_: Simulation math engines (paradox calculations, probability convergence), backend services (auth, hashing, permissions), and high-value HTTP E2E (`/health`, `/auth`). Target CI execution < 5s.
  - _Strictly forbid test bloat_: Never write unit tests for generic UI components, static dictionaries, controller pass-through mocks, or trivial utility wrappers (`cn()`).
- **Dev Server Standard (`pnpm dev` only)**:
  - STRICTLY run `pnpm dev` or `pnpm dev:client` (port 4100 or assigned worktree port) and `pnpm dev:server`.
  - NEVER execute `pnpm start` or `next start`. `next start` binds to an immutable `BUILD_ID`; any build or `pnpm check` causes a mismatch resulting in `400 Bad Request` asset lockouts and broken CSS.

---

## 6. Git Workflow, Versioning & Releases

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`. Strict English for all commits and repo docs.
- **Direct Merge to `develop`**: No PRs for agents. Always branch off `origin/develop`, verify with `pnpm check`, rebase and push `HEAD:develop`, then delete the local task branch.
- **Single Source of Truth for Versioning**:
  - Root `package.json` (`version`) is authoritative. Dynamically consumed by `client` (`next.config.ts`) and `server` (`version.ts`).
  - Only bump versions on official release events (`release: [published]` or tag `push: tags: ['v*']`). Never bump on draft releases or regular commits to `develop`.
- **Automated Production Releases**: Official GitHub Release or tag `v*` triggers CI/CD to merge `origin/develop` into `main`, bump version, tag, sync back to `develop`, and deploy to Production (Render Client & Server via Deploy Hooks, and alerts routed through Central Gateway). Never deploy manually.

---

## 7. SEO, Schema.org Structured Data & Dynamic Open Graph

- **Dynamic Sitemap & Robots**: Export typed `sitemap.ts` and `robots.ts` reading from registries (`SIMULATIONS_REGISTRY`, `ESSAYS`). Disallow `/admin`, `/my-account`, `/api/`.
- **Metadata**: Root `layout.tsx` title template (`%s | Wonderlab`). Subpages export `generateMetadata` without appending `| Wonderlab`.
- **Schema.org (JSON-LD)**: Strongly typed via `schema-dts`. Simulations use `["LearningResource", "WebApplication"]`; essays use `TechArticle`. Always sanitize JSON scripts (`.replace(/</g, '\\u003c')`) against XSS.
- **Dynamic OG Images (`opengraph-image.tsx`)**: 1200x630 via `next/og`. Clean Paper & Lab Editorial styling with local `Be Vietnam Pro` TTF fonts loaded via `fs.readFile` from `client/src/assets/fonts/` for complete Vietnamese diacritics.

---

## 8. Non-Negotiable Agent Rules

1. **Worktree First**: Always inspect `git worktree list` and code exclusively in an idle worktree. Never edit in the main workspace.
2. **Read Before Writing**: Inspect existing files and documentation before editing.
3. **No Fake Completions**: Execute tests/builds and inspect outputs; never claim success without verification.
4. **No Scope Creep**: Implement only what was requested. Avoid speculative features or complex dependencies.
5. **Continuous Knowledge Persistence**: Whenever the user establishes a rule or long-term requirement, or when an ongoing technical standard is introduced, autonomously codify it in `AGENTS.md` and `docs/` within the same turn.
