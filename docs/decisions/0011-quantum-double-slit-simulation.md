# 0011. Quantum Double-Slit Experiment & Wavefunction Collapse Simulation

- **Status**: Accepted
- **Date**: 2026-10-24
- **Author**: Wonderlab Engineering Team

---

## Context & Problem Statement

Wonderlab's initial interactive simulations covered probabilistic paradoxes (Monty Hall and Birthday Paradox). To fulfill the platform's vision of demystifying counter-intuitive phenomena across multiple branches of science, Wonderlab required an authentic physical simulation of **Quantum Mechanics** — specifically the foundational **Double-Slit Experiment (Thí nghiệm Hai khe Young)**.

The challenge was to simulate both:

1. **Quantum Wave Superposition & Self-Interference**: Even when single particles are emitted one by one, they accumulate into an optical interference pattern.
2. **Measurement Problem & Wavefunction Collapse**: When an observer/detector is enabled at the slits to determine "which-way" information, the quantum superposition collapses into two classical particle bands.

---

## Architectural Decision

### 1. Quantum Mathematics Core (`quantum-math.ts`)

- **Interference Formula (Observer OFF)**:
  $$I(y) = \cos^2\left(\frac{\pi d y}{\lambda D}\right) \cdot \operatorname{sinc}^2\left(\frac{\pi a y}{\lambda D}\right)$$
  Incorporates both double-slit interference and single-slit diffraction envelope.
- **Wavefunction Collapse (Observer ON)**:
  $$I_{\text{obs}}(y) = \frac{1}{2}\operatorname{sinc}^2\left(\frac{\pi a (y - d/2)}{\lambda D}\right) + \frac{1}{2}\operatorname{sinc}^2\left(\frac{\pi a (y + d/2)}{\lambda D}\right)$$
  Destroys the cross-term interference, producing two classical particle bands centered at $\pm d/2$.
- **Monte Carlo Particle Hit Sampling**:
  - Implements rejection sampling on the normalized probability density function (PDF).
  - Supports single-photon emission and batch bursts ($1{,}000$ particles in milliseconds).
- **Physical Spectrum Wavelength-to-RGB**:
  - Maps $\lambda \in [400\,\text{nm}, 700\,\text{nm}]$ to accurate visible spectrum colors.

### 2. Interactive Visualizer (`SlitVisualizer`)

- Real-time HTML5 Canvas rendering optical bench:
  - Emitter aperture with wavelength glow.
  - Semicircular Huygens-Fresnel wave ripples from both slits.
  - Active/Idle detector sensors at the slits with laser scan lines.
  - Phosphor screen accumulating persistent hit points with a real-time density histogram.

### 3. Full Ecosystem Integration

- **Intuition Challenge**: Probing the "Classical Particle Fallacy" before users run the simulation.
- **Controls & Parametric Modifiers**: $\lambda$ (wavelength), $d$ (slit distance), $D$ (screen distance).
- **Intensity Profile Chart**: SVG comparing theoretical wave equation against empirical histogram.
- **Telemetry & Exporter**: Automatic run logging via `useSimulationTelemetry`, CSV/JSON/PNG export via `ExportSuitePanel`, and nested comments via `CommentSection`.

---

## Consequences

- Wonderlab now features its first Quantum Physics interactive simulation.
- Users can directly interact with the observer effect, building intuitive understanding of wavefunction collapse.
- 100% test-covered with Vitest unit tests and integrated with the monorepo verification pipeline.
