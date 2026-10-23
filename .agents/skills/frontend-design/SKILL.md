---
name: frontend-design
description: Design principles and UI implementation patterns for Wonderlab. Focuses on dark mode science lab aesthetics, editorial typography, responsive layouts, accessible colors, and interactive scientific simulations.
---

# Frontend Design & UI Playbook for Wonderlab

## 1. Visual & Aesthetic Identity

- **Theme**: Premium Dark Interface ("Science Lab meets Editorial Journal").
- **Palette**: Deep charcoal/navy background (`#0b0f19`, `#030712`), crisp borders (`#1f2937`, `#374151`), high-contrast foreground (`#f9fafb`), and purposeful accents:
  - Cyan (`#06b6d4`, `#22d3ee`) for scientific discovery & physics.
  - Violet/Purple (`#8b5cf6`, `#a855f7`) for paradoxes & mathematical curiosity.
  - Amber (`#f59e0b`, `#fbbf24`) for probability, alerts, and interactive states.
  - Emerald (`#10b981`, `#34d399`) for verified logic, success, and truth tables.
- **Typography**: Clean geometric typography for headings, highly legible sans-serif for body text, tabular figures (`font-mono`) for numerical simulations and probabilities.

## 2. Interaction & UX Rules

- **Direct Manipulation**: Allow users to toggle doors (Monty Hall), adjust sliders (probability), and reset trials. Every click must produce visible, accurate feedback.
- **No Faux Metrics**: Never display fake user counts, fake ratings, or dummy statistical charts. Show real simulation counters computed in the browser.
- **Micro-Animations**: Use `motion` for subtle state transitions (door opening, probability bar filling, card reveal). Always respect `prefers-reduced-motion`.
- **Keyboard & Accessibility**: Ensure interactive elements have explicit focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400`), correct ARIA roles (`role="region"`, `role="status"`), and minimum 44px tap targets on mobile.

## 3. Component Architecture

- Use `shadcn/ui` atomic patterns with Tailwind CSS.
- Keep components small, modular, and single-purpose in `src/components/ui/`, `src/components/layout/`, and `src/features/`.
- Isolate client-side state (`'use client'`) to interactive leaves; keep pages and shell layouts as React Server Components where feasible.
