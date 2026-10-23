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
│   │   ├── admin/          # Admin area (placeholder in foundation)
│   │   │   └── page.tsx
│   │   ├── error.tsx       # Route error boundary
│   │   ├── global-error.tsx # Root HTML error boundary
│   │   ├── not-found.tsx   # Custom 404 page
│   │   ├── layout.tsx      # Root HTML shell, fonts, header/footer
│   │   └── globals.css     # Dark theme tokens, grid patterns
│   ├── components/
│   │   ├── ui/             # shadcn atomic components (button, card, badge)
│   │   └── layout/         # Shell components (header, footer)
│   ├── features/           # Domain feature components
│   │   ├── hero/           # Interactive constellation visual
│   │   ├── monty-hall/     # Interactive Monty Hall simulation & test
│   │   ├── explore/        # Category cards
│   │   ├── curated/        # Curated science experiences
│   │   └── editorial/      # Thought-provoking essays & quotes
│   ├── lib/
│   │   ├── utils.ts        # cn() helper and API base URL resolver
│   │   └── utils.test.ts
│   └── types/              # Domain TypeScript interfaces
├── components.json         # shadcn/ui configuration
├── next.config.ts          # Next.js compiler settings
└── tailwind.config.ts      # Design tokens, color system, animations
```

---

## 3. Design System & Accessibility Baseline

- **Dark Mode First**: Charcoal/navy background (`#080c14`) with glowing cyan (`#06b6d4`), violet (`#8b5cf6`), amber (`#f59e0b`), and emerald (`#10b981`) accents.
- **Focus Rings**: Prominent focus outlines (`focus-visible:ring-2 focus-visible:ring-cyan-400`) on all interactive buttons and cards.
- **No Faux Statistics**: All probability counters are calculated directly in the browser via pure math or client-side Monte Carlo simulations.
- **Zero Broken Links**: Unreleased modules route explicitly to `/admin` (marked with an in-development warning) or smoothly jump to anchor sections.
