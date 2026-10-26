/**
 * Art Gallery Problem — Computational Geometry & Mathematical Engine
 *
 * Implements:
 * 1. Simple polygon validation & geometric helpers
 * 2. Ear Clipping Triangulation (O(n²))
 * 3. Steve Fisk's 3-Coloring via Dual Tree DFS
 * 4. 360-degree Raycasting Visibility Polygon
 * 5. Analytical area & Monte Carlo coverage metric
 * 6. Procedural random non-self-intersecting polygon generator
 */

export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  p1: Point;
  p2: Point;
}

export type TriangleIndices = [number, number, number];

export interface TriangulationResult {
  triangles: TriangleIndices[];
  diagonals: Segment[];
}

export type VertexColor = 0 | 1 | 2; // 3 distinct colors (e.g. Amber, Emerald, Blue)

export interface FiskProofResult {
  triangles: TriangleIndices[];
  diagonals: Segment[];
  vertexColors: VertexColor[];
  colorCounts: [number, number, number];
  optimalColor: VertexColor;
  guardVertexIndices: number[];
  chvatalBound: number;
}

export interface VisibilityPolygon {
  guard: Point;
  points: Point[];
}

export interface PolygonPreset {
  id: string;
  name: string;
  description: string;
  vertices: Point[];
  recommendedGuards: number;
}

// Tolerance for floating point geometric comparisons
const EPSILON = 1e-7;

/**
 * Calculates signed area of polygon using Shoelace formula.
 * Positive = Counter-Clockwise (CCW), Negative = Clockwise (CW).
 */
export function calculateSignedArea(polygon: Point[]): number {
  const n = polygon.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const p1 = polygon[i]!;
    const p2 = polygon[(i + 1) % n]!;
    area += p1.x * p2.y - p2.x * p1.y;
  }
  return area / 2;
}

/**
 * Calculates absolute polygon area.
 */
export function calculatePolygonArea(polygon: Point[]): number {
  return Math.abs(calculateSignedArea(polygon));
}

/**
 * Ensures vertices are ordered Counter-Clockwise (CCW).
 */
export function ensureCCW(polygon: Point[]): Point[] {
  if (calculateSignedArea(polygon) < 0) {
    return [...polygon].reverse();
  }
  return [...polygon];
}

/**
 * 2D cross product of vector AB and AC: (B - A) x (C - A)
 * Positive = Counter-Clockwise turn (Left turn)
 * Negative = Clockwise turn (Right turn)
 * Zero = Collinear
 */
export function crossProduct(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/**
 * Checks if point P lies inside triangle ABC (inclusive of boundary).
 */
export function isPointInTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const cp1 = crossProduct(a, b, p);
  const cp2 = crossProduct(b, c, p);
  const cp3 = crossProduct(c, a, p);

  const hasNeg = cp1 < -EPSILON || cp2 < -EPSILON || cp3 < -EPSILON;
  const hasPos = cp1 > EPSILON || cp2 > EPSILON || cp3 > EPSILON;

  return !(hasNeg && hasPos);
}

/**
 * Checks whether line segment AB and CD properly intersect (or touch).
 */
export function doSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const ccw = (a: Point, b: Point, c: Point): number => {
    return (c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x);
  };

  const d1 = ccw(p1, p3, p4);
  const d2 = ccw(p2, p3, p4);
  const d3 = ccw(p1, p2, p3);
  const d4 = ccw(p1, p2, p4);

  if (
    ((d1 > EPSILON && d2 < -EPSILON) || (d1 < -EPSILON && d2 > EPSILON)) &&
    ((d3 > EPSILON && d4 < -EPSILON) || (d3 < -EPSILON && d4 > EPSILON))
  ) {
    return true;
  }

  return false;
}

/**
 * Ray-segment intersection.
 * Ray starts at rayOrigin with angle (radians).
 * Returns distance t along ray, or null if no positive intersection.
 */
