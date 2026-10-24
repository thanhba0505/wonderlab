import { describe, it, expect } from 'vitest';
import {
  calculatePayoffs,
  decideMove,
  playMatch,
  runEvolutionGeneration,
  DEFAULT_POPULATION,
  DEFAULT_PAYOFFS,
} from './game-theory-math';

describe("Game Theory & Prisoner's Dilemma Mathematical Core", () => {
  describe('calculatePayoffs', () => {
    it('should award (3, 3) for mutual cooperation', () => {
      expect(calculatePayoffs('C', 'C')).toEqual([3, 3]);
    });

    it('should award (0, 5) when player 1 is sucker and player 2 defects', () => {
      expect(calculatePayoffs('C', 'D')).toEqual([0, 5]);
    });

    it('should award (5, 0) when player 1 defects and player 2 cooperates', () => {
      expect(calculatePayoffs('D', 'C')).toEqual([5, 0]);
    });

    it('should award (1, 1) for mutual defection', () => {
      expect(calculatePayoffs('D', 'D')).toEqual([1, 1]);
    });

    it('should obey mathematical conditions T > R > P > S and 2R > T + S', () => {
      const { T, R, P, S } = DEFAULT_PAYOFFS;
      expect(T).toBeGreaterThan(R);
      expect(R).toBeGreaterThan(P);
      expect(P).toBeGreaterThan(S);
      expect(2 * R).toBeGreaterThan(T + S);
    });
  });

  describe('decideMove strategy archetypes', () => {
    it('always_cooperate should never defect', () => {
      expect(decideMove('always_cooperate', [], [])).toBe('C');
      expect(decideMove('always_cooperate', ['C'], ['D'])).toBe('C');
      expect(decideMove('always_cooperate', ['C', 'C'], ['D', 'D'])).toBe('C');
    });

    it('always_defect should never cooperate', () => {
      expect(decideMove('always_defect', [], [])).toBe('D');
      expect(decideMove('always_defect', ['D'], ['C'])).toBe('D');
    });

    it('tit_for_tat should cooperate on round 1 and mirror previous opponent move', () => {
      // Round 1
      expect(decideMove('tit_for_tat', [], [])).toBe('C');
      // If opponent cooperated
      expect(decideMove('tit_for_tat', ['C'], ['C'])).toBe('C');
      // If opponent defected
      expect(decideMove('tit_for_tat', ['C'], ['D'])).toBe('D');
      // If opponent returns to cooperation
      expect(decideMove('tit_for_tat', ['C', 'D'], ['D', 'C'])).toBe('C');
    });

    it('grudger should cooperate until first betrayal then defect forever', () => {
      expect(decideMove('grudger', [], [])).toBe('C');
      expect(decideMove('grudger', ['C', 'C'], ['C', 'C'])).toBe('C');
      // First betrayal
      expect(decideMove('grudger', ['C', 'C', 'C'], ['C', 'C', 'D'])).toBe('D');
      // Even if opponent cooperates later, grudger never forgives
      expect(decideMove('grudger', ['C', 'C', 'C', 'D'], ['C', 'C', 'D', 'C'])).toBe('D');
    });

    it('pavlov (Win-Stay, Lose-Shift) should keep winning moves and switch losing moves', () => {
      expect(decideMove('pavlov', [], [])).toBe('C');
      // (C, C) = 3 points (Win) -> Stay C
      expect(decideMove('pavlov', ['C'], ['C'])).toBe('C');
      // (C, D) = 0 points (Lose) -> Shift to D
      expect(decideMove('pavlov', ['C'], ['D'])).toBe('D');
      // (D, C) = 5 points (Win) -> Stay D
      expect(decideMove('pavlov', ['D'], ['C'])).toBe('D');
      // (D, D) = 1 points (Lose) -> Shift to C
      expect(decideMove('pavlov', ['D'], ['D'])).toBe('C');
    });
  });

  describe('playMatch', () => {
    it('tit_for_tat vs always_cooperate should achieve continuous mutual cooperation', () => {
      const match = playMatch('tit_for_tat', 'always_cooperate', 10);
      expect(match.totalScore1).toBe(30); // 10 * 3
      expect(match.totalScore2).toBe(30);
      expect(match.cooperationRate1).toBe(1.0);
      expect(match.cooperationRate2).toBe(1.0);
    });

    it('tit_for_tat vs always_defect should minimize losses by retaliating immediately', () => {
      const match = playMatch('tit_for_tat', 'always_defect', 10);
      // Round 1: C vs D -> 0 vs 5
      // Rounds 2-10 (9 rounds): D vs D -> 1 vs 1 (9 points)
      expect(match.totalScore1).toBe(9); // 0 + 9*1
      expect(match.totalScore2).toBe(14); // 5 + 9*1
      expect(match.cooperationRate1).toBe(0.1); // only round 1
      expect(match.cooperationRate2).toBe(0.0);
    });

    it('always_defect vs always_defect should result in mutual punishment lock', () => {
      const match = playMatch('always_defect', 'always_defect', 10);
      expect(match.totalScore1).toBe(10); // 10 * 1
      expect(match.totalScore2).toBe(10);
    });
  });

  describe('runEvolutionGeneration (Replicator Dynamics)', () => {
    it('should maintain the total population size of 100', () => {
      const { nextPop } = runEvolutionGeneration(DEFAULT_POPULATION, 10, 0);
      const totalNext = Object.values(nextPop).reduce((a, b) => a + b, 0);
      expect(totalNext).toBe(100);
    });

    it('should compute non-negative fitness for all active strategies', () => {
      const { fitnessMap } = runEvolutionGeneration(DEFAULT_POPULATION, 10, 0);
      expect(fitnessMap.tit_for_tat).toBeGreaterThan(0);
      expect(fitnessMap.always_defect).toBeGreaterThan(0);
    });
  });
});
