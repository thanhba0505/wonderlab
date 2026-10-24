# 0012. Interactive Prisoner's Dilemma & Evolutionary Game Theory Simulation

- **Status**: Accepted
- **Date**: 2026-10-24
- **Author**: Wonderlab Engineering Team

---

## Context & Problem Statement

Following the successful implementation of probability (Birthday Paradox, Monty Hall) and quantum mechanics (Double-Slit Experiment), Wonderlab required an authentic interactive simulation for **Game Theory & Evolutionary Biology**.

The chosen phenomenon is **The Prisoner's Dilemma (Thế lưỡng nan của người tù)**, originally formulated by Merrill Flood and Melvin Dresher (1950) and popularized by Albert W. Tucker.

The core educational dilemmas and cognitive paradoxes to address:

1. **Nash Equilibrium vs Pareto Optimality**: In a single-shot game, defection dominates cooperation ($T > R > P > S$), driving rational self-interested actors into mutual betrayal ($P, P$), which is strictly worse than mutual cooperation ($R, R$).
2. **Iterated Prisoner's Dilemma (IPD)**: When interactions repeat with an unknown horizon, long-term reciprocity emerges as the evolutionarily stable strategy.
3. **Axelrod's Evolutionary Tournament**: Robert Axelrod's landmark 1980 computer tournament showed that simple reciprocal strategies like **Tit-for-Tat** outperform selfish exploitation when strategies compete across generations.
4. **Zero-Sum Fallacy**: Human intuition routinely conflates competition with zero-sum destruction, failing to recognize that non-zero-sum games reward conditional cooperation.

---

## Architectural Decision

### 1. Mathematical Game Theory Core (`game-theory-math.ts`)

- **Standard Payoff Matrix**:
  - $T = 5$ (Temptation to defect)
  - $R = 3$ (Reward for mutual cooperation)
  - $P = 1$ (Punishment for mutual defection)
  - $S = 0$ (Sucker's payoff)
  - Satisfies axioms: $T > R > P > S$ ($5 > 3 > 1 > 0$) and $2R > T + S$ ($6 > 5$).
- **7 Classical Strategy Archetypes**:
  1. `tit_for_tat`: Starts Cooperate, mirrors opponent's previous move.
  2. `always_defect`: Unconditional defection.
  3. `always_cooperate`: Unconditional cooperation.
  4. `grudger`: Cooperates until opponent defects once, then defects forever.
  5. `pavlov`: Win-stay, Lose-shift (repeats move if payoff was $\ge 3$).
  6. `tit_for_two_tats`: Forgiving archetype; only retaliates after two consecutive defections.
  7. `random`: Stochastic $50/50$ choice.
- **Stochastic Noise (Trembling Hand)**:
  - Models miscommunication or implementation errors ($\varepsilon \in [0, 0.25]$) where intended moves flip with probability $\varepsilon$.
- **Evolutionary Population Tournament (Replicator Dynamics)**:
  - Discrete generational round-robin tournament of $N = 100$ individuals across the 7 strategies:
    $$f_i = \text{Average fitness of strategy } i$$
    $$P_i^{(t+1)} = \text{round}\left( P_i^{(t)} \cdot \frac{f_i}{\bar{f}} \right)$$
  - Normalized with delta-correction to strictly conserve total population size at $N = 100$.

### 2. UI/UX Architecture (`PrisonersDilemmaSimulation`)

- **Dual-Mode Switcher**:
  - **Mode 1: 1-on-1 Duel Arena (`DuelArena`)**:
    - User plays directly against any of the 7 strategy bots.
    - Configurable round count ($10, 20, 50, 100$) and noise rate.
    - Interactive decisions (`HỢP TÁC` vs `PHẢN BỘI`) with `active:scale-[0.98]` tactile feel.
    - Fast auto-play / fast-forward simulation.
    - Round history reel with visual badges, payoffs, and cumulative score graphs.
  - **Mode 2: Axelrod Evolutionary Tournament (`AxelrodTournament`)**:
    - Population distribution bar chart across all 7 archetypes.
    - Generational stepper and automated play/pause loop.
    - Preset initial distributions (Axelrod Classic, Hostile World, Utopian, Equal).
    - Real-time dominant strategy tracker.
- **Dynamic Payoff Matrix View (`PayoffMatrixView`)**:
  - Highlights active cell in real-time according to moves chosen in the current round.
- **Axelrod's 4 Virtues Explainer (`StrategyExplainer`)**:
  - Educational breakdown of the four qualities that make cooperation evolutionarily successful: Nice (Lương thiện), Retaliatory (Sòng phẳng), Forgiving (Khoan dung), Clear (Rõ ràng).

### 3. Full Platform Ecosystem Integration

- **Intuition Challenge Card**:
  - Challenges the **Zero-Sum Fallacy** before interaction.
- **Telemetry & Exporters**:
  - `useSimulationTelemetry('prisoners-dilemma')` tracks game runs, cooperation rates, and evolutionary checkpoints.
  - `ExportSuitePanel` exports round-by-round decisions and cumulative scores in CSV, JSON, and visual PNG summary cards.
  - `SimulationHistoryTable` displays user game records and outcome statistics.
  - `CommentSection` supports scientific discussion with 2-level replies.

---

## Verification & Testing

- **Vitest Unit Tests (`game-theory-math.test.ts`)**:
  - 15 comprehensive unit tests covering:
    - Axiomatic payoff calculations ($T > R > P > S, 2R > T + S$).
    - Decision trees for all 7 strategy archetypes under varied round histories.
    - Stochastic noise injection.
    - Head-to-head match simulation and cumulative payoffs.
    - Replicator dynamics population conservation and fitness normalization.
- **End-to-End & Static Analysis**:
  - Formatted via Prettier.
  - Full TypeScript strict typechecking passing across client and server.
  - Full monorepo verification via `pnpm check`.

---

## Consequences

- Wonderlab gains an interactive Game Theory & Evolutionary Dynamics lab.
- Demystifies Nash Equilibrium vs Pareto Optimality with tangible, interactive visual tools.
- Demonstrates how mathematical cooperation emerges naturally without centralized authority.
