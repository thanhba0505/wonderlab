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

## 4. Development Server Lifecycle & Asset Safety

- **Development Server Command**: Always use `pnpm dev` or `pnpm dev:client` (`next dev -p ${PORT:-4100}`).
- **Strictly Prohibited**: NEVER run `pnpm start`, `pnpm --filter wonderlab-client start`, or `next start` during local development or background tasks.
- **Root Cause & Asset Lockout**: `next start` serves immutable production bundles tied to an in-memory `BUILD_ID`. Whenever background checks (`pnpm check` / `next build`) rewrite `.next/` on disk, `next start` encounters build ID mismatch and responds with `400 Bad Request` on all CSS and JS chunks, causing stylesheet drops and infinite reload failures in the browser.
- **Hot Reloading**: `next dev` recompiles routes on demand with Hot Module Replacement (HMR) and is immune to build-ID desynchronization.