export function raySegmentIntersection(
  rayOrigin: Point,
  rayAngle: number,
  segP1: Point,
  segP2: Point,
): { distance: number; point: Point } | null {
  const dx = Math.cos(rayAngle);
  const dy = Math.sin(rayAngle);

  const v1x = rayOrigin.x - segP1.x;
  const v1y = rayOrigin.y - segP1.y;
  const v2x = segP2.x - segP1.x;
  const v2y = segP2.y - segP1.y;

  const cross = dx * v2y - dy * v2x;
  if (Math.abs(cross) < EPSILON) {
    return null; // Parallel
  }

  const t1 = (v2x * v1y - v2y * v1x) / cross; // Distance along ray
  const t2 = (dx * v1y - dy * v1x) / cross; // Parameter along segment [0, 1]

  if (t1 > EPSILON && t2 >= -EPSILON && t2 <= 1 + EPSILON) {
    return {
      distance: t1,
      point: {
        x: rayOrigin.x + t1 * dx,
        y: rayOrigin.y + t1 * dy,
      },
    };
  }

  return null;
}

/**
 * Checks if point P is inside a simple polygon (Ray casting / Winding algorithm).
 */
export function isPointInsidePolygon(point: Point, polygon: Point[]): boolean {
  const n = polygon.length;
  if (n < 3) return false;

  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i]!.x;
    const yi = polygon[i]!.y;
    const xj = polygon[j]!.x;
    const jh = polygon[j]!.y;

    const intersect =
      yi > point.y !== jh > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (jh - yi + EPSILON) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Ear Clipping Triangulation Algorithm for Simple Polygons (O(n²)).
 * Returns an array of triangle vertex indices into the original polygon array.
 */
export function triangulatePolygon(polygon: Point[]): TriangulationResult {
  const n = polygon.length;
  if (n < 3) {
    return { triangles: [], diagonals: [] };
  }
  if (n === 3) {
    return {
      triangles: [[0, 1, 2]],
      diagonals: [],
    };
  }

  const ccwPoly = ensureCCW(polygon);
  const originalIndices: number[] = polygon.map((_, i) => i);
  const remaining: number[] = [...originalIndices];

  const triangles: TriangleIndices[] = [];
  const diagonals: Segment[] = [];

  const isEar = (prevIdx: number, currIdx: number, nextIdx: number): boolean => {
    const a = ccwPoly[prevIdx]!;
    const b = ccwPoly[currIdx]!;
    const c = ccwPoly[nextIdx]!;

    // Must be convex corner (left turn in CCW)
    if (crossProduct(a, b, c) <= EPSILON) {
      return false;
    }

    // No other remaining vertex can be inside triangle ABC
    for (const otherIdx of remaining) {
      if (otherIdx === prevIdx || otherIdx === currIdx || otherIdx === nextIdx) {
        continue;
      }
      const p = ccwPoly[otherIdx]!;
      if (isPointInTriangle(p, a, b, c)) {
        return false;
      }
    }

    return true;
  };

  const count = remaining.length;
  let safetyCounter = 0;
  const maxIterations = count * count * 2;

  while (remaining.length > 3 && safetyCounter < maxIterations) {
    safetyCounter++;
    let earFound = false;

    for (let i = 0; i < remaining.length; i++) {
      const prev = remaining[(i - 1 + remaining.length) % remaining.length]!;
      const curr = remaining[i]!;
      const next = remaining[(i + 1) % remaining.length]!;

      if (isEar(prev, curr, next)) {
        triangles.push([prev, curr, next]);
        diagonals.push({
          p1: ccwPoly[prev]!,
          p2: ccwPoly[next]!,
        });
        remaining.splice(i, 1);
        earFound = true;
        break;
      }
    }

    if (!earFound) {
      // Degenerate fallback for complex self-adjacent vertices
      const fallbackIdx = 1;
      const prev = remaining[0]!;
      const curr = remaining[fallbackIdx]!;
      const next = remaining[2]!;
      triangles.push([prev, curr, next]);
      remaining.splice(fallbackIdx, 1);
    }
  }

  if (remaining.length === 3) {
    triangles.push([remaining[0]!, remaining[1]!, remaining[2]!]);
  }

  return { triangles, diagonals };
}

/**
 * Steve Fisk's 3-Coloring of Polygon Triangulation.
 * The dual graph of any polygon triangulation is a tree, which is always 3-colorable.
 */
