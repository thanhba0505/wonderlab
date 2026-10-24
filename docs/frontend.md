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

## 3. Design System, Human Craft & Anti-AI Guidelines

- **Dark Mode First**: Grounded charcoal/navy background (`#080c14`) with solid dark cards (`#0f172a`), hairline borders (`border-slate-800`), and subtle top bevel highlights (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]`).
- **Anti-AI Slop Guardrails**:
  - _No arbitrary purple/pink gradients_ on text or buttons; colors must hold semantic scientific meaning (cyan for physics, amber for probability, violet for paradoxes, emerald for logic).
  - _No muddy glassmorphism_; avoid blurred translucent overlays that impair legibility.
  - _No generic 3-box grids_; use asymmetric Bento Grids and dynamic proportions.
  - _No AI fluff copy_; copy is intellectually rigorous, direct, and curiosity-driven.
- **Tactile Laboratory Feel**: Physical button click states (`active:scale-[0.98]`), calibrated border radii (6px badges, 8px buttons, 12px cards), subtle grid guides, and live status pulses.
- **Focus Rings & Accessibility**: Prominent focus outlines (`focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`) on all interactive buttons and cards.
- **No Faux Statistics**: All probability counters are calculated directly in the browser via pure math or client-side Monte Carlo simulations with `font-mono tabular-nums`.
- **Zero Broken Links**: Unreleased modules route explicitly to `/admin` (marked with an in-development warning) or smoothly jump to anchor sections.
