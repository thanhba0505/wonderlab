---
name: nextjs-development
description: Next.js App Router engineering standards for Wonderlab. Covers routing conventions, React 19 / Server Components, metadata, layout hierarchies, strict TypeScript, and client-server boundaries.
---

# Next.js Development Standards

## 1. App Router Structure

- **Public Routes**: Located in `src/app/(public)/`. The route group `(public)` groups user-facing pages without polluting the URL pathname.
- **Admin Section**: Located in `src/app/admin/`. Distinct layout with explicit badge indicating development status.
- **Root Layout & Error Boundaries**:
  - `src/app/layout.tsx`: Root HTML shell, global fonts, dark theme provider, navigation header, and footer.
  - `src/app/not-found.tsx`: 404 page with clear back navigation.
  - `src/app/error.tsx`: Client-side error boundary with reset trigger.
  - `src/app/global-error.tsx`: Root error boundary fallback.

## 2. Server vs Client Component Boundaries

- Default to React Server Components (RSC) for data fetching, static content, and page skeletons.
- Use `'use client'` only on files requiring:
  - React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
  - DOM event listeners (`onClick`, `onChange`, `onKeyDown`).
  - Browser-only APIs (`window`, `localStorage`, `canvas`).
  - Interactive simulations (e.g. `MontyHallSimulation`).

## 3. Configuration & Imports

- Path aliases: `@/` resolves to `src/`.
- Strict typing: No `any`. Explicit props interfaces.
- Environment variables:
  - Client-accessible: `NEXT_PUBLIC_*` (validate before use; never expose private keys or DB credentials).
  - Server-only: regular environment variables.
