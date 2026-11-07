# Frontend Architecture & Guidelines — Wonderlab

## 1. Stack & Rationale

- **Framework**: Next.js 15 (App Router).
- **Runtime / Library**: React 19.
- **Styling**: Tailwind CSS 3.4 with custom design tokens.
- **Component Primitives**: shadcn/ui pattern with `class-variance-authority` (CVA).
- **Icons**: Lucide React.
- **Testing**: Vitest + jsdom for simulation state and utility verification.

---

## 2. Directory Structure

```text
client/
├── public/                 # Static assets, icons, manifest
├── src/
│   ├── app/
│   │   ├── (public)/       # Public route group (clean URLs)
│   │   │   └── page.tsx    # Homepage
│   │   ├── admin/          # Authenticated Admin Telemetry & Control Console (In-body page form)
│   │   │   └── page.tsx
│   │   ├── error.tsx       # Route error boundary
│   │   ├── global-error.tsx # Root HTML error boundary
│   │   ├── not-found.tsx   # Custom 404 page
│   │   ├── layout.tsx      # Root HTML shell, fonts, AuthProvider, header/footer
│   │   └── globals.css     # Clean Paper design tokens, lab grid pattern, custom scrollbars
│   ├── components/
│   │   ├── ui/             # shadcn atomic components (button, card, badge)
│   │   └── layout/         # Shell components (header with session state, footer)
│   ├── features/           # Domain feature components
│   │   ├── hero/           # Interactive telemetry chamber visual
│   │   ├── monty-hall/     # Interactive Monty Hall simulation & test
│   │   ├── explore/        # Asymmetric Bento grid with micro-simulations
│   │   ├── curated/        # Curated science experiences
│   │   └── editorial/      # Thought-provoking essays & quotes
│   ├── lib/
│   │   ├── auth-context.tsx # React Context for HttpOnly cookie authentication
│   │   └── utils.ts        # cn() helper and API base URL resolver
│   └── types/              # Domain TypeScript interfaces (Category, Article, AuthUser)
├── components.json         # shadcn/ui configuration
├── next.config.ts          # Next.js compiler settings
└── tailwind.config.ts      # Design tokens, color system, animations
```

---

## 3. Design System, Human Craft & Anti-AI Guidelines

- **Visual Aesthetic: Clean Paper & Lab Editorial**: High-craft editorial science design with a Slate-100 canvas (`#f1f5f9`), crisp white cards (`#ffffff`), hairline technical borders (`border-slate-300/85`), and soft layered shadows (`shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]`).
- **Typography Architecture**:
  - **Body Text**: `Be Vietnam Pro` — optimized for Vietnamese diacritics and relaxed, high-legibility reading.
  - **Headings & Display**: `Space Grotesk` — precision geometric sans with tight tracking (`tracking-tight text-slate-900`) evoking editorial scientific publications.
  - **Data & Mathematics**: `JetBrains Mono` with `tabular-nums` for counters, probability ratios, and physical constants ($P(A)$, $\lambda = 532\text{nm}$).
  - **Mathematical Expressions Standard**:
    - Strictly forbid raw ASCII math notation (`/`, `^`, `sqrt`, `sum`) for variable expressions (e.g., forbid `n/3`, `(n-1)/n`, `(x_A ± x_B)/2`, `x^2`, `2^4`, `O(n^2)`, `⌊n/4⌋`).
    - Mandatory visual formatting: use `<MathFraction>` for fractions, `<sup>` or `MathPower` for exponents, `&radic;` or `MathSqrt` for roots, `<sub>` or `MathSub` for indices, and LaTeX strings (`\frac{...}{...}`) for metadata.
    - **Single Allowed Exception**: Simple constant arithmetic ratios without variables in running prose (e.g., `2/3`, `1/3`, `50/50`).
  - **Minimum Font Size Standard ($\ge 12\text{px}$)**: Strictly forbid font sizes below 12px (`text-xs`). All annotations, exponents, indices, and badges must be $\ge 12\text{px}$.
  - **Section Heading Standard (18px)**: Standardize all primary section headings (`h2`) in workbench chambers to 18px (`text-[18px]` or `text-lg`).
