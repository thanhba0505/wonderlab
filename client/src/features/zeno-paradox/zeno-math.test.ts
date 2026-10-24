import { describe, it, expect } from 'vitest';
import {
  calculateOvertakePoint,
  generateZenoSteps,
  calculateContinuousPosition,
  findPlanckStep,
  DEFAULT_ZENO_PARAMS,
  PLANCK_LENGTH,
} from './zeno-math';

describe('Zeno Paradox Mathematical Core', () => {
  describe('calculateOvertakePoint', () => {
    it('calculates correct analytical solution for default parameters (10 m/s vs 1 m/s, 100m head start)', () => {
      const res = calculateOvertakePoint(DEFAULT_ZENO_PARAMS);

      expect(res.isOvertakePossible).toBe(true);
      // T* = 100 / (10 - 1) = 100 / 9 ≈ 11.1111...
      expect(res.overtakeTime).toBeCloseTo(11.1111, 3);
      // X* = 10 * 11.1111... ≈ 111.1111...
      expect(res.overtakeDistance).toBeCloseTo(111.1111, 3);
      expect(res.speedRatio).toBeCloseTo(0.1, 4);
      expect(res.convergenceRate).toBeCloseTo(1 / 0.9, 4);
    });

    it('returns impossible when Achilles is slower than or equal to Tortoise', () => {
      const resEqual = calculateOvertakePoint({
        achillesSpeed: 5,
        tortoiseSpeed: 5,
        headStart: 50,
      });
      expect(resEqual.isOvertakePossible).toBe(false);
      expect(resEqual.overtakeTime).toBe(Infinity);

      const resSlower = calculateOvertakePoint({
        achillesSpeed: 4,
        tortoiseSpeed: 8,
        headStart: 50,
      });
      expect(resSlower.isOvertakePossible).toBe(false);
    });

    it('handles custom integer parameters cleanly', () => {
      const res = calculateOvertakePoint({
        achillesSpeed: 20,
        tortoiseSpeed: 10,
        headStart: 50,
      });
      expect(res.isOvertakePossible).toBe(true);
      expect(res.overtakeTime).toBe(5); // 50 / (20 - 10) = 5
      expect(res.overtakeDistance).toBe(100); // 20 * 5 = 100
      expect(res.speedRatio).toBe(0.5);
    });

    it('handles non-positive speeds or negative headstarts gracefully', () => {
      const resZero = calculateOvertakePoint({
        achillesSpeed: 0,
        tortoiseSpeed: 1,
        headStart: 100,
      });
      expect(resZero.isOvertakePossible).toBe(false);

      const resNegative = calculateOvertakePoint({
        achillesSpeed: 10,
        tortoiseSpeed: 1,
        headStart: -10,
      });
      expect(resNegative.isOvertakePossible).toBe(false);
    });
  });

  describe('generateZenoSteps', () => {
    it('generates accurate geometric progression of subdivision steps', () => {
      const steps = generateZenoSteps(DEFAULT_ZENO_PARAMS, 5);
      expect(steps.length).toBe(5);

      // Step 0: Achilles 0 -> 100, Tortoise 100 -> 110, deltaT = 10s
      expect(steps[0].step).toBe(0);
      expect(steps[0].achillesStart).toBe(0);
      expect(steps[0].achillesEnd).toBe(100);
      expect(steps[0].tortoiseStart).toBe(100);
      expect(steps[0].tortoiseEnd).toBe(110);
      expect(steps[0].deltaTime).toBe(10);
      expect(steps[0].cumulativeTime).toBe(10);
      expect(steps[0].remainingGap).toBe(10);

      // Step 1: Achilles 100 -> 110, Tortoise 110 -> 111, deltaT = 1s
      expect(steps[1].step).toBe(1);
      expect(steps[1].achillesStart).toBe(100);
      expect(steps[1].achillesEnd).toBe(110);
      expect(steps[1].tortoiseStart).toBe(110);
      expect(steps[1].tortoiseEnd).toBe(111);
      expect(steps[1].deltaTime).toBe(1);
      expect(steps[1].cumulativeTime).toBe(11);
      expect(steps[1].remainingGap).toBe(1);

      // Step 2: Achilles 110 -> 111, Tortoise 111 -> 111.1, deltaT = 0.1s
      expect(steps[2].step).toBe(2);
      expect(steps[2].deltaTime).toBeCloseTo(0.1, 4);
      expect(steps[2].cumulativeTime).toBeCloseTo(11.1, 4);
      expect(steps[2].remainingGap).toBeCloseTo(0.1, 4);
    });

    it('demonstrates asymptotic convergence towards theoretical overtake time (11.111s)', () => {
      const steps = generateZenoSteps(DEFAULT_ZENO_PARAMS, 12);
      const lastStep = steps[steps.length - 1];

      // Cumulative time converges to 100/9
      expect(lastStep.cumulativeTime).toBeCloseTo(11.1111, 4);
      expect(lastStep.fractionOfTotalTime).toBeCloseTo(100, 1);
      expect(lastStep.remainingGap).toBeLessThan(1e-9);
    });

    it('correctly flags Planck scale when gap reaches Planck length', () => {
      const steps = generateZenoSteps(DEFAULT_ZENO_PARAMS, 40);
      const planckSteps = steps.filter(s => s.isPlanckScale);
      expect(planckSteps.length).toBeGreaterThan(0);
      expect(planckSteps[0].remainingGap).toBeLessThanOrEqual(PLANCK_LENGTH);
    });
  });

  describe('calculateContinuousPosition', () => {
    it('returns initial positions at t = 0', () => {
      const pos = calculateContinuousPosition(0, DEFAULT_ZENO_PARAMS);
      expect(pos.achillesPos).toBe(0);
      expect(pos.tortoisePos).toBe(100);
      expect(pos.gap).toBe(100);
      expect(pos.isOvertaken).toBe(false);
    });

    it('tracks positions linearly before overtaking', () => {
      const pos = calculateContinuousPosition(5, DEFAULT_ZENO_PARAMS);
      expect(pos.achillesPos).toBe(50); // 10 * 5
      expect(pos.tortoisePos).toBe(105); // 100 + 1 * 5
      expect(pos.gap).toBe(55);
      expect(pos.isOvertaken).toBe(false);
    });

    it('flags overtake when Achilles passes the tortoise', () => {
      const pos = calculateContinuousPosition(12, DEFAULT_ZENO_PARAMS);
      expect(pos.achillesPos).toBe(120); // 10 * 12
      expect(pos.tortoisePos).toBe(112); // 100 + 1 * 12
      expect(pos.gap).toBe(0);
      expect(pos.isOvertaken).toBe(true);
    });
  });

  describe('findPlanckStep', () => {
    it('calculates the step index where physical continuity breaks down', () => {
      const n = findPlanckStep(DEFAULT_ZENO_PARAMS);
      expect(n).toBeGreaterThan(30);
      expect(n).toBeLessThan(45);

      // Verify that at step n, gap is indeed near Planck scale
      const r = 0.1;
      const gapAtN = 100 * Math.pow(r, n + 1);
      expect(gapAtN).toBeLessThanOrEqual(PLANCK_LENGTH);
    });

    it('returns Infinity when no overtake is possible', () => {
      expect(
        findPlanckStep({
          achillesSpeed: 5,
          tortoiseSpeed: 5,
          headStart: 100,
        }),
      ).toBe(Infinity);
    });
  });
});
