# 0013. Calculus & Zeno's Paradox Interactive Simulation

- **Status**: Accepted
- **Date**: 2026-10-24
- **Author**: Wonderlab Engineering Team

---

## Context & Problem Statement

Following the completion of simulations in Probability (Birthday Paradox, Monty Hall), Quantum Mechanics (Double-Slit Experiment), and Game Theory (Prisoner's Dilemma), Wonderlab needed an authentic interactive simulation for **Calculus, Mathematical Paradoxes, and the Nature of Spacetime**.

The phenomenon selected is **Zeno's Paradox: Achilles and the Tortoise (Nghịch lý Zeno: Achilles và Rùa)**, formulated by Zeno of Elea (~450 BC).

The core educational dilemmas and cognitive paradoxes to address:

1. **The Infinite Sum Fallacy (Ảo tưởng Phân kỳ Vô hạn)**: Human common sense erroneously presumes that summing an infinite number of discrete intervals ($\sum_{n=0}^\infty$) must always yield an infinite result ($\infty$).
2. **Calculus Resolution**: In mathematical analysis, a geometric series of diminishing steps with common ratio $|r| < 1$ converges strictly to a finite limit:
   $$T^* = \frac{d_0}{v_A} \sum_{n=0}^{\infty} \left(\frac{v_T}{v_A}\right)^n = \frac{d_0}{v_A - v_T} < \infty$$
3. **Continuous vs Discrete Spacetime**: In Newtonian and relativistic physics, spacetime is a continuum ($\mathbb{R}$). However, in quantum gravity, the **Planck Length** ($\ell_P \approx 1.6 \times 10^{-35}\text{ m}$) defines the minimum meaningful physical scale, proving that physical space cannot be divided infinitely.

---

## Architectural Decision

### 1. Mathematical Analysis Core (`zeno-math.ts`)

- **Analytical Solution (`calculateOvertakePoint`)**:
  - $v_A$: Achilles speed ($10\text{ m/s}$), $v_T$: Tortoise speed ($1\text{ m/s}$), $d_0$: Head start ($100\text{ m}$).
  - $T^* = \frac{100}{10 - 1} = 11.111\dots\text{ s}$
  - $X^* = v_A \cdot T^* = 111.111\dots\text{ m}$
  - Common ratio $r = v_T / v_A = 0.1$
- **Zeno Subdivision Generator (`generateZenoSteps`)**:
  - Computes steps $n = 0, 1, 2, \dots, N$:
    - $\Delta d_n = d_0 \cdot r^n$
    - $\Delta t_n = \Delta d_n / v_A$
    - Cumulative time $S_n = \sum_{k=0}^n \Delta t_k \to T^*$
    - Flags Planck scale boundary when $\text{remainingGap} \le \ell_P$.
- **Continuous Kinematics (`calculateContinuousPosition`)**:
  - Continuous Newtonian physics positions at real time $t \ge 0$:
    - $x_A(t) = v_A \cdot t$
    - $x_T(t) = d_0 + v_T \cdot t$
    - Overtake condition $x_A(t) \ge x_T(t)$
- **Planck Step Boundary (`findPlanckStep`)**:
  - Solves for $n$ where $d_0 \cdot r^{n+1} \le \ell_P$, determining at which step theoretical mathematics breaks physical validity.

### 2. Dual-Perspective Visualizer & UI Architecture

- **Perspective A: Zeno Microscopic Frame (`RaceTrack` - Zeno Mode)**:
  - Step-by-step exponential camera zoom on the remaining gap.
  - Highlights Achilles reaching the tortoise's prior position while the tortoise advances by a smaller interval.
- **Perspective B: Real-Time Physics Frame (`RaceTrack` - Continuous Mode)**:
  - Linear track with smooth animation loop (`requestAnimationFrame`).
  - Speed multipliers ($0.5\times, 1\times, 2\times, 4\times$) and interactive time scrubber.
  - Demonstrates Achilles effortlessly passing the Tortoise at $t = 11.11\text{ s}$.
- **Geometric Series Convergence Curve (`GeometricSeriesChart`)**:
  - SVG asymptotic polyline showing partial sum $S_n \to T^*$.
  - Tabular breakdown of step sizes $\Delta t_n$ and convergence percentages ($90\%, 99\%, 99.9\%, 99.99\%\dots$).
- **Parametric Controls & Scenarios (`ControlsPanel`)**:
  - Sliders for $v_A, v_T, d_0$.
  - Historical and modern presets: Ancient Zeno, Sprint race, Long distance marathon.
- **Scientific Explainer (`ZenoExplainer`)**:
  - Historical context (Eleatic school, Parmenides).
  - Calculus breakthrough (Cauchy, Weierstrass $\varepsilon-\delta$ limit definitions).
  - Modern quantum gravity & Planck scale discretization.

### 3. Full Platform Integration

- **Intuition Challenge Card**: Probes the "Infinite Sum Divergence Fallacy" with pre-simulation hypothesis polling.
- **Telemetry & Exporters**:
  - Logs runs to backend telemetry via `useSimulationTelemetry('zeno-paradox')`.
  - Exports CSV, JSON, and PNG visual summary cards via `ExportSuitePanel`.
  - Local history records via `SimulationHistoryTable`.
  - 2-level nested scientific discussion via `CommentSection`.

---

## Verification & Testing

- **Unit Tests (`zeno-math.test.ts`)**:
  - 12 Vitest tests covering analytical overtake calculations, geometric progression correctness, asymptotic convergence, continuous kinematics, and Planck scale limits.
- **Full Monorepo Verification (`pnpm check`)**:
  - Prettier, ESLint, TypeScript strict mode across workspaces, client Vitest, server Jest, server E2E, and production builds.

---

## Consequences

- Wonderlab completes its 5th foundational interactive simulation.
- Bridges ancient philosophy, classical mechanics, calculus, and quantum physics in an intuitive, hands-on visual sandbox.
