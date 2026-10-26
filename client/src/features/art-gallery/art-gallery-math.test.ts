import { describe, it, expect } from 'vitest';
import {
  calculatePolygonArea,
  ensureCCW,
  triangulatePolygon,
  computeFiskProof,
  computeVisibilityPolygon,
  calculateCoveragePercentage,
  generateRandomPolygon,
  GALLERY_PRESETS,
  Point,
} from './art-gallery-math';

describe('Art Gallery Mathematical Engine', () => {
  const square: Point[] = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];

  const lShaped: Point[] = [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 50 },
    { x: 100, y: 50 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];

  it('calculates polygon area correctly using Shoelace formula', () => {
    expect(calculatePolygonArea(square)).toBeCloseTo(10000);
    expect(calculatePolygonArea(lShaped)).toBeCloseTo(7500);
  });

  it('ensures counter-clockwise winding order', () => {
    const clockwiseSquare = [...square].reverse();
    const ccw = ensureCCW(clockwiseSquare);
    expect(calculatePolygonArea(ccw)).toBeCloseTo(10000);
  });

  it('triangulates an n-vertex polygon into exactly n - 2 triangles', () => {
    // 4-vertex square -> 2 triangles
    const squareTri = triangulatePolygon(square);
    expect(squareTri.triangles.length).toBe(2);
    expect(squareTri.diagonals.length).toBe(1);

    // 6-vertex L-shaped -> 4 triangles
    const lTri = triangulatePolygon(lShaped);
    expect(lTri.triangles.length).toBe(4);
    expect(lTri.diagonals.length).toBe(3);
  });

  it("proves Steve Fisk's 3-Coloring theorem and Chvátal upper bound", () => {
    // Test for all presets
    for (const preset of GALLERY_PRESETS) {
      const result = computeFiskProof(preset.vertices);
      const n = preset.vertices.length;

      expect(result.chvatalBound).toBe(Math.floor(n / 3));
      expect(result.guardVertexIndices.length).toBeLessThanOrEqual(result.chvatalBound);

      // Verify that every triangle contains 3 distinct colors
      for (const tri of result.triangles) {
        const c1 = result.vertexColors[tri[0]];
        const c2 = result.vertexColors[tri[1]];
        const c3 = result.vertexColors[tri[2]];

        expect(c1).toBeDefined();
        expect(c2).toBeDefined();
        expect(c3).toBeDefined();
        expect(c1).not.toBe(c2);
        expect(c2).not.toBe(c3);
        expect(c3).not.toBe(c1);
      }
    }
  });

  it('calculates visibility polygon and non-zero coverage', () => {
    const center: Point = { x: 50, y: 50 };
    const vis = computeVisibilityPolygon(center, square);
    expect(vis.points.length).toBeGreaterThanOrEqual(4);

    // A single guard in center of square covers 100%
    const coverage = calculateCoveragePercentage([center], square);
    expect(coverage).toBeGreaterThanOrEqual(95);
  });

  it('produces valid random polygons with n vertices', () => {
    const randPoly = generateRandomPolygon(8);
    expect(randPoly.length).toBe(8);
    expect(calculatePolygonArea(randPoly)).toBeGreaterThan(0);
  });
});