- **Anti-AI Slop Guardrails**:
  - _No arbitrary purple/pink gradients_ on buttons or text. Color palettes map strictly to semantic domains:
    - 🔵 **Cobalt Blue (`#2563eb`)**: Physics, optics, wave mechanics.
    - 🟡 **Amber / Orange (`#d97706`)**: Probability, randomness, Monte Carlo.
    - 🟣 **Violet (`#7c3aed`)**: Paradoxes, quantum mechanics, cognitive dilemmas.
    - 🟢 **Emerald (`#059669`)**: Logic, game theory, algorithms.
  - _No blurry glassmorphism_: avoid blindly stacking `backdrop-blur` layers. Use crisp, opaque white backgrounds with hairline technical borders.
  - _No generic 3-column card grids_: layout features via asymmetric Bento Grids reflecting differing cognitive weights.
  - _No artificial marketing buzzwords_: use intellectual, precise, and scientifically authentic copy.
  - _Max 2 nested border boxes_: prevent nested box clutter; use borderless soft tints (`bg-slate-100/70`) or divider lines.
  - _No internal dev leaks in public UI_: never display backend framework names, localhost URLs, or raw library names on public screens.

---

## 4. State Management & Anti-Re-render Standard

To ensure fluid 60 FPS performance during high-throughput Monte Carlo simulations and complex interactive visualizations, React components adhere strictly to these optimization rules:

- **Zero Derived State in `useEffect`**:
  - Never mirror props or compute derived state inside a `useEffect`.
  - Calculate derived values inline during rendering or wrap with `useMemo` for heavy algorithmic operations.
  - Eliminates wasteful two-phase renders (phase 1 with stale state $\to$ effect triggers $\to$ phase 2 with new state).
- **Event-Driven Side Effects**:
  - API calls, data mutations, telemetry dispatches, and notifications must trigger directly inside event handlers (`onClick`, `onChange`, `onSubmit`).
  - Do not use flag states solely to trigger downstream effects.
  - Reserve `useEffect` strictly for external system synchronization (global DOM listeners, Web Workers, Canvas contexts, WebSockets, or AudioContext).
- **Form Watcher Isolation (`useWatch` / `watch`)**:
  - Calling `useWatch` or `watch()` at a parent form level causes the entire component tree to re-render on every keystroke.
  - Isolate field watchers into dedicated leaf components (e.g., `<SubmitButtonWithWatch control={control} />`).
  - Favor `getValues()` inside submission handlers when real-time form re-renders are unnecessary.
- **`useRef` for High-Frequency State & Non-Visual Handles**:
  - For Canvas animations, Monte Carlo loops, and high-frequency counters, store `requestAnimationFrame` IDs, Canvas 2D contexts, worker instances, and loop indices inside `useRef` rather than `useState`.
  - Batch or throttle UI state updates (e.g., update stats once every $N$ iterations or once per animation frame) instead of firing `setState` hundreds of times per second.
- **Granular Component Decomposition & Stable Callbacks**:
  - Decompose large simulation workbenches into fine-grained components so local parameter controls (sliders, toggles) do not force heavy canvas or data table siblings to re-render.
  - Stabilize callbacks passed to memoized children (`React.memo`) using `useCallback`.

---

## 5. SEO, Structured Data & Dynamic Open Graph

- **Dynamic Sitemap & Robots (`sitemap.ts`, `robots.ts`)**:
  - Dynamically generated from central registries (`SIMULATIONS_REGISTRY` and `ESSAYS`).
  - Disallows internal administrative routes (`/admin`, `/my-account`, `/api/`).
- **Comprehensive Metadata Hierarchy**:
  - Root `layout.tsx` defines the `%s | Wonderlab` title template.
  - Individual simulation and essay pages export `generateMetadata` with localized descriptions and Open Graph / Twitter Cards (`summary_large_image`).
- **Rich Snippets Schema.org JSON-LD**:
  - **Simulations (`SimulationJsonLd`)**: Structured with `@type: ["LearningResource", "WebApplication"]` and `BreadcrumbList`.
  - **Essays (`EssayJsonLd`)**: Structured with `@type: "TechArticle"` and `BreadcrumbList`.
  - **Security**: XSS sanitized via `JSON.stringify(...).replace(/</g, '\\u003c')` and typed with `schema-dts`.
- **Dynamic Open Graph Images (`opengraph-image.tsx`)**:
  - 1200x630 pixel cards rendered in real-time using Next.js `ImageResponse` from `next/og`.
  - Editorial design with technical coordinate grid, semantic badges, and bundled `Be Vietnam Pro` fonts for complete Vietnamese diacritics.
