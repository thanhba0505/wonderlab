# 0016. Art Gallery Problem & Computational Geometry Simulation

- **Status**: Accepted
- **Date**: 2026-10-26
- **Author**: Wonderlab Engineering Team

---

## Context & Problem Statement

To expand Wonderlab's coverage of **Computational Geometry, Graph Theory, and Combinatorial Optimization**, we designed and implemented an interactive laboratory exploring the **Art Gallery Problem (Bài toán Người gác Phòng trưng bày)**, formulated by Victor Klee in 1973.

The central mathematical inquiry:

> Given a simple polygon with $n$ vertices representing an art gallery room (which may be convex or non-convex with arbitrary alcoves and reflex angles), how many stationary guards are always sufficient, and sometimes necessary, to observe all points inside the room?

The core educational insights to address:

1. **Chvátal's Art Gallery Theorem (1975)**:
   $$\left\lfloor \frac{n}{3} \right\rfloor \text{ guards are always sufficient and sometimes necessary}$$
   - _Sufficient_: No simple polygon of $n$ vertices ever requires more than $\lfloor n/3 \rfloor$ guards stationed at vertices.
   - _Necessary_: Comb-shaped polygons (Chvátal's Comb) with $k$ independent prongs ($n = 3k$ vertices) require strictly $k = n/3$ guards.
2. **Steve Fisk's Beautiful 3-Coloring Proof (1978)**:
   - Triangulate the polygon into $n-2$ convex triangles using $n-3$ non-crossing internal diagonals (via Ear Clipping).
   - The dual graph of this triangulation is a tree, ensuring the vertices are always 3-colorable.
   - By the Pigeonhole Principle (Dirichlet), at least one color class contains $\le \lfloor n/3 \rfloor$ vertices.
   - Since every triangle contains all 3 colors, placing guards at vertices of the minimal color class guarantees every triangle has at least one guard, covering 100% of the room.
3. **The Complexity Gap (Worst-Case Bound vs. Instance Optimization)**:
   - While the upper bound $\lfloor n/3 \rfloor$ can be computed in polynomial time $O(n \log n)$, finding the _minimum_ number of guards for an arbitrary given polygon is **NP-hard** and **APX-hard**.

---

## Architectural Decision

### 1. Mathematical Analysis Core (`art-gallery-math.ts`)

- **Ear Clipping Triangulation (`triangulatePolygon`)**:
  - Validates ears using convex turn cross products and point-in-triangle containment tests.
  - Generates $n-2$ triangles and $n-3$ internal diagonals in $O(n^2)$.
- **Dual-Tree 3-Coloring (`computeFiskProof`)**:
  - Constructs adjacency matrix between triangles across shared diagonal edges.
  - Traverses the dual tree via BFS/DFS, assigning distinct colors $\{0, 1, 2\}$ to each triangle's vertices.
  - Identifies the minimal color class with $\le \lfloor n/3 \rfloor$ vertices.
- **360-Degree Raycasting Visibility Polygon (`computeVisibilityPolygon`)**:
  - Casts rays toward every polygon vertex at angles $\theta - \epsilon$, $\theta$, $\theta + \epsilon$.
  - Computes the nearest ray-segment intersection against all polygon boundary walls.
  - Constructs the angularly sorted visibility polygon for real-time spotlight rendering.
- **Continuous Area Coverage Metric (`calculateCoveragePercentage`)**:
  - Executes a dense 2D spatial grid sampling ($40 \times 40$) inside the polygon's bounding box.
  - Checks line-of-sight obstruction between guards and test points, providing an empirical coverage percentage ($0\% \dots 100\%$).
- **Procedural Simple Polygon Generator (`generateRandomPolygon`)**:
  - Synthesizes random non-self-intersecting polygons with custom vertex counts $n \in [4, 16]$ using radial perturbation.

### 2. Interactive Component & UI Architecture (`client/src/features/art-gallery/`)

- **Interactive Canvas (`GalleryCanvas`)**:
  - SVG stage following the "Clean Paper & Lab Editorial" aesthetic.
  - Dynamic overlay of additive semi-transparent visibility lights (`fill-amber-400/22`).
  - Interactive vertex clickable points for manual placement and toggling.
  - Triangulation diagonals and 3-coloring pulse badges.
- **Control Workbench (`GalleryControls`)**:
  - Preset library: Chvátal's Comb (3 & 4 prongs), L-shaped reflex room, Convex Hexagon, and Zigzag Hallway.
  - Random polygon generator with vertex slider ($n = 4 \dots 16$).
  - Vertex-only vs. Free-point placement modes.
- **Steve Fisk Step-by-Step Stepper (`FiskStepper`)**:
  - Interactive 5-step walkthrough from initial survey to triangulation, 3-coloring, Dirichlet selection, and 100% illumination.
- **Metrics Bar (`GalleryMetrics`)**:
  - Displays $n$, Chvátal threshold $\lfloor n/3 \rfloor$, active guards count, and real-time coverage progress.
- **System Integration**:
  - Registered in `SIMULATIONS_REGISTRY` with slug `art-gallery`, category `logic`, accent `emerald`.
  - Export capabilities for CSV and JSON datasets and Markdown research reports.
  - Dynamic Open Graph social sharing card.
