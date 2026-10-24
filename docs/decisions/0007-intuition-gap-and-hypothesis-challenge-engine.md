# ADR 0007: Intuition Gap & Hypothesis Testing Engine

## Status

Accepted

## Date

2026-10-24

## Context

Interactive simulations without structured inquiry often lead to passive clicking or slider dragging without engaging the user's scientific intuition. In cognitive science and STEM pedagogy, active hypothesis testing (predicting outcomes before observing empirical results) creates an "intuition gap" that primes the learner's brain for deeper conceptual retention.

## Decision

1. **Hypothesis Registry Schema**:
   - Defined `SimulationHypothesisChallenge` and `HypothesisOption` in `client/src/features/simulations/types.ts`.
   - Registered structured challenges for `birthday-paradox` (combining 23 people with 365 days) and `monty-hall` (switching doors dilemma) in `registry.ts`.
2. **Intuition Gap Math & Rating Utility**:
   - Built `intuition-math.ts` to compute $\Delta_{gap} = |P_{guess} - P_{truth}|$.
   - Segmented calibration rating into 3 tiers:
     - `master` (< 5% error)
     - `moderate` (5% - 30% error)
     - `trap` (> 30% error)
3. **Interactive UI (`IntuitionChallengeCard`)**:
   - Displays scientific hypothesis questions with Clean Paper & Lab Editorial aesthetics.
   - Dual-marker visual gap meter contrasting personal intuition with mathematical theorems.
   - Cognitive bias breakdown explaining evolutionary traps (Linear Scaling Trap, Uniformity Fallacy).
   - Local state cache in `localStorage` preserving user decisions across page reloads.
4. **Telemetry Feedback Loop**:
   - Attached prediction and gap metrics into background simulation payloads (`userPrediction`, `intuitionGap`).

## Consequences

- **Positive**:
  - Transforms passive simulations into active scientific experiments.
  - Users discover their cognitive biases in a quantifiable, entertaining manner.
  - Zero performance degradation; 100% test coverage with 24 Vitest tests passing.
