// Math engine for the Bodyguard Problem (2D Mirror Room / Mathematical Billiards)
// Based on Eugene Gutkin's Theorem (2005) & Leningrad Math Olympiad (1990)
// Pure TypeScript - Zero-any policy strictly enforced.

export interface Point {
  x: number;
  y: number;
}

export interface Vector2D {
  dx: number;
  dy: number;
}

export interface RaySegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RayTraceResult {
  segments: RaySegment[];
  hitTarget: boolean;
  blockedByGuard: boolean;
  blockedGuardPoint: Point | null;
  totalDistance: number;
  bounces: number;
}

export interface UnfoldedRayInfo {
  virtualImage: Point;
  unfoldedMidpoint: Point;
  foldedMidpoint: Point;
  parityX: number;
  parityY: number;
  signX: number;
  signY: number;
  direction: Vector2D;
  distance: number;
}

export interface BodyguardPreset {
  id: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  source: Point;
  target: Point;
  expectedGuards: number;
}

export const BODYGUARD_PRESETS: BodyguardPreset[] = [
  {
    id: 'generic',
    nameVi: 'Tổng quát (16 Vệ sĩ)',
    nameEn: 'Generic (16 Bodyguards)',
    descriptionVi:
      'Vị trí bất đối xứng tổng quát. Cần đúng 16 điểm vệ sĩ độc lập để che chắn hoàn toàn.',
    descriptionEn:
      'Asymmetric generic coordinates. Requires exactly 16 independent bodyguard points.',
    source: { x: 0.2, y: 0.3 },
    target: { x: 0.7, y: 0.6 },
    expectedGuards: 16,
  },
  {
    id: 'symmetric-vertical',
    nameVi: 'Đối xứng Trục Đứng (9 Vệ sĩ)',
    nameEn: 'Vertical Axis Symmetry (9 Bodyguards)',
    descriptionVi:
      'Cả nguồn và mục tiêu nằm trên trục trung trực x = 0.5. Các cặp điểm suy biến gộp lại còn 9 điểm.',
    descriptionEn:
      'Both source and target lie on vertical midline x = 0.5. Symmetry merges guard pairs to 9 points.',
    source: { x: 0.5, y: 0.2 },
    target: { x: 0.5, y: 0.8 },
    expectedGuards: 9,
  },
  {
    id: 'diagonal-symmetry',
    nameVi: 'Đối xứng Đường Chéo (10 Vệ sĩ)',
    nameEn: 'Diagonal Symmetry (10 Bodyguards)',
    descriptionVi: 'Nguồn và mục tiêu đối xứng qua đường chéo chính x = y.',
    descriptionEn: 'Source and target placed along the main diagonal x = y.',
    source: { x: 0.25, y: 0.25 },
    target: { x: 0.75, y: 0.75 },
    expectedGuards: 10,
  },
  {
    id: 'center-axis',
    nameVi: 'Cùng Trục Trung Tâm (12 Vệ sĩ)',
    nameEn: 'Center-Axis Alignment (12 Bodyguards)',
    descriptionVi: 'Nguồn sáng tại tâm (0.5, 0.5), mục tiêu cùng nằm trên trục đứng x = 0.5.',
    descriptionEn: 'Source at center (0.5, 0.5), target on same vertical axis x = 0.5.',
    source: { x: 0.5, y: 0.5 },
    target: { x: 0.5, y: 0.8 },
    expectedGuards: 12,
  },
  {
    id: 'self-reflection',
    nameVi: 'Tự Soi Gương (Giáo sư Smith)',
    nameEn: 'Self-Reflection (Professor Smith)',
    descriptionVi:
      'Nguồn sáng và mục tiêu trùng nhau. Chặn bản thân không nhìn thấy bất kỳ ảnh ảo nào.',
    descriptionEn: 'Source and target coincide. Block oneself from seeing any virtual reflections.',
    source: { x: 0.35, y: 0.45 },
    target: { x: 0.35, y: 0.45 },
    expectedGuards: 16,
  },
];

