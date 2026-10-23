# 1. Monorepo Package Management with pnpm Workspace

Date: 2026-10-23
Status: Accepted

## Context

Wonderlab requires a cohesive full-stack architecture comprising a Next.js frontend, a NestJS backend, shared documentation, and automated tooling. We evaluated multiple package management options (npm workspaces, yarn workspaces, Turborepo, pnpm workspaces).

## Decision

We chose **pnpm workspaces** as the sole package manager for Wonderlab:

- Content-addressable storage minimizes disk footprint and eliminates duplicate package downloads.
- Strict dependency resolution prevents phantom dependencies from leaking across packages.
- Root scripts (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm check`) allow unified coordination without introducing heavy monorepo runners (like Nx or Turborepo) prematurely.

## Consequences

- All developers and CI pipelines must use pnpm (pinned version `12.11.2`).
- Dependency build approvals must be managed via `pnpm-workspace.yaml` or `pnpm approve-builds`.
