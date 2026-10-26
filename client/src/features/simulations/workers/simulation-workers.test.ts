import { describe, expect, it } from 'vitest';
import {
  calculateTheoreticalBirthdayProbability,
  runBirthdayChunk,
  runMontyHallChunk,
} from './simulation-engines';

describe('Monte Carlo Simulation Engines', () => {
  describe('runMontyHallChunk', () => {
    it('accurately distributes plays and preserves total trial count', () => {
      const trials = 5000;
      const result = runMontyHallChunk(trials);

      expect(result.switchPlays + result.stayPlays).toBe(trials);
      expect(result.switchWins).toBeLessThanOrEqual(result.switchPlays);
      expect(result.stayWins).toBeLessThanOrEqual(result.stayPlays);
      expect(result.switchWins).toBeGreaterThanOrEqual(0);
      expect(result.stayWins).toBeGreaterThanOrEqual(0);
    });

    it('demonstrates Law of Large Numbers convergence to ~66.7% switch and ~33.3% stay', () => {
      const trials = 30000;
      const result = runMontyHallChunk(trials);

      const switchWinRate = result.switchWins / result.switchPlays;
      const stayWinRate = result.stayWins / result.stayPlays;

      // 66.7% ± 2.5% tolerance for 15,000 switch trials
      expect(switchWinRate).toBeGreaterThan(0.64);
      expect(switchWinRate).toBeLessThan(0.69);

      // 33.3% ± 2.5% tolerance for 15,000 stay trials
      expect(stayWinRate).toBeGreaterThan(0.31);
      expect(stayWinRate).toBeLessThan(0.36);
    });
  });

  describe('runBirthdayChunk', () => {
    it('returns 0 collisions for group size <= 1', () => {
      expect(runBirthdayChunk(0, 500)).toBe(0);
      expect(runBirthdayChunk(1, 500)).toBe(0);
    });

    it('returns 100% collisions when group size exceeds 365 (Pigeonhole principle)', () => {
      expect(runBirthdayChunk(366, 100)).toBe(100);
      expect(runBirthdayChunk(400, 100)).toBe(100);
    });

    it('converges to theoretical 50.7% for n = 23 across 10,000 rooms', () => {
      const trials = 10000;
      const collisions = runBirthdayChunk(23, trials);
      const empiricalRate = collisions / trials;

      // 50.7% ± 2% tolerance
      expect(empiricalRate).toBeGreaterThan(0.48);
      expect(empiricalRate).toBeLessThan(0.53);
    });

    it('converges to > 99% for n = 70 rooms', () => {
      const trials = 2000;
      const collisions = runBirthdayChunk(70, trials);
      const empiricalRate = collisions / trials;

      expect(empiricalRate).toBeGreaterThan(0.99);
    });
  });

  describe('calculateTheoreticalBirthdayProbability', () => {
    it('returns 0 for n <= 1', () => {
      expect(calculateTheoreticalBirthdayProbability(0)).toBe(0);
      expect(calculateTheoreticalBirthdayProbability(1)).toBe(0);
    });

    it('returns exact probability for critical milestones', () => {
      const p23 = calculateTheoreticalBirthdayProbability(23);
      expect(Math.round(p23 * 1000) / 10).toBe(50.7);

      const p50 = calculateTheoreticalBirthdayProbability(50);
      expect(Math.round(p50 * 1000) / 10).toBe(97.0);

      const p70 = calculateTheoreticalBirthdayProbability(70);
      expect(p70).toBeGreaterThan(0.999);
    });
  });
});