/**
 * Normalizes a coordinate v in ℝ into [0, 1] using reflection across integer mirror lines.
 * Reflection rule: folding map modulo 2, reflecting across the center.
 */
export function foldToUnit(v: number): number {
  const mod = ((v % 2) + 2) % 2; // mod in [0, 2)
  return mod <= 1 ? mod : 2 - mod;
}

/**
 * Distance between two 2D points.
 */
export function distanceBetween(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Tolerance constant for coordinate equality and deduplication.
 */
const EPS = 1e-5;

/**
 * Calculates the exact set of bodyguard points (up to 16) for source A and target B.
 * Each point is a folded midpoint of a segment from A to an unfolded virtual image of B:
 * M = ((x_A + s_x * x_B) / 2 + k, (y_A + s_y * y_B) / 2 + m)
 * where s_x, s_y ∈ {-1, 1} and k, m ∈ {0, 1}.
 */
export function calculateBodyguardPoints(source: Point, target: Point): Point[] {
  const rawGuards: Point[] = [];
  const signs = [-1, 1] as const;
  const parityOffsets = [0, 1] as const;

  for (const sx of signs) {
    for (const sy of signs) {
      for (const k of parityOffsets) {
        for (const m of parityOffsets) {
          const midX = (source.x + sx * target.x) / 2 + k;
          const midY = (source.y + sy * target.y) / 2 + m;

          const foldedX = foldToUnit(midX);
          const foldedY = foldToUnit(midY);

          // Avoid duplicating guards that coincide due to symmetry
          const isDuplicate = rawGuards.some(
            existing =>
              Math.abs(existing.x - foldedX) < EPS && Math.abs(existing.y - foldedY) < EPS,
          );

          if (!isDuplicate) {
            // Round to 5 decimal places to avoid floating point jitter
            rawGuards.push({
              x: Math.round(foldedX * 100000) / 100000,
              y: Math.round(foldedY * 100000) / 100000,
            });
          }
        }
      }
    }
  }

  // Sort by x, then y for deterministic output
  return rawGuards.sort((a, b) => (Math.abs(a.x - b.x) > EPS ? a.x - b.x : a.y - b.y));
}

/**
 * Calculates virtual images and unfolded rays within a lattice radius [-radius, radius]^2.
 * Used for both the Unfolded Grid visualization and generating Targeted Ricochets.
 */
export function calculateUnfoldedRays(
  source: Point,
  target: Point,
  gridRadius: number = 2,
): UnfoldedRayInfo[] {
  const results: UnfoldedRayInfo[] = [];
  const signs = [-1, 1] as const;

  for (let n = -gridRadius; n <= gridRadius; n++) {
    for (let p = -gridRadius; p <= gridRadius; p++) {
      for (const sx of signs) {
        for (const sy of signs) {
          // Virtual image position in unfolded plane
          const imgX = 2 * n + sx * target.x;
          const imgY = 2 * p + sy * target.y;

          // Midpoint between source and this virtual image
          const midX = (source.x + imgX) / 2;
          const midY = (source.y + imgY) / 2;

          const foldedMidX = foldToUnit(midX);
          const foldedMidY = foldToUnit(midY);

          const dx = imgX - source.x;
          const dy = imgY - source.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 1e-6) {
            results.push({
              virtualImage: { x: imgX, y: imgY },
              unfoldedMidpoint: { x: midX, y: midY },
              foldedMidpoint: {
                x: Math.round(foldedMidX * 100000) / 100000,
                y: Math.round(foldedMidY * 100000) / 100000,
              },
              parityX: n,
              parityY: p,
              signX: sx,
              signY: sy,
              direction: { dx: dx / dist, dy: dy / dist },
              distance: dist,
            });
          }
        }
      }
    }
  }

  // Deduplicate rays having the identical initial shooting direction (closest image first)
  results.sort((a, b) => a.distance - b.distance);

  const uniqueRays: UnfoldedRayInfo[] = [];
  for (const ray of results) {
    const isAngleSeen = uniqueRays.some(
      existing =>
        Math.abs(existing.direction.dx - ray.direction.dx) < 1e-4 &&
        Math.abs(existing.direction.dy - ray.direction.dy) < 1e-4,
    );
    if (!isAngleSeen) {
      uniqueRays.push(ray);
    }
  }

  return uniqueRays;
}

