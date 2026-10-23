import { describe, it, expect } from 'vitest';

/**
 * Pure helper function implementing the Monty Hall host logic for verification
 */
export function simulateMontyHallRound(
  carDoor: number,
  userPick: number,
  shouldSwitch: boolean,
): boolean {
  // Host must open a goat door that is neither the car nor the user's pick
  const possibleGoats = [0, 1, 2].filter(d => d !== carDoor && d !== userPick);
  const hostDoor = possibleGoats[0]!;

  const finalDoor = shouldSwitch
    ? [0, 1, 2].find(d => d !== userPick && d !== hostDoor)!
    : userPick;

  return finalDoor === carDoor;
}

describe('Monty Hall Paradox Logic', () => {
  it('wins when staying only if initial choice was correct (1/3 case)', () => {
    // Car at 0, user picks 0 -> stay wins
    expect(simulateMontyHallRound(0, 0, false)).toBe(true);
    // Car at 0, user picks 1 -> stay loses
    expect(simulateMontyHallRound(0, 1, false)).toBe(false);
    // Car at 0, user picks 2 -> stay loses
    expect(simulateMontyHallRound(0, 2, false)).toBe(false);
  });

  it('wins when switching whenever initial choice was a goat (2/3 cases)', () => {
    // Car at 0, user picks 0 -> switch loses
    expect(simulateMontyHallRound(0, 0, true)).toBe(false);
    // Car at 0, user picks 1 -> switch wins
    expect(simulateMontyHallRound(0, 1, true)).toBe(true);
    // Car at 0, user picks 2 -> switch wins
    expect(simulateMontyHallRound(0, 2, true)).toBe(true);
  });

  it('demonstrates ~66.7% win rate for switching over 3,000 trials', () => {
    let switchWins = 0;
    const trials = 3000;

    for (let i = 0; i < trials; i++) {
      const car = Math.floor(Math.random() * 3);
      const pick = Math.floor(Math.random() * 3);
      if (simulateMontyHallRound(car, pick, true)) {
        switchWins++;
      }
    }

    const winRate = switchWins / trials;
    // Expected rate is 2/3 ≈ 0.6667. Check with confidence interval ±0.05
    expect(winRate).toBeGreaterThan(0.61);
    expect(winRate).toBeLessThan(0.72);
  });
});
