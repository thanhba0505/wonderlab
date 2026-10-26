// Math engine for the Bodyguard Problem (2D mirror room)
// All functions are pure TypeScript without any usage of `any`.

/**
 * Normalises a coordinate to the unit interval [0, 1] using the reflection rule.
 * The room is mirrored at each integer boundary, so the folding function maps a
 * value v ∈ ℝ to the coordinate inside a single unit square.
 */
export function foldToUnit(v: number): number {
  // Bring v into [0, 2) using modulo 2, then reflect if > 1.
  const mod = ((v % 2) + 2) % 2; // ensures positive result
  return mod <= 1 ? mod : 2 - mod;
}

/**
 * Compute the 16 (or fewer after deduplication) guard positions for a given
 * source point A and target point B inside the unit square.
 *
 * The algorithm follows the unfolding approach described in the plan: for each
 * sign combination (±x_B, ±y_B) and each parity offset (0 or 1) we compute the
 * midpoint between A and the corresponding virtual image of B, then fold the
 * result back into the original square.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Tolerance for considering two points identical (used when rounding artefacts).
 */
const EPS = 1e-8;

export function calculateBodyguardPoints(source: Point, target: Point): Point[] {
  const guards: Point[] = [];
  const signs: number[] = [-1, 1];
  const offsets: number[] = [0, 1];

  for (const sx of signs) {
    for (const sy of signs) {
      for (const ox of offsets) {
        for (const oy of offsets) {
          // virtual image of target after reflections and parity shift
          const imgX = sx * target.x + ox * 2; // each parity shift adds a full width (2 units)
          const imgY = sy * target.y + oy * 2;
          // midpoint between source and virtual image
          const midX = (source.x + imgX) / 2;
          const midY = (source.y + imgY) / 2;
          // fold back into the original unit square
          const foldedX = foldToUnit(midX);
          const foldedY = foldToUnit(midY);
          // deduplicate by distance tolerance
          const exists = guards.some(
            p => Math.abs(p.x - foldedX) < EPS && Math.abs(p.y - foldedY) < EPS,
          );
          if (!exists) {
            guards.push({ x: foldedX, y: foldedY });
          }
        }
      }
    }
  }
  return guards;
}

/**
 * Simple ray‑casting inside the unit square with perfect mirror walls. The ray
 * stops when it either hits the target point (within a small radius) or meets a
 * guard point.
 *
 * Returns true if the ray reaches the target without being blocked.
 */
export function castRayInRoom(
  source: Point,
  direction: { dx: number; dy: number },
  target: Point,
  guards: Point[],
  maxBounces: number = 20,
): boolean {
  const radiusTarget = 0.012; // safe radius around target (≈ 12 px at 100 % scale)
  const radiusGuard = 0.012; // same radius for guard points
  let { x, y } = source;
  let { dx, dy } = direction;

  // normalise direction
  const len = Math.hypot(dx, dy);
  if (len === 0) return false;
  dx /= len;
  dy /= len;

  for (let bounce = 0; bounce <= maxBounces; bounce++) {
    // early exit: reached target
    const distToTarget = Math.hypot(x - target.x, y - target.y);
    if (distToTarget <= radiusTarget) return true;

    // check guard interception before hitting a wall
    for (const g of guards) {
      const distToGuard = Math.hypot(x - g.x, y - g.y);
      if (distToGuard <= radiusGuard) return false; // blocked
    }

    // compute time to each wall (0 or 1 boundaries)
    const tX = dx > 0 ? (1 - x) / dx : dx < 0 ? -x / dx : Infinity;
    const tY = dy > 0 ? (1 - y) / dy : dy < 0 ? -y / dy : Infinity;
    const t = Math.min(tX, tY);
    // move to collision point
    x += dx * t;
    y += dy * t;

    // reflect direction
    if (Math.abs(t - tX) < EPS) dx = -dx; // hit vertical wall
    if (Math.abs(t - tY) < EPS) dy = -dy; // hit horizontal wall
  }
  // exceeded bounce limit without hitting target
  return false;
}

/**
 * Generate all ray directions that would, after unfolding, hit an image of the
 * target within a bounded lattice. This is used for the "targeted ricochet"
 * visualization.
 */
export function findTargetedRays(
  source: Point,
  target: Point,
  maxShift: number = 3,
): { dx: number; dy: number }[] {
  const rays: { dx: number; dy: number }[] = [];
  const signs: number[] = [-1, 1];
  for (const sx of signs) {
    for (const sy of signs) {
      for (let ox = -maxShift; ox <= maxShift; ox++) {
        for (let oy = -maxShift; oy <= maxShift; oy++) {
          const imgX = sx * target.x + ox * 2;
          const imgY = sy * target.y + oy * 2;
          const dx = imgX - source.x;
          const dy = imgY - source.y;
          if (dx === 0 && dy === 0) continue; // same point, ignore
          const len = Math.hypot(dx, dy);
          rays.push({ dx: dx / len, dy: dy / len });
        }
      }
    }
  }
  return rays;
}
