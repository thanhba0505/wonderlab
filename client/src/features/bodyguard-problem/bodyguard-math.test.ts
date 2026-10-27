import { describe, it, expect } from 'vitest';
import {
  foldToUnit,
  calculateBodyguardPoints,
  calculateUnfoldedRays,
  traceRay,
  simulateTargetedRicochets,
  simulateRaySweep,
  BODYGUARD_PRESETS,
  Point,
} from './bodyguard-math';

describe('Bodyguard Mathematical Engine (Eugene Gutkin 2005)', () => {
  describe('foldToUnit (Mirror Reflection Modulo 2)', () => {
    it('maps values inside [0, 1] identically', () => {
      expect(foldToUnit(0)).toBeCloseTo(0);
      expect(foldToUnit(0.35)).toBeCloseTo(0.35);
      expect(foldToUnit(1)).toBeCloseTo(1);
    });

    it('correctly reflects values across boundary x = 1', () => {
      expect(foldToUnit(1.2)).toBeCloseTo(0.8);
      expect(foldToUnit(1.5)).toBeCloseTo(0.5);
      expect(foldToUnit(1.9)).toBeCloseTo(0.1);
      expect(foldToUnit(2.0)).toBeCloseTo(0.0);
    });

    it('correctly reflects negative values across boundary x = 0', () => {
      expect(foldToUnit(-0.2)).toBeCloseTo(0.2);
      expect(foldToUnit(-0.7)).toBeCloseTo(0.7);
      expect(foldToUnit(-1.0)).toBeCloseTo(1.0);
      expect(foldToUnit(-1.3)).toBeCloseTo(0.7);
    });

    it('has period 2', () => {
      expect(foldToUnit(2.35)).toBeCloseTo(0.35);
      expect(foldToUnit(4.35)).toBeCloseTo(0.35);
      expect(foldToUnit(-2.35)).toBeCloseTo(0.35);
    });
  });

  describe('calculateBodyguardPoints (16-Point Upper Bound Theorem)', () => {
    it('produces exactly 16 distinct guard points in generic asymmetric configuration', () => {
      const generic = BODYGUARD_PRESETS.find(p => p.id === 'generic')!;
      const guards = calculateBodyguardPoints(generic.source, generic.target);

      expect(guards.length).toBe(16);
      // All points must lie strictly inside [0, 1] x [0, 1]
      for (const pt of guards) {
        expect(pt.x).toBeGreaterThanOrEqual(0);
        expect(pt.x).toBeLessThanOrEqual(1);
        expect(pt.y).toBeGreaterThanOrEqual(0);
        expect(pt.y).toBeLessThanOrEqual(1);
      }
    });

    it('reduces to 9 points under vertical bilateral symmetry (x = 0.5)', () => {
      const symm = BODYGUARD_PRESETS.find(p => p.id === 'symmetric-vertical')!;
      const guards = calculateBodyguardPoints(symm.source, symm.target);

      expect(guards.length).toBe(9);
    });

    it('reduces under diagonal and center symmetries', () => {
      const diagonal = BODYGUARD_PRESETS.find(p => p.id === 'diagonal-symmetry')!;
      const diagGuards = calculateBodyguardPoints(diagonal.source, diagonal.target);
      expect(diagGuards.length).toBeLessThan(16);

      const center = BODYGUARD_PRESETS.find(p => p.id === 'center-axis')!;
      const centerGuards = calculateBodyguardPoints(center.source, center.target);
      expect(centerGuards.length).toBe(12);
    });
  });

  describe('Ray Tracing and Finite Blocking Property', () => {
    const source: Point = { x: 0.2, y: 0.3 };
    const target: Point = { x: 0.7, y: 0.6 };
    const guards = calculateBodyguardPoints(source, target);

    it('blocks targeted rays when bodyguards are active', () => {
      // Find rays aimed at unfolded images of target
      const unfoldedRays = calculateUnfoldedRays(source, target, 1);
      expect(unfoldedRays.length).toBeGreaterThan(0);

      // Pick the direct line-of-sight ray to the target
      const directRayInfo = unfoldedRays.find(
        r => r.signX === 1 && r.signY === 1 && r.parityX === 0 && r.parityY === 0,
      );
      expect(directRayInfo).toBeDefined();

      if (directRayInfo) {
        // Without guards: ray reaches target
        const resWithoutGuards = traceRay(source, directRayInfo.direction, target, [], 10, 0.02);
        expect(resWithoutGuards.hitTarget).toBe(true);
        expect(resWithoutGuards.blockedByGuard).toBe(false);

        // With guards: ray is intercepted by the bodyguard before reaching target
        const resWithGuards = traceRay(source, directRayInfo.direction, target, guards, 10, 0.02);
        expect(resWithGuards.blockedByGuard).toBe(true);
        expect(resWithGuards.hitTarget).toBe(false);
      }
    });

    it('achieves 100% protection rate on all targeted ricochets when guards are active', () => {
      const simWithGuards = simulateTargetedRicochets(source, target, guards, 20, 0.025);
      expect(simWithGuards.hitCount).toBe(0);
      expect(simWithGuards.protectionRate).toBe(100);

      const simWithoutGuards = simulateTargetedRicochets(source, target, [], 20, 0.025);
      expect(simWithoutGuards.hitCount).toBeGreaterThan(0);
      expect(simWithoutGuards.protectionRate).toBe(0);
    });

    it('runs 360-degree sweep without errors', () => {
      const sweep = simulateRaySweep(source, target, guards, 36, 15, 0.02);
      expect(sweep.rays.length).toBe(36);
      expect(sweep.raysBlocked).toBeGreaterThan(0);
      expect(sweep.raysTargetHit).toBe(0);
      expect(sweep.protectionRate).toBe(100);
    });
  });
});
