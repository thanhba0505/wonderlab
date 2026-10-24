---
name: frontend-design
description: Design principles and UI implementation patterns for Wonderlab. Enforces high-craft 'Science Lab meets Editorial Journal' aesthetics, strict Anti-AI slop guardrails, tactile feedback, asymmetric layouts, and authentic interactive simulations.
---

# Human-Crafted Frontend Design & Anti-AI UI Playbook

This playbook establishes non-negotiable frontend design standards for Wonderlab. Its primary objective is to prevent **"AI-Generated Slop"** (generic SaaS templates, purple gradients, muddy glassmorphism, and fake buzzwords) and ensure every interface feels meticulously hand-crafted by senior human product designers.

---

## 1. The Anti-AI Tropes (Strict Negative Constraints)

AI coding agents instinctively converge on predictable, unoriginal UI tropes. **You must strictly avoid the following:**

| 🚫 AI Trope to BAN                    | Why It Looks Cheap / AI-Made                                                              | What to Do Instead (Human Craft)                                                                                                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unmotivated Purple/Pink Gradients** | Cheap hack to simulate "modern AI" on buttons, headers, and text.                         | Use purposeful solid accents or semantic colors: **Cyan** for physics, **Amber** for probability, **Violet** for paradoxes, **Emerald** for logic.                                                                    |
| **Muddy Glassmorphism Everywhere**    | `backdrop-blur-md bg-white/5` stacked over blurred layers kills contrast and readability. | Use solid or semi-opaque dark surfaces (`#090d16`, `#0f172a`) with crisp hairline borders (`border-slate-800` or `border-white/[0.08]`) and top inner highlights (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]`). |
| **Identical 3-Column Box Grids**      | 3 square boxes with centered icons in circles scream "cookie-cutter AI template".         | Use **Asymmetric Bento Grids** (e.g. 2-column with a 2-span interactive simulation card + 1-span live metrics card), or editorial split layouts.                                                                      |
| **SaaS Buzzword Copywriting**         | _"Supercharge your mind"_, _"Revolutionary platform"_, _"Unleash AI power"_.              | Use intellectually curious, precise, editorial science writing. Treat users like intelligent explorers.                                                                                                               |
| **Faux Statistics & Social Proof**    | _"4.9/5 stars"_, _"10,000+ active learners"_, fake vanity badges.                         | **Zero fake numbers**. Display real live browser simulation counters, exact equations, or empirical Monte Carlo results.                                                                                              |
| **Oversized Toy-Like Radiuses**       | Indiscriminately slapping `rounded-3xl` on every container makes UI look childish.        | Calibrate border radiuses: `rounded-md` (6px) for badges/inputs, `rounded-lg` (8px) for buttons, `rounded-xl` (12px) for cards, `rounded-2xl` (16px) only for major simulation stages.                                |

---

## 2. Visual Aesthetic: "Science Lab meets Editorial Journal"

- **Backgrounds**: Deep, grounded dark surfaces (`#080c14`, `#0b0f19`) with restrained radial lighting that stays anchored in the background, never muddying the text plane.
- **Hairline Precision**: 1px borders with controlled opacity (`border-slate-800/80` or `border-slate-800`), accented with delicate top highlights (`shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]`).
- **Tactile Laboratory Instrument Feel**:
  - Technical grid guides (`lab-grid` pattern).
  - Live state dots with subtle animated halos (`animate-ping`).
  - Monospace tags and coordinate markers (`font-mono text-xs uppercase tracking-widest`).

---

## 3. Typography Architecture & Rhythms

1. **Heading Hierarchy**:
   - Hero: High-contrast, sharp geometric sans with tight tracking (`tracking-tight text-white`).
   - Section Titles: Paired with small uppercase category markers (`font-mono text-xs uppercase tracking-widest text-cyan-400`).
2. **Body Text**:
   - Highly legible, relaxed line-height (`leading-relaxed text-slate-300`).
   - Maximum reading line width: `max-w-2xl` or `max-w-prose`.
3. **Data, Metrics & Mathematical Formulas**:
   - Always render simulation counters, percentages, and probabilities with `font-mono tabular-nums`.
   - Never let numbers cause layout shifts when updating dynamically.

---

## 4. Tactile Micro-Interactions

Every interactive element must provide genuine physical affordance:

- **Buttons**:
  - Subtle spring feel on click: `active:scale-[0.98] transition-all duration-150`.
  - Accessible focus ring: `focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`.
- **Cards & Sliders**:
  - Hover states should elevate subtly without aggressive dropshadow explosions (`hover:border-slate-700 hover:bg-slate-900/80`).
  - State changes in simulations (e.g. Monty Hall door opened) must trigger localized, purposeful visual reactions, not full-page jarring transitions.

---

## 5. Authentic Content & Mathematical Integrity

- Every interactive component (e.g., Monty Hall, Double Slit, Birthday Paradox) must run genuine mathematical simulations in code.
- If a simulation allows 100 trials, execute 100 actual random trials and graph the real empirical convergence.
- Accompany simulations with clear, elegant mathematical explanations ($P(A)$, Bayes theorem, wave equations) rather than dumbed-down superficial summaries.
