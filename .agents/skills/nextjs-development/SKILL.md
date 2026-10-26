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

## 3. Configuration, Typing & Imports

- Path aliases: `@/` resolves to `src/`.
- Strict typing (Zero-`any` standard):
  - Strictly no `any` (enforced by `@typescript-eslint/no-explicit-any: error`).
  - Explicit `interface` declarations for all component props, internal state, and API client responses.
  - Use `unknown` with runtime narrowing or generics `<T>` for dynamic data.
- Environment variables:
  - Client-accessible: `NEXT_PUBLIC_*` (validate before use; never expose private keys or DB credentials).
  - Server-only: regular environment variables.

## 4. Development Server Lifecycle & Asset Safety

- **Development Server Command**: Always use `pnpm dev` or `pnpm dev:client` (`next dev -p ${PORT:-4100}`).
- **Strictly Prohibited**: NEVER run `pnpm start`, `pnpm --filter wonderlab-client start`, or `next start` during local development or background tasks.
- **Root Cause & Asset Lockout**: `next start` serves immutable production bundles tied to an in-memory `BUILD_ID`. Whenever background checks (`pnpm check` / `next build`) rewrite `.next/` on disk, `next start` encounters build ID mismatch and responds with `400 Bad Request` on all CSS and JS chunks, causing stylesheet drops and infinite reload failures in the browser.
- **Hot Reloading**: `next dev` recompiles routes on demand with Hot Module Replacement (HMR) and is immune to build-ID desynchronization.

## 5. SEO, Schema.org Structured Data & Dynamic Open Graph Standards

- **Dynamic Sitemap & Robots (`src/app/sitemap.ts`, `src/app/robots.ts`)**:
  - Always export typed `MetadataRoute.Sitemap` and `MetadataRoute.Robots`.
  - Dynamically read entities from their source of truth (`SIMULATIONS_REGISTRY`, `ESSAYS`).
  - Read `process.env.NEXT_PUBLIC_APP_URL` with a secure fallback (`https://wonderlab.vn`) and strip trailing slashes.
  - Set meaningful `priority` (1.0 for home, 0.9 for simulations, 0.8 for essays/requests) and `changeFrequency`.
  - Disallow indexing on `/admin`, `/my-account`, and `/api/`.
- **Global & Route Metadata**:
  - Root `layout.tsx` must configure `metadataBase: new URL(...)` and `title: { default: '...', template: '%s | Wonderlab' }`.
  - Dynamic pages must export `generateMetadata` declaring `title`, `description`, `alternates: { canonical: '...' }`, `openGraph` (type `article` for simulations and essays), and `twitter: { card: 'summary_large_image' }`.
  - Subpages must set `title` without trailing ` | Wonderlab` suffix (e.g. `title: sim.title`), allowing the template to append the brand automatically.
- **Schema.org Structured Data (JSON-LD)**:
  - Render dedicated Server Components (e.g. `SimulationJsonLd`, `EssayJsonLd`) containing a `<script type="application/ld+json">`.
  - Prevent XSS injection by sanitizing JSON output: `JSON.stringify(...).replace(/</g, '\\u003c')`.
  - Use strongly typed contracts from `schema-dts` or explicit interfaces. Zero `any` policy applies strictly.
  - Group related entities using `@graph` (e.g. `LearningResource` / `WebApplication` + `BreadcrumbList` for simulations, `TechArticle` + `BreadcrumbList` for essays).
- **Dynamic Open Graph Images (`opengraph-image.tsx`)**:
  - Placed alongside dynamic routes (`src/app/simulations/[slug]/opengraph-image.tsx`) and exported with standard `size = { width: 1200, height: 630 }`.
  - Implement `generateStaticParams` so images are pre-rendered at build time.
  - Satori layout rules: Use flexbox only (`display: 'flex'` is standard; avoid CSS grid).
  - Font loading: Always load local TTF fonts (`BeVietnamPro-Bold.ttf`, `BeVietnamPro-Regular.ttf` in `src/assets/fonts/`) using `fs.readFile` to guarantee 100% complete Vietnamese diacritic rendering without network dependency during builds.
