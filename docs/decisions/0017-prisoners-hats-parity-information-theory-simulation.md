# 0017. Prisoners & Hats Riddle: Information Theory & Parity Check Simulation

- **Status**: Accepted
- **Date**: 2026-10-26
- **Author**: Wonderlab Engineering Team

---

## Context & Problem Statement

To expand Wonderlab's exploration of **Information Theory, Discrete Mathematics, and Cooperative Logic**, we designed and implemented an interactive laboratory dedicated to the **Prisoners & Hats Riddle (Bài toán Đội mũ & Bit Chẵn lẻ)**.

### The Riddle Setup:

1. $N$ participants (prisoners) stand in a line facing forward ($N \to 1$).
2. Each participant wears a hat chosen from $K$ colors (default: 2 colors — Black and White).
3. Participant $N$ (last in line) sees hats of participants $1 \dots N-1$. Participant $k$ sees hats $1 \dots k-1$. Participant 1 sees no one. No one sees their own hat or hats behind them.
4. Starting from Participant $N$ down to 1, each must speak aloud only a single color.
5. All participants can hear previous shouts.

### Core Mathematical Insights:

1. **Parity Bit Principle ($\mathbb{F}\_2$ / Modulo 2)**:
   - Participant $N$ sacrifices their guess by counting the number of Black hats seen in front:
     $$p = \sum_{j=1}^{N-1} c_j \pmod 2$$
   - Participant $N$ speaks color $p$.
2. **Sequential Deductive Invariant**:
   - For any participant $k < N$, given the running parity $p_k$ from previous speakers and the seen sum ahead $s_k = \sum_{j=1}^{k-1} c_j \pmod K$:
     $$c_k = (p_k - s_k) \pmod K$$
   - This guarantees that **100% of the remaining $(N-1)$ participants guess correctly**.
3. **Generalization to $K$ Colors ($\mathbb{Z}\_K$)**:
   - The strategy holds for arbitrary color spaces using arithmetic modulo $K$.
4. **Real-World Connections**:
   - **RAM ECC**: Single-bit parity checks protect server memory from cosmic ray bit flips.
   - **Hamming [7, 4] Code**: Extending parity bits allows error detection and correction.
   - **RAID 4/5**: Parity drive XOR blocks enable complete data recovery upon single disk failure.

---

## Architectural Decision

### 1. Mathematical Analysis Core (`hat-puzzle-math.ts`)

- Pure, deterministic calculation functions:
  - `solveHatPuzzle(actualHats, colorCount)`: Solves any configuration of size $N \in [2, 10]$ and $K \in \{2, 3\}$.
  - `evaluateUserGuess(position, userGuess, actualHats, colorCount)`: Validates role-play player choices with complete mathematical explanations.
  - `runMonteCarloSimulations(n, colorCount, trials)`: High-throughput empirical convergence verification.
- Unit tests (`hat-puzzle-math.test.ts`):
  - 100% test coverage for parity convergence, edge cases (all identical hats), sacrifice person failure isolation, and modulo 3 extensions.

### 2. Interactive Simulation Orchestrator (`prisoners-hats-simulation.tsx`)

- High-craft UI following Wonderlab's _Clean Paper & Lab Editorial_ aesthetic.
- Features:
  - **The Lineup Stage (`lineup-stage.tsx`)**: SVG/vector characters with field-of-view scanning cones, directional sight horizons, and turn speech bubbles.
  - **Role-Play Mode (`roleplay-controller.tsx`)**: Enables the user to stand in line at position $k$, hides their hat with a `?`, and evaluates their live deduction with hints.
  - **Realtime Logic Blackboard (`parity-blackboard.tsx`)**: Displays running parity subtractions, turn-by-turn formula evaluation, and audit logs.
  - **Simulation Controls (`simulation-controls.tsx`)**: Select $N \in [3, 10]$, $K \in \{2, 3\}$, randomize hats, manual hat customization, and playback speed control.
  - **Monte Carlo Panel (`monte-carlo-panel.tsx`)**: Executes 100 to 5,000 automated rounds to empirically verify that $(N-1)$ participants always achieve 100% survival.
  - **Editorial Explainer (`parity-explainer.tsx`)**: In-depth essay connecting the puzzle to RAM ECC, Hamming codes, and RAID arrays.
  - **Telemetry & Data Export**: Integrates `ExportSuitePanel` (CSV, JSON) and `SimulationHistoryTable`.

---

## Verification & Status

- Unit tests: 9/9 new mathematical tests passed. Total test suites: 17 client (109 tests), 9 server (57 tests).
- E2E tests: 4 suites (28 tests) passing.
- Typecheck: Full TypeScript strict compliance (`tsc --noEmit`) with 0 errors across client and server.
- Lint & Format: Prettier and Next.js / ESLint passed with 0 warnings.
- Production build: Successfully generated static pages (40/40) on Next.js 15 App Router.
