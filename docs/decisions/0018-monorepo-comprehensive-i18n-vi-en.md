# 0018. Monorepo Comprehensive Internationalization (i18n vi & en)

- **Status**: Accepted
- **Date**: 2026-10-26
- **Author**: Wonderlab Engineering Team

---

## Context & Problem Statement

Wonderlab is dedicated to making counter-intuitive science, probability, paradoxes, and logic puzzles accessible to a wide audience. As the platform matures, providing complete, seamless bilingual support (`vi` Vietnamese and `en` English) across both the Next.js 15 client and the NestJS server is essential for global accessibility and academic collaboration.

### Key Requirements & Constraints:

1. **Zero-`any` TypeScript Policy**: Strict type safety must be preserved across dictionaries, translation hooks, and API handshakes.
2. **React 19 & Next.js 15 Compatibility**: Avoid bloated third-party i18n libraries that generate peer dependency warnings or SSR hydration conflicts with React 19 App Router.
3. **End-to-End Handshake**: Seamless negotiation between client and server via `Accept-Language` headers, ensuring backend responses (e.g. auth errors, validation messages, email templates) match the user's active UI locale.
4. **Clean Editorial Lab Aesthetics**: Preserve "Clean Paper & Lab Editorial" standards with tactile switchers, no layout shifts, and minimum font size $\ge 12\text{px}$.

---

## Architectural Decision

### 1. Server Architecture (`server/src/i18n/`)

- **Typed Dictionary Schema (`server/src/i18n/i18n.types.ts`)**:
  - `SupportedLocale = 'vi' | 'en'` with `DEFAULT_LOCALE = 'vi'`.
  - Type `ServerDictionary` covering authentication, comments, simulation requests, users, and email templates.
- **Service & Locale Resolution (`server/src/i18n/i18n.service.ts`)**:
  - Global NestJS module (`I18nModule`) providing `I18nService`.
  - Resolves locale by parsing standard `Accept-Language` quality values (e.g., `en-US,en;q=0.9,vi;q=0.8`).
  - Implements dynamic parameterized translation `t(key, params, locale)`.
- **Localized Mailers & Auth Handlers**:
  - Localized OTP emails (registration and password recovery) generated dynamically based on active locale.
  - Auth controller consumes `@Headers('accept-language')` and propagates locale through `AuthService` and `OtpService`.

### 2. Client Architecture (`client/src/i18n/`)

- **Typed UI Dictionaries (`client/src/i18n/types.ts`)**:
  - Fully typed `TranslationDictionary` covering Navigation, Header, Footer, Authentication, Simulations Catalog, Requests, Essays, and Common Actions.
  - Complete Vietnamese (`locales/vi.ts`) and English (`locales/en.ts`) dictionaries.
- **Reactive Context & Persistence (`client/src/i18n/context.tsx`)**:
  - `I18nProvider` wraps the root layout.
  - Manages active locale with immediate synchronization to `localStorage`, `NEXT_LOCALE` cookie, and `document.documentElement.lang`.
  - Exposes `useTranslation()` and `useLocale()` hooks.
  - Provides `getActiveLocale()` helper for non-React contexts (e.g., fetch API interceptors).
- **Client-to-Server Locale Propagation**:
  - `auth-context.tsx`, `comments-api.ts`, `simulation-requests-api.ts`, and `admin-api.ts` automatically append `'Accept-Language': getActiveLocale()` to all outgoing requests.
- **Editorial UI Components**:
  - `LanguageSwitcher`: Minimalist, tactile editorial language toggle and dropdown (`[VI]` / `[EN]`).
  - Integrated into Header navigation (desktop and mobile drawer).
  - Responsive bilingual support across Homepage, Lab Catalog, Curated Experiences, Simulation Requests, Essays, User Account Console, and Admin Navigation.

---

## Verification & Results

- **Server Unit Tests**: 10 suites passed (65 tests), including `I18nService` resolution and translation tests.
- **Server E2E Tests**: 4 suites passed (28 tests).
- **Client Unit & Component Tests**: 17 suites passed (109 tests).
- **TypeScript**: `pnpm typecheck` passed with 0 errors across monorepo.
- **Linting & Code Style**: `pnpm lint` and `pnpm format:check` passed with 0 warnings.
- **Production Builds**: Next.js (40 SSG/static pages) and NestJS build successfully.
