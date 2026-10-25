# Testing Strategy & Playbook — Wonderlab

## 1. Overview & Lean Testing Philosophy

Wonderlab adopts a **pragmatic, lean testing strategy** focused strictly on **core, mission-critical functionality**. To keep CI workflows and local verification fast (< 5s for unit tests), trivial UI rendering tests, static data verification, and boilerplate pass-through mocks are strictly avoided.

```text
┌──────────────────────────────────────────────┐
│           Smoke Tests (HTTP / Live)          │ -> scripts/smoke-test.sh
├──────────────────────────────────────────────┤
│       Backend E2E Tests (Supertest)          │ -> server/test/*.e2e-spec.ts
├──────────────────────────────────────────────┤
│ Core Mathematical Engines (Vitest)           │ -> client/src/features/**/math.test.ts
├──────────────────────────────────────────────┤
│ Backend Service Business Logic (Jest)        │ -> server/src/**/*.service.spec.ts
├──────────────────────────────────────────────┤
│ Static Typecheck & Linting (tsc, ESLint)     │ -> pnpm typecheck && pnpm lint
└──────────────────────────────────────────────┘
```

### Core vs. Prohibited Test Scope:

- **Must Test (Core Functionality)**:
  - **Simulation Mathematics**: Mathematical correctness, probabilistic convergence, quantum interference equations, and game-theory payoff matrices (e.g. Monty Hall, Birthday Paradox, Zeno's Paradox, Double-Slit).
  - **Security & Business Logic**: Password hashing with Argon2id, JWT token issuance and validation, authorization policies, soft-deletion semantics, and database transactions in NestJS services.
  - **High-Value E2E Flows**: Complete HTTP lifecycle tests in `server/test/*.e2e-spec.ts`.
- **Must NOT Test (Superficial Bloat)**:
  - Presentational UI components (buttons, inputs, dropdowns, modals, layouts).
  - Static dictionaries or hardcoded lists (essays, curated lists).
  - Trivial utility wrappers (e.g. `cn()`).
  - Pass-through controller unit tests that merely delegate to services.

---

## 2. Testing Commands

All test tasks can be invoked from the monorepo root:

| Command                   | Target          | Description                                                                                   |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `pnpm test`               | Client & Server | Executes Vitest (client) and Jest (server) unit test suites.                                  |
| `pnpm test:e2e`           | Server          | Executes Jest E2E tests validating the complete NestJS HTTP stack and `/api/v1/health`.       |
| `pnpm typecheck`          | Client & Server | Runs `tsc --noEmit` on both workspaces in strict mode.                                        |
| `pnpm lint`               | Client & Server | Runs Next.js ESLint and TypeScript ESLint with zero allowed warnings.                         |
| `pnpm check`              | Full Workspace  | Runs format check, lint, typecheck, unit tests, E2E tests, and production builds in sequence. |
| `./scripts/smoke-test.sh` | Local Endpoints | Smoke tests live HTTP 200 responses on client, admin, health, and Swagger.                    |

---

## 3. Specific Test Suites

### Client: Monty Hall Mathematical Simulation (`client/src/features/monty-hall/monty-hall.test.ts`)

- Verifies that staying wins only when the initial pick was correct (1/3 of trials).
- Verifies that switching wins whenever the initial pick was a goat (2/3 of trials).
- Executes 3,000 automated iterations to verify convergence to the theoretical win rate of ~66.7% within a statistical confidence interval.

### Server: Health Endpoint E2E (`server/test/app.e2e-spec.ts`)

- Spawns the real NestJS application with validation pipes and routing prefix.
- Dispatches `GET /api/v1/health` via Supertest.
- Confirms HTTP 200 status, payload structure (`status: "ok"`, `service: "wonderlab-server"`), and ISO timestamp validity.
