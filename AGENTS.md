# AGENTS.md — Wonderlab AI Coding Guidelines

Welcome to **Wonderlab**. This document is the primary source of truth and authoritative set of rules for AI coding assistants working in this repository.

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

---

## 8. Git & Workflow Conventions

- Commit format: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`).
- Always verify working tree and secrets with `git status` before committing.
- Never force push (`--force`) to `main`.

---

## 9. Non-Negotiable Agent Rules

1. **Read Before Writing**: Inspect existing files and documentation before editing.
2. **No Unrequested Scope Creep**: Do not add user management, authentication, payment, or complex databases until explicitly requested.
3. **No Fake Completions**: Never declare tests or builds have succeeded without actually executing them and inspecting the output.
4. **Preserve Documentation Integrity**: Update docs in `docs/` whenever architectural decisions or workflows change.