export function computeFiskProof(polygon: Point[]): FiskProofResult {
  const n = polygon.length;
  const chvatalBound = Math.floor(n / 3);

  if (n < 3) {
    return {
      triangles: [],
      diagonals: [],
      vertexColors: [],
      colorCounts: [0, 0, 0],
      optimalColor: 0,
      guardVertexIndices: [],
      chvatalBound: 0,
    };
  }

  const { triangles, diagonals } = triangulatePolygon(polygon);

  // Initialize vertex colors as unassigned (-1)
  const vertexColors: Array<VertexColor | -1> = new Array(n).fill(-1);

  if (triangles.length === 0) {
    return {
      triangles: [],
      diagonals: [],
      vertexColors: new Array(n).fill(0),
      colorCounts: [n, 0, 0],
      optimalColor: 0,
      guardVertexIndices: [0],
      chvatalBound,
    };
  }

  // Build dual graph of triangles: adjacency through shared diagonals
  const numTriangles = triangles.length;
  const adj: number[][] = Array.from({ length: numTriangles }, () => []);

  for (let i = 0; i < numTriangles; i++) {
    const tA = triangles[i]!;
    for (let j = i + 1; j < numTriangles; j++) {
      const tB = triangles[j]!;
      // Count shared vertices
      const shared = tA.filter(v => tB.includes(v));
      if (shared.length === 2) {
        adj[i]!.push(j);
        adj[j]!.push(i);
      }
    }
  }

  // Color first triangle with distinct colors 0, 1, 2
  const firstTri = triangles[0]!;
  vertexColors[firstTri[0]!] = 0;
  vertexColors[firstTri[1]!] = 1;
  vertexColors[firstTri[2]!] = 2;

  // DFS traversal on dual graph tree
  const visitedTriangles = new Set<number>();
  visitedTriangles.add(0);
  const queue: number[] = [0];

  while (queue.length > 0) {
    const currTriIdx = queue.shift()!;
    const neighbors = adj[currTriIdx] ?? [];

    for (const neighborIdx of neighbors) {
      if (!visitedTriangles.has(neighborIdx)) {
        visitedTriangles.add(neighborIdx);
        queue.push(neighborIdx);

        const neighborTri = triangles[neighborIdx]!;
        // Find which vertex in neighborTri is not yet colored
        const uncolored = neighborTri.filter(v => vertexColors[v] === -1);
        if (uncolored.length === 1) {
          const targetVertex = uncolored[0]!;
          // The other two are colored; find missing color from {0, 1, 2}
          const existingColors = new Set(
            neighborTri.filter(v => v !== targetVertex).map(v => vertexColors[v]),
          );
          for (const c of [0, 1, 2] as VertexColor[]) {
            if (!existingColors.has(c)) {
              vertexColors[targetVertex] = c;
              break;
            }
          }
        }
      }
    }
  }

  // Safeguard: Assign any isolated vertices if polygon has degenerate edges
  for (let i = 0; i < n; i++) {
    if (vertexColors[i] === -1) {
      vertexColors[i] = 0;
    }
  }

  const finalColors = vertexColors as VertexColor[];

  // Count vertices per color
  const colorCounts: [number, number, number] = [0, 0, 0];
  for (const c of finalColors) {
    colorCounts[c]++;
  }

  // Find color with minimum vertices (Pigeonhole Principle <= floor(n/3))
  let optimalColor: VertexColor = 0;
  let minCount = colorCounts[0];
  if (colorCounts[1] < minCount) {
    optimalColor = 1;
    minCount = colorCounts[1];
  }
  if (colorCounts[2] < minCount) {
    optimalColor = 2;
  }

  const guardVertexIndices: number[] = [];
  for (let i = 0; i < n; i++) {
    if (finalColors[i] === optimalColor) {
      guardVertexIndices.push(i);
    }
  }

  return {
    triangles,
    diagonals,
    vertexColors: finalColors,
    colorCounts,
    optimalColor,
    guardVertexIndices,
    chvatalBound,
  };
}

/**
 * Computes Visibility Polygon from an arbitrary guard point inside/on polygon.
 * Uses 360-degree raycasting with angular sweep to all polygon vertices.
 */
