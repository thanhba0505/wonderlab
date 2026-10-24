# ADR 0006: Simulation Run Persistence, Global Telemetry & Scientific Export Suite

## Status

Accepted

## Date

2026-10-24

## Context

Wonderlab's initial interactive simulations operated purely in React client memory (`useState`). Once the browser tab was refreshed or closed, all Monte Carlo trials (e.g. 10,000 rooms) were completely lost. Additionally:

1. There was no connection between the client simulation components and the NestJS backend + PostgreSQL database for scientific telemetry data.
2. Users (students, researchers, educators) could not export empirical data for further statistical analysis in tools like Excel, Python (Pandas), or R.
3. Users could not share a direct link representing their exact laboratory configuration (`?n=23`).
4. The administrative dashboard displayed placeholder simulation statistics rather than real database metrics.

## Decision

1. **Database Schema & Prisma Model**:
   - Added `SimulationRun` table to PostgreSQL via Prisma:
     - `simulationSlug`: VarChar(64), indexed.
     - `parameters`: JSON, storing flexible input configurations for any simulation type.
     - `results`: JSON, storing output measurements and collision details.
     - `trialsCount`: Int, number of iterations.
     - `durationMs`: Int, execution duration in milliseconds.
     - `clientSession`: VarChar(64), anonymous client session UUID.
     - `userId`: Nullable foreign key to `User`.
     - `createdAt`: DateTime with descending index for fast chronological querying.
2. **NestJS 10 Simulations Module**:
   - Implemented `SimulationsModule`, `SimulationsController`, and `SimulationsService`.
   - Exposed 3 REST endpoints:
     - `POST /api/v1/simulations/runs`: Records runs with rate limiting.
     - `GET /api/v1/simulations/stats`: Returns aggregated totals and per-slug breakdowns.
     - `GET /api/v1/simulations/runs/history`: Retrieves recent session history.
3. **Frontend Telemetry Pipeline & Components**:
   - `useSimulationTelemetry`: React hook managing anonymous session IDs and non-blocking background telemetry dispatch.
   - `SimulationHistoryTable`: High-craft table displaying recent session trials, empirical vs. theoretical rates, and a 1-click reload button.
   - `ExportSuitePanel`: RFC 4180 CSV export, JSON export, Markdown report clipboard copy, and URL state deep link sharing.
   - `GlobalTelemetryWidget`: Live platform trial counter displaying real community data without faux vanity stats.
4. **Deterministic SSR PRNG**:
   - Seeded deterministic PRNG on initial render of `BirthdaySimulation` to eliminate React hydration mismatch (#418) during Next.js SSG.

## Consequences

- **Positive**:
  - Full end-to-end integration between Next.js frontend and NestJS backend database.
  - Scientific reproducibility: students and researchers can download CSV files of Monte Carlo runs.
  - Seamless sharing: URL parameters automatically synchronize.
  - Zero schema churn: JSON columns allow adding future simulations without DB migrations.
  - 100% test coverage with 39 unit tests and 12 E2E tests passing.
- **Negative / Trade-offs**:
  - Network requests are made in the background after batch runs; mitigated by non-blocking error handling so offline users experience no degradation.
