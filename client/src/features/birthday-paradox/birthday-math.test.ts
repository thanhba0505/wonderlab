import { describe, expect, it } from 'vitest';
import {
  calculateComparisonPairs,
  calculateTheoreticalProbability,
  dayOfYearToDate,
  runMonteCarloBatch,
  simulateRoom,
} from './birthday-math';

describe('Birthday Paradox Mathematical Engine', () => {
  describe('calculateTheoreticalProbability', () => {
    it('returns 0 for non-positive or single person rooms', () => {
      expect(calculateTheoreticalProbability(0)).toBe(0);
      expect(calculateTheoreticalProbability(1)).toBe(0);
    });

    it('calculates the classic 23-person inflection point (> 50%)', () => {
      const p23 = calculateTheoreticalProbability(23);
      // P(23) ≈ 0.5072972343
      expect(p23).toBeGreaterThan(0.506);
      expect(p23).toBeLessThan(0.508);
      expect(Math.round(p23 * 1000) / 10).toBe(50.7);
    });

    it('calculates probabilities for 50 and 70 people milestones', () => {
      const p50 = calculateTheoreticalProbability(50);
      const p70 = calculateTheoreticalProbability(70);

      // P(50) ≈ 0.9704 (97.0%)
      expect(p50).toBeGreaterThan(0.969);
      expect(p50).toBeLessThan(0.972);

      // P(70) ≈ 0.99916 (99.9%)
      expect(p70).toBeGreaterThan(0.999);
    });

    it('strictly satisfies the Pigeonhole Principle (Dirichlet) for n > 365', () => {
      expect(calculateTheoreticalProbability(366)).toBe(1);
      expect(calculateTheoreticalProbability(400)).toBe(1);
    });
  });

  describe('calculateComparisonPairs', () => {
    it('returns 0 for n < 2', () => {
      expect(calculateComparisonPairs(0)).toBe(0);
      expect(calculateComparisonPairs(1)).toBe(0);
    });

    it('calculates correct combinatoric pairs C(n, 2)', () => {
      expect(calculateComparisonPairs(2)).toBe(1);
      expect(calculateComparisonPairs(3)).toBe(3);
      expect(calculateComparisonPairs(23)).toBe(253);
      expect(calculateComparisonPairs(50)).toBe(1225);
    });
  });

  describe('dayOfYearToDate conversion', () => {
    it('maps boundaries and regular days correctly', () => {
      expect(dayOfYearToDate(1)).toEqual({
        month: 1,
        day: 1,
        dateString: '01 Th01',
      });
      expect(dayOfYearToDate(32)).toEqual({
        month: 2,
        day: 1,
        dateString: '01 Th02',
      });
      expect(dayOfYearToDate(365)).toEqual({
        month: 12,
        day: 31,
        dateString: '31 Th12',
      });
    });
  });

  describe('simulateRoom with deterministic sequence', () => {
    it('detects collisions when two people share the same day', () => {
      // Giả lập 3 người: người 1 (ngày 10), người 2 (ngày 20), người 3 (ngày 10)
      const mockDays = [10, 20, 10];
      let callCount = 0;
      const mockRng = () => (mockDays[callCount++] - 0.5) / 365;

      const result = simulateRoom(3, 365, mockRng);

      expect(result.people).toHaveLength(3);
      expect(result.hasCollision).toBe(true);
      expect(result.collisionPairs).toHaveLength(1);
      expect(result.collisionPairs[0].personAId).toBe(1);
      expect(result.collisionPairs[0].personBId).toBe(3);
      expect(result.sharedDates).toHaveLength(1);
      expect(result.sharedDates[0].count).toBe(2);
    });

    it('reports zero collisions when all birthdays are distinct', () => {
      const mockDays = [1, 2, 3, 4, 5];
      let callCount = 0;
      const mockRng = () => (mockDays[callCount++] - 0.5) / 365;

      const result = simulateRoom(5, 365, mockRng);

      expect(result.hasCollision).toBe(false);
      expect(result.collisionPairs).toHaveLength(0);
      expect(result.sharedDates).toHaveLength(0);
    });
  });

  describe('runMonteCarloBatch empirical convergence', () => {
    it('converges to theoretical probability within statistical tolerance', () => {
      // 5,000 mẫu ngẫu nhiên cho n = 23 (lý thuyết ~ 50.7%)
      const result = runMonteCarloBatch(23, 5000);

      expect(result.trials).toBe(5000);
      expect(result.theoreticalRate).toBeCloseTo(0.507, 2);
      // Kết quả thực nghiệm phải nằm trong khoảng sai số thống kê ± 3% (47% - 54%)
      expect(result.empiricalRate).toBeGreaterThan(0.47);
      expect(result.empiricalRate).toBeLessThan(0.54);
    });
  });
});
