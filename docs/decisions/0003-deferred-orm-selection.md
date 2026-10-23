# 3. Deferral of ORM and Database Schema Selection

Date: 2026-10-23
Status: Accepted

## Context

In the foundation phase, Wonderlab requires local PostgreSQL 16 provisioned via Docker Compose. However, backend business requirements (such as authentication models, simulation telemetry, puzzle state persistence, or leaderboard schemes) are not yet specified.

## Decision

We decided to **defer the selection of an ORM** (Prisma, Drizzle, TypeORM, or Kysely) until business schema requirements are formally defined:

- Avoids locking the project into an ORM paradigm before knowing whether schema access is read-heavy, analytical, or transactional.
- Keeps backend foundation minimal, fast-compiling, and strictly focused on system health (`GET /api/v1/health`).
- PostgreSQL container is running, healthy, and tested on loopback port `5434`.

## Consequences

- The database is provisioned and verified locally, but no migrations or database drivers are added to `server/package.json`.
- When the first persistent feature is designed, an ADR will document the selection between Prisma, Drizzle, or TypeORM based on that feature's data access patterns.