/**
 * Traces a single light ray bouncing inside the unit mirror square [0, 1] x [0, 1].
 * Checks for obstacle collisions (guards or target) along each straight ray segment.
 *
 * @param source Starting point inside [0, 1]^2
 * @param direction Unit vector of ray direction
 * @param target Target point to be protected
 * @param guards Active bodyguard obstacles
 * @param maxBounces Maximum wall reflections allowed (default 30)
 * @param hitRadius Radius for target/guard collision detection (default 0.02)
 */
export function traceRay(
  source: Point,
  direction: Vector2D,
  target: Point,
  guards: Point[],
  maxBounces: number = 30,
  hitRadius: number = 0.02,
): RayTraceResult {
  const segments: RaySegment[] = [];
  let curX = source.x;
  let curY = source.y;

  // Normalize direction vector
  const len = Math.hypot(direction.dx, direction.dy);
  if (len < 1e-8) {
    return {
      segments: [],
      hitTarget: false,
      blockedByGuard: false,
      blockedGuardPoint: null,
      totalDistance: 0,
      bounces: 0,
    };
  }

  let dirX = direction.dx / len;
  let dirY = direction.dy / len;

  let hitTarget = false;
  let blockedByGuard = false;
  let blockedGuardPoint: Point | null = null;
  let totalDistance = 0;
  let bounceCount = 0;

  for (let bounce = 0; bounce <= maxBounces; bounce++) {
    // 1. Time to wall boundaries
    let tWallX = Infinity;
    if (dirX > 1e-9) {
      tWallX = (1 - curX) / dirX;
    } else if (dirX < -1e-9) {
      tWallX = -curX / dirX;
    }

    let tWallY = Infinity;
    if (dirY > 1e-9) {
      tWallY = (1 - curY) / dirY;
    } else if (dirY < -1e-9) {
      tWallY = -curY / dirY;
    }

    // Small numerical threshold to prevent getting stuck on wall boundary
    const tWall = Math.max(1e-7, Math.min(tWallX, tWallY));

    // 2. Check collision with obstacles along this segment: t in [1e-4, tWall]
    interface CollisionEvent {
      t: number;
      type: 'target' | 'guard';
      guardPoint?: Point;
    }

    let earliestCollision: CollisionEvent | null = null;

    // Check target collision
    const toTargetX = target.x - curX;
    const toTargetY = target.y - curY;
    const tTargetProj = toTargetX * dirX + toTargetY * dirY;

    if (tTargetProj > 1e-4 && tTargetProj <= tWall) {
      const perpDistSq = toTargetX * toTargetX + toTargetY * toTargetY - tTargetProj * tTargetProj;
      if (perpDistSq <= hitRadius * hitRadius) {
        const offset = Math.sqrt(Math.max(0, hitRadius * hitRadius - perpDistSq));
        const tHit = Math.max(1e-4, tTargetProj - offset);
        if (tHit <= tWall) {
          earliestCollision = { t: tHit, type: 'target' };
        }
      }
    }

    // Check guard collisions
    for (const guard of guards) {
      const toGuardX = guard.x - curX;
      const toGuardY = guard.y - curY;
      const tGuardProj = toGuardX * dirX + toGuardY * dirY;

      if (tGuardProj > 1e-4 && tGuardProj <= tWall) {
        const perpDistSq = toGuardX * toGuardX + toGuardY * toGuardY - tGuardProj * tGuardProj;
        if (perpDistSq <= hitRadius * hitRadius) {
          const offset = Math.sqrt(Math.max(0, hitRadius * hitRadius - perpDistSq));
          const tHit = Math.max(1e-4, tGuardProj - offset);
          if (tHit <= tWall && (earliestCollision === null || tHit < earliestCollision.t)) {
            earliestCollision = { t: tHit, type: 'guard', guardPoint: guard };
          }
        }
      }
    }

    // 3. Handle earliest collision if one occurred before hitting wall
    if (earliestCollision !== null) {
      const endX = curX + dirX * earliestCollision.t;
      const endY = curY + dirY * earliestCollision.t;
      segments.push({ x1: curX, y1: curY, x2: endX, y2: endY });
      totalDistance += earliestCollision.t;

      if (earliestCollision.type === 'guard') {
        blockedByGuard = true;
        blockedGuardPoint = earliestCollision.guardPoint ?? null;
      } else {
        hitTarget = true;
      }
      break;
    }

    // 4. Ray hits wall at tWall
    const nextX = Math.min(1, Math.max(0, curX + dirX * tWall));
    const nextY = Math.min(1, Math.max(0, curY + dirY * tWall));

    segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
    totalDistance += tWall;
    bounceCount++;

    // Reflection rule
    if (Math.abs(tWall - tWallX) < 1e-6) {
      dirX = -dirX;
    }
    if (Math.abs(tWall - tWallY) < 1e-6) {
      dirY = -dirY;
    }

    curX = nextX;
    curY = nextY;
  }

  return {
    segments,
    hitTarget,
    blockedByGuard,
    blockedGuardPoint,
    totalDistance,
    bounces: bounceCount,
  };
}

