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

- **Visual Aesthetic: Clean Paper & Lab Editorial**: High-craft scientific editorial design with a slate-100 canvas (`#f1f5f9`), solid white laboratory cards (`#ffffff`), hairline technical borders (`border-slate-300/85`), and subtle layered depth (`shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]`).
- **Typography Architecture**:
  - **Body Text**: `Be Vietnam Pro` — purpose-built for Vietnamese diacritics with balanced tone marks, clear x-height, and optimal readability.
  - **Headings & Display**: `Space Grotesk` — sharp geometric sans with tight tracking (`tracking-tight text-slate-900`) for an authoritative scientific character.
  - **Data & Mathematics**: `JetBrains Mono` with `tabular-nums` for simulation counters, probabilities, and formulas ($P(A)$, $\lambda = 532nm$).
- **Anti-AI Slop Guardrails**:
  - _No arbitrary purple/pink gradients_ on text or buttons; colors hold strict semantic meaning:
    - 🔵 **Cobalt Blue (`#2563eb`)**: Physics, optics, and primary action.
    - 🟠 **Warm Amber (`#d97706`)**: Probability, random processes, and alerts.
    - 🟢 **Emerald Green (`#059669`)**: Success, verified facts, and game theoretic optimal.
    - 🟣 **Deep Violet (`#7c3aed`)**: Paradoxes and thought experiments.
  - _No muddy glassmorphism_; crisp, well-defined opaque surfaces with clear contrast.
  - _No generic 3-box grids_; asymmetric Bento Grids with interactive micro-simulations (Double-slit wave toggle, live dice roller, Prisoner's Dilemma matrix).
  - _No AI fluff copy_; copy is intellectually rigorous, direct, and curiosity-driven.
- **Tactile Laboratory Feel**: Physical button click states (`active:scale-[0.98]`), calibrated border radii (6px badges, 8px buttons, 12px cards, 16px vaults), technical coordinate markers, and live status pulses.
- **Border Architecture & Max 2-Layer Depth (Chống Đóng Khung Lồng Hộp)**:
  - Tuyệt đối không đóng khung vượt quá 2 tầng viền (`Card` viền ngoài -> Phần tử tương tác/đo đạc viền trong).
  - Nghiêm cấm bọc container trung gian bằng viền 4 cạnh khi bên trong đã có phần tử viền. Thay vào đó, sử dụng nền phân vùng không viền (`bg-slate-100/70`), thanh chỉ thị cạnh trái (`border-l-4`), hoặc đường kẻ phân cách một chiều.
- **Focus Rings & Accessibility**: Prominent focus outlines (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none`) on all interactive buttons and cards.
- **No Faux Statistics**: All probability counters are calculated directly in the browser via pure math or client-side Monte Carlo simulations with `font-mono tabular-nums`.
- **Zero Broken Links**: Unreleased modules route explicitly to `/admin` (marked with an in-development warning) or smoothly jump to anchor sections.