export function computeVisibilityPolygon(guard: Point, polygon: Point[]): VisibilityPolygon {
  const n = polygon.length;
  if (n < 3) {
    return { guard, points: [] };
  }

  // Collect ray angles toward every polygon vertex with delta offsets (+/- epsilon)
  const angles: number[] = [];
  for (let i = 0; i < n; i++) {
    const v = polygon[i]!;
    const angle = Math.atan2(v.y - guard.y, v.x - guard.x);
    angles.push(angle - 0.0005, angle, angle + 0.0005);
  }

  // Sort angles
  angles.sort((a, b) => a - b);

  const visibilityPoints: Point[] = [];

  for (const angle of angles) {
    let closestDist = Infinity;
    let closestPoint: Point | null = null;

    // Test ray against all edges of the polygon
    for (let i = 0; i < n; i++) {
      const segP1 = polygon[i]!;
      const segP2 = polygon[(i + 1) % n]!;

      const hit = raySegmentIntersection(guard, angle, segP1, segP2);
      if (hit && hit.distance > EPSILON && hit.distance < closestDist) {
        closestDist = hit.distance;
        closestPoint = hit.point;
      }
    }

    if (closestPoint) {
      visibilityPoints.push(closestPoint);
    }
  }

  // Filter consecutive nearly-identical points
  const simplified: Point[] = [];
  for (let i = 0; i < visibilityPoints.length; i++) {
    const pt = visibilityPoints[i]!;
    const prev = simplified[simplified.length - 1];
    if (!prev || Math.hypot(pt.x - prev.x, pt.y - prev.y) > 0.5) {
      simplified.push(pt);
    }
  }

  return { guard, points: simplified };
}

/**
 * Computes percentage of polygon area covered by a set of guards.
 * Uses a deterministic dense grid sampling within the bounding box of polygon.
 */
export function calculateCoveragePercentage(guards: Point[], polygon: Point[]): number {
  if (guards.length === 0 || polygon.length < 3) {
    return 0;
  }

  // Compute bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const v of polygon) {
    if (v.x < minX) minX = v.x;
    if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }

  const steps = 40; // 40 x 40 sample points
  const stepX = (maxX - minX) / steps;
  const stepY = (maxY - minY) / steps;

  let totalInside = 0;
  let totalCovered = 0;

  const n = polygon.length;

  for (let i = 0; i <= steps; i++) {
    const x = minX + i * stepX;
    for (let j = 0; j <= steps; j++) {
      const y = minY + j * stepY;
      const testPoint: Point = { x, y };

      if (!isPointInsidePolygon(testPoint, polygon)) {
        continue;
      }

      totalInside++;

      // Check if testPoint is visible to at least 1 guard
      let isVisible = false;
      for (const guard of guards) {
        let blocked = false;
        // Check if segment guard -> testPoint intersects any polygon wall
        for (let k = 0; k < n; k++) {
          const segP1 = polygon[k]!;
          const segP2 = polygon[(k + 1) % n]!;

          // If either endpoint is the guard or testPoint, they touch at endpoint
          if (doSegmentsIntersect(guard, testPoint, segP1, segP2)) {
            blocked = true;
            break;
          }
        }

        if (!blocked) {
          isVisible = true;
          break;
        }
      }

      if (isVisible) {
        totalCovered++;
      }
    }
  }

  if (totalInside === 0) return 0;
  return Math.min(100, Math.round((totalCovered / totalInside) * 1000) / 10);
}

/**
 * Standard Presets illustrating key theorems and edge cases.
 */