/**
 * Computes light sweep simulation across 360 degrees.
 * Returns array of ray results and summary metrics.
 */
export function simulateRaySweep(
  source: Point,
  target: Point,
  guards: Point[],
  rayCount: number = 72,
  maxBounces: number = 25,
  hitRadius: number = 0.02,
): {
  rays: RayTraceResult[];
  raysTargetHit: number;
  raysBlocked: number;
  raysWallExhausted: number;
  protectionRate: number;
} {
  const rays: RayTraceResult[] = [];
  let raysTargetHit = 0;
  let raysBlocked = 0;
  let raysWallExhausted = 0;

  for (let i = 0; i < rayCount; i++) {
    const angle = (i * 2 * Math.PI) / rayCount;
    const direction: Vector2D = {
      dx: Math.cos(angle),
      dy: Math.sin(angle),
    };

    const result = traceRay(source, direction, target, guards, maxBounces, hitRadius);
    rays.push(result);

    if (result.hitTarget) {
      raysTargetHit++;
    } else if (result.blockedByGuard) {
      raysBlocked++;
    } else {
      raysWallExhausted++;
    }
  }

  const targetedOrBlocked = raysTargetHit + raysBlocked;
  const protectionRate =
    targetedOrBlocked > 0 ? (raysBlocked / targetedOrBlocked) * 100 : guards.length > 0 ? 100 : 0;

  return {
    rays,
    raysTargetHit,
    raysBlocked,
    raysWallExhausted,
    protectionRate,
  };
}

/**
 * Simulates targeted ricochet rays aiming at the unfolded virtual images of target.
 */
export function simulateTargetedRicochets(
  source: Point,
  target: Point,
  guards: Point[],
  maxBounces: number = 30,
  hitRadius: number = 0.02,
): {
  rays: RayTraceResult[];
  totalTargeted: number;
  blockedCount: number;
  hitCount: number;
  protectionRate: number;
} {
  const unfoldedInfo = calculateUnfoldedRays(source, target, 2);
  const rays: RayTraceResult[] = [];

  let blockedCount = 0;
  let hitCount = 0;

  for (const info of unfoldedInfo) {
    const result = traceRay(source, info.direction, target, guards, maxBounces, hitRadius);
    rays.push(result);

    if (result.blockedByGuard) {
      blockedCount++;
    } else if (result.hitTarget) {
      hitCount++;
    }
  }

  const total = rays.length;
  const protectionRate = total > 0 ? (blockedCount / total) * 100 : 100;

  return {
    rays,
    totalTargeted: total,
    blockedCount,
    hitCount,
    protectionRate,
  };
}
