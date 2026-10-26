import { describe, it, expect } from 'vitest';
import {
  solveHatPuzzle,
  evaluateUserGuess,
  runMonteCarloSimulations,
  generateRandomHats,
  modPositive,
} from './hat-puzzle-math';

describe('Hat Puzzle Mathematical Engine (Bài toán Đội mũ & Bit Chẵn lẻ)', () => {
  describe('modPositive', () => {
    it('handles positive and negative numbers correctly', () => {
      expect(modPositive(5, 2)).toBe(1);
      expect(modPositive(4, 2)).toBe(0);
      expect(modPositive(-1, 2)).toBe(1);
      expect(modPositive(-2, 2)).toBe(0);
      expect(modPositive(-1, 3)).toBe(2);
      expect(modPositive(-4, 3)).toBe(2);
    });
  });

  describe('solveHatPuzzle with 2 colors', () => {
    it('guarantees 100% accuracy for all (N-1) non-sacrifice prisoners for 10 people', () => {
      // Test 20 random configurations of 10 people
      for (let test = 0; test < 20; test++) {
        const hats = generateRandomHats(10, 2);
        const result = solveHatPuzzle(hats, 2);

        expect(result.prisoners.length).toBe(10);
        expect(result.steps.length).toBe(10);

        // All prisoners from 1 to 9 (indices 0 to 8) MUST guess correctly
        for (let i = 0; i < 9; i++) {
          expect(result.prisoners[i]!.isCorrect).toBe(true);
          expect(result.prisoners[i]!.guessedColor).toBe(hats[i]);
        }

        // Total correct must be either 9 (if person 10 is wrong) or 10 (if person 10 happens to be right)
        expect(result.correctCount).toBeGreaterThanOrEqual(9);
        expect(result.survivalRate).toBeGreaterThanOrEqual(0.9);
      }
    });

    it('works correctly for specific edge case: all black hats [1, 1, ..., 1]', () => {
      const hats = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
      const result = solveHatPuzzle(hats, 2);

      // Person 10 sees 9 ones (sum = 9, 9 mod 2 = 1). So person 10 shouts 1.
      // Since person 10's actual hat is 1, person 10 also guesses right!
      expect(result.correctCount).toBe(10);
      expect(result.survivalRate).toBe(1.0);
      for (let i = 0; i < 10; i++) {
        expect(result.prisoners[i]!.isCorrect).toBe(true);
      }
    });

    it('works correctly for edge case: all white hats [0, 0, ..., 0]', () => {
      const hats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const result = solveHatPuzzle(hats, 2);

      expect(result.correctCount).toBe(10);
      expect(result.survivalRate).toBe(1.0);
    });

    it('works correctly when person N guesses incorrectly', () => {
      // 4 people: [1, 0, 1, 1]
      // Person 4 sees [1, 0, 1], sum = 2 = 0 mod 2. Shouts 0.
      // But person 4 actually wears 1. So person 4 is wrong, but 1..3 must be right.
      const hats = [1, 0, 1, 1];
      const result = solveHatPuzzle(hats, 2);

      expect(result.prisoners[3]!.isCorrect).toBe(false); // person 4
      expect(result.prisoners[0]!.isCorrect).toBe(true); // person 1
      expect(result.prisoners[1]!.isCorrect).toBe(true); // person 2
      expect(result.prisoners[2]!.isCorrect).toBe(true); // person 3
      expect(result.correctCount).toBe(3);
      expect(result.survivalRate).toBe(0.75);
    });
  });

  describe('solveHatPuzzle with 3 colors (Modulo 3)', () => {
    it('guarantees 100% accuracy for all (N-1) prisoners with 3 colors', () => {
      for (let test = 0; test < 15; test++) {
        const hats = generateRandomHats(6, 3);
        const result = solveHatPuzzle(hats, 3);

        expect(result.prisoners.length).toBe(6);
        // Persons 1 to 5 MUST guess correctly
        for (let i = 0; i < 5; i++) {
          expect(result.prisoners[i]!.isCorrect).toBe(true);
          expect(result.prisoners[i]!.guessedColor).toBe(hats[i]);
        }
        expect(result.correctCount).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('evaluateUserGuess (Role-play mode)', () => {
    it('correctly evaluates user guess when roleplaying as sacrifice person', () => {
      // [1, 0, 1] -> N=3. Person 3 sees [1, 0] -> sum = 1 mod 2.
      // Optimal shout is 1.
      const hats = [1, 0, 1];
      const evalOptimal = evaluateUserGuess(3, 1, hats, 2);
      expect(evalOptimal.optimalGuess).toBe(1);
      expect(evalOptimal.isCorrect).toBe(true);

      const evalSuboptimal = evaluateUserGuess(3, 0, hats, 2);
      expect(evalSuboptimal.isCorrect).toBe(false);
      expect(evalSuboptimal.optimalGuess).toBe(1);
    });

    it('correctly evaluates user guess when roleplaying at middle position', () => {
      // Hats: [1, 0, 1, 0] -> N=4.
      // User is at position 2 (hat is 0).
      const hats = [1, 0, 1, 0];
      const evalCorrect = evaluateUserGuess(2, 0, hats, 2);
      expect(evalCorrect.isCorrect).toBe(true);
      expect(evalCorrect.optimalGuess).toBe(0);

      const evalWrong = evaluateUserGuess(2, 1, hats, 2);
      expect(evalWrong.isCorrect).toBe(false);
      expect(evalWrong.optimalGuess).toBe(0);
    });
  });

  describe('runMonteCarloSimulations', () => {
    it('converges to expected theoretical accuracy over 1000 trials', () => {
      const summary = runMonteCarloSimulations(10, 2, 500);
      expect(summary.trials).toBe(500);
      // Non-sacrifice group must be 100% guaranteed
      expect(summary.guaranteedGroupAccuracy).toBe(1.0);
      // Sacrifice person accuracy should be around 0.50 (+/- 0.1)
      expect(summary.sacrificeAccuracy).toBeGreaterThan(0.35);
      expect(summary.sacrificeAccuracy).toBeLessThan(0.65);
      // Overall accuracy should be around 95% (+/- 2%)
      expect(summary.overallAccuracy).toBeGreaterThan(0.92);
      expect(summary.overallAccuracy).toBeLessThan(0.98);
    });
  });
});
