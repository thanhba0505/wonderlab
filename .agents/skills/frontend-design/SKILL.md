---
name: frontend-design
description: Design principles and UI implementation patterns for Wonderlab. Enforces high-craft 'Science Lab meets Editorial Journal' aesthetics, strict Anti-AI slop guardrails, tactile feedback, asymmetric layouts, and authentic interactive simulations.
---

# Human-Crafted Frontend Design & Anti-AI UI Playbook

This playbook establishes non-negotiable frontend design standards for Wonderlab. Its primary objective is to prevent **"AI-Generated Slop"** (generic SaaS templates, purple gradients, muddy glassmorphism, and fake buzzwords) and ensure every interface feels meticulously hand-crafted by senior human product designers.

---

## 1. The Anti-AI Tropes (Strict Negative Constraints)

AI coding agents instinctively converge on predictable, unoriginal UI tropes. **You must strictly avoid the following:**

| 🚫 AI Trope to BAN                                 | Why It Looks Cheap / AI-Made                                                                                                                                                                                                                                                                                                      | What to Do Instead (Human Craft)                                                                                                                                                                                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unmotivated Purple/Pink Gradients**              | Cheap hack to simulate "modern AI" on buttons, headers, and text.                                                                                                                                                                                                                                                                 | Use purposeful solid accents or semantic colors: **Cobalt Blue** for physics & action, **Amber** for probability, **Violet** for paradoxes, **Emerald** for logic & optimal strategy.                                                                           |
| **Muddy Glassmorphism Everywhere**                 | `backdrop-blur-md bg-white/5` stacked over blurred layers kills contrast and readability.                                                                                                                                                                                                                                         | Use crisp, opaque surfaces (`#ffffff` cards on `#f1f5f9` canvas) with hairline technical borders (`border-slate-300/85`) and subtle depth (`shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]`).                                                                      |
| **Identical 3-Column Box Grids**                   | 3 square boxes with centered icons in circles scream "cookie-cutter AI template".                                                                                                                                                                                                                                                 | Use **Asymmetric Bento Grids** (e.g. 2-column with a 2-span interactive simulation card + 1-span live metrics card), or editorial split layouts.                                                                                                                |
| **SaaS Buzzword Copywriting**                      | _"Supercharge your mind"_, _"Revolutionary platform"_, _"Unleash AI power"_.                                                                                                                                                                                                                                                      | Use intellectually curious, precise, editorial science writing. Treat users like intelligent explorers.                                                                                                                                                         |
| **Faux Statistics & Social Proof**                 | _"4.9/5 stars"_, _"10,000+ active learners"_, fake vanity badges.                                                                                                                                                                                                                                                                 | **Zero fake numbers**. Display real live browser simulation counters, exact equations, or empirical Monte Carlo results.                                                                                                                                        |
| **Oversized Toy-Like Radiuses**                    | Indiscriminately slapping `rounded-3xl` on every container makes UI look childish.                                                                                                                                                                                                                                                | Calibrate border radiuses: `rounded-md` (6px) for badges/inputs, `rounded-lg` (8px) for buttons, `rounded-xl` (12px) for cards, `rounded-2xl` (16px) only for major simulation stages.                                                                          |
| **Multi-Nested Border Boxes (> 2)**                | Stacking boxes within boxes (Card -> Wrapper border -> Sub-item border) creates visual clutter.                                                                                                                                                                                                                                   | **Strict Max 2-Layer Rule**. Use borderless background tints (`bg-slate-100/70`), subtle dividers, or left accent bars (`border-l-4`) instead of 4-sided borders around everything.                                                                             |
| **Internal Tech Boasting & Leaking Dev Endpoints** | Exposing internal libraries, cryptographic algorithms (`Argon2id`, `HttpOnly Cookie`, `OWASP`), raw localhost endpoints (`http://localhost:4101/api/docs`), `/api/v1/health` status badges, or framework version strings (`Next.js 15 • React 19 • NestJS 10`) on public UI. Also modal popups for login that clutter the screen. | **Strictly forbidden**. Web platforms must feel like authentic, scholarly productions, not tech demo toys. Never leak backend plumbing, ports, or versions to end users. Embed login directly in dedicated page bodies (e.g. `/admin`), never in modal dialogs. |

---

## 2. Visual Aesthetic: "Clean Paper & Lab Editorial"

- **Backgrounds**: Slate-100 canvas (`#f1f5f9`) with subtle lab coordinate grid (`lab-grid` pattern) providing a scholarly, experimental research environment.
- **Hairline Precision & Layered Depth**: Crisp white surfaces (`#ffffff`) with 1px borders (`border-slate-300/85` or `border-slate-200`) and soft, high-fidelity ambient shadows (`shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]`).
- **Tactile Laboratory Instrument Feel**:
  - Technical grid guides (`lab-grid` pattern).
  - Live state indicators with subtle animated halos (`animate-ping`).
  - Monospace tags and coordinate markers (`font-mono text-xs uppercase tracking-widest text-slate-500`).

---

## 3. Typography Architecture & Rhythms

1. **Heading Hierarchy (`Space Grotesk`)**:
   - Hero: High-contrast, sharp geometric sans with tight tracking (`tracking-tight text-slate-900 font-heading`).
   - Section Titles: Paired with small uppercase category markers (`font-mono text-xs uppercase tracking-widest text-blue-600 font-semibold`).
2. **Body Text (`Be Vietnam Pro`)**:
   - Highly legible, relaxed line-height (`leading-relaxed text-slate-600 font-sans`).
   - Optimized for Vietnamese tone marks and diacritics.
   - Maximum reading line width: `max-w-2xl` or `max-w-prose`.
3. **Data, Metrics & Mathematical Formulas (`JetBrains Mono`)**:
   - Always render simulation counters, percentages, and probabilities with `font-mono tabular-nums`.
   - Never let numbers cause layout shifts when updating dynamically.

---

## 4. Tactile Micro-Interactions

Every interactive element must provide genuine physical affordance:

- **Buttons**:
  - Subtle spring feel on click: `active:scale-[0.98] transition-all duration-150`.
  - Accessible focus ring: `focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none`.
- **Cards & Sliders**:
  - Hover states should elevate subtly without aggressive dropshadow explosions (`hover:border-slate-400/80 hover:shadow-md`).
  - State changes in simulations (e.g. Monty Hall door opened) must trigger localized, purposeful visual reactions, not full-page jarring transitions.

---

## 5. Authentic Content & Mathematical Integrity

- Every interactive component (e.g., Monty Hall, Double Slit, Birthday Paradox) must run genuine mathematical simulations in code.
- If a simulation allows 100 trials, execute 100 actual random trials and graph the real empirical convergence.
- Accompany simulations with clear, elegant mathematical explanations ($P(A)$, Bayes theorem, wave equations) rather than dumbed-down superficial summaries.