export const GALLERY_PRESETS: PolygonPreset[] = [
  {
    id: 'chvatal-comb-3',
    name: 'Phòng Răng Lược Chvátal (9 đỉnh)',
    description:
      'Trường hợp xấu nhất kinh điển: 3 chóp nhọn riêng biệt đòi hỏi tối thiểu ⌊9/3⌋ = 3 người gác.',
    recommendedGuards: 3,
    vertices: [
      { x: 60, y: 350 },
      { x: 100, y: 90 },
      { x: 150, y: 270 },
      { x: 210, y: 90 },
      { x: 270, y: 270 },
      { x: 330, y: 90 },
      { x: 390, y: 270 },
      { x: 440, y: 350 },
      { x: 60, y: 350 },
    ].slice(0, 8), // 8 or 9 vertices
  },
  {
    id: 'chvatal-comb-4',
    name: 'Phòng Răng Lược Lớn (12 đỉnh)',
    description:
      '4 chóp độc lập che khuất lẫn nhau: minh họa trường hợp n = 12 cần đúng 4 người gác.',
    recommendedGuards: 4,
    vertices: [
      { x: 50, y: 340 },
      { x: 80, y: 80 },
      { x: 120, y: 260 },
      { x: 170, y: 80 },
      { x: 220, y: 260 },
      { x: 270, y: 80 },
      { x: 320, y: 260 },
      { x: 370, y: 80 },
      { x: 410, y: 260 },
      { x: 450, y: 340 },
    ],
  },
  {
    id: 'l-shaped',
    name: 'Phòng Chữ L (6 đỉnh)',
    description:
      'Đa giác không lồi cơ bản nhất: chỉ 1 người đặt ở góc ngoặt có thể quan sát toàn bộ phòng.',
    recommendedGuards: 1,
    vertices: [
      { x: 80, y: 80 },
      { x: 220, y: 80 },
      { x: 220, y: 220 },
      { x: 420, y: 220 },
      { x: 420, y: 360 },
      { x: 80, y: 360 },
    ],
  },
  {
    id: 'convex-hexagon',
    name: 'Phòng Lục Giác Lồi (6 đỉnh)',
    description:
      'Đa giác lồi: ⌊6/3⌋ = 2 theo định lý, nhưng trên thực tế chỉ cần duy nhất 1 người ở bất kỳ đâu.',
    recommendedGuards: 1,
    vertices: [
      { x: 250, y: 70 },
      { x: 410, y: 150 },
      { x: 410, y: 290 },
      { x: 250, y: 370 },
      { x: 90, y: 290 },
      { x: 90, y: 150 },
    ],
  },
  {
    id: 'zigzag-hallway',
    name: 'Hành Lang Zíc-Zắc (10 đỉnh)',
    description:
      'Các khúc ngoặt góc vuông tạo nhiều góc chết liên hoàn, kiểm tra độ phủ tầm nhìn tối ưu.',
    recommendedGuards: 3,
    vertices: [
      { x: 70, y: 80 },
      { x: 320, y: 80 },
      { x: 320, y: 170 },
      { x: 180, y: 170 },
      { x: 180, y: 260 },
      { x: 430, y: 260 },
      { x: 430, y: 360 },
      { x: 90, y: 360 },
      { x: 90, y: 220 },
      { x: 70, y: 220 },
    ],
  },
];

/**
 * Procedural Random Simple Polygon Generator.
 * Creates an n-vertex simple polygon (no self-intersections) with interesting concave alcoves.
 */
export function generateRandomPolygon(numVertices: number = 9): Point[] {
  const n = Math.max(4, Math.min(16, numVertices));
  const centerX = 250;
  const centerY = 220;
  const baseRadius = 140;

  // Generate sorted angles around center
  const angleSteps: number[] = [];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const step = 0.5 + Math.random() * 1.5;
    angleSteps.push(step);
    sum += step;
  }

  const angles: number[] = [];
  let currentAngle = Math.random() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    angles.push(currentAngle);
    currentAngle += (angleSteps[i]! / sum) * Math.PI * 2;
  }

  // Radii with alternating deep alcoves to ensure concave paradox behavior
  const vertices: Point[] = [];
  for (let i = 0; i < n; i++) {
    const isConcaveAlcove = i % 2 === 1 && Math.random() > 0.3;
    const rFactor = isConcaveAlcove ? 0.35 + Math.random() * 0.25 : 0.8 + Math.random() * 0.35;
    const r = baseRadius * rFactor;
    const a = angles[i]!;
    vertices.push({
      x: Math.round(centerX + r * Math.cos(a)),
      y: Math.round(centerY + r * Math.sin(a)),
    });
  }

  return ensureCCW(vertices);
}
