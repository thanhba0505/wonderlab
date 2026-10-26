/**
 * Core mathematical calculation engines for Monte Carlo simulations.
 * Pure functions shared across Web Workers, fallbacks, and test suites.
 */

export interface MontyHallChunkResult {
  switchPlays: number;
  switchWins: number;
  stayPlays: number;
  stayWins: number;
}

/**
 * Executes a chunk of Monty Hall Monte Carlo trials.
 * Simulates both switch and stay decisions under classic 3-door Monty Hall rules.
 */
export function runMontyHallChunk(trialsCount: number): MontyHallChunkResult {
  let switchPlays = 0;
  let switchWins = 0;
  let stayPlays = 0;
  let stayWins = 0;

  for (let i = 0; i < trialsCount; i++) {
    const carDoor = Math.floor(Math.random() * 3);
    const userPick = Math.floor(Math.random() * 3);
    const shouldSwitch = Math.random() < 0.5;

    // Classic Monty Hall invariant:
    // When switching, player wins if and only if initial pick was not the car.
    // When staying, player wins if and only if initial pick was the car.
    const won = shouldSwitch ? userPick !== carDoor : userPick === carDoor;

    if (shouldSwitch) {
      switchPlays++;
      if (won) switchWins++;
    } else {
      stayPlays++;
      if (won) stayWins++;
    }
  }

  return { switchPlays, switchWins, stayPlays, stayWins };
}

/**
 * Calculates exact theoretical probability for Birthday Paradox:
 * P(n) = 1 - ∏_{k=0}^{n-1} (365 - k) / 365
 */
export function calculateTheoreticalBirthdayProbability(
  n: number,
  daysInYear: number = 365,
): number {
  if (n <= 1) return 0;
  if (n > daysInYear) return 1;

  let pDistinct = 1.0;
  for (let k = 0; k < n; k++) {
    pDistinct *= (daysInYear - k) / daysInYear;
  }

  return Math.min(1, Math.max(0, 1.0 - pDistinct));
}

/**
 * Executes a chunk of Birthday Paradox Monte Carlo room simulations.
 * Uses Uint8Array lookup for maximum performance across large sample batches.
 */
export function runBirthdayChunk(n: number, trialsCount: number, daysInYear: number = 365): number {
  if (n <= 1) return 0;
  if (n > daysInYear) return trialsCount;

  let collisions = 0;
  const seen = new Uint8Array(daysInYear + 1);

  for (let t = 0; t < trialsCount; t++) {
    seen.fill(0);
    let hasMatch = false;

    for (let i = 0; i < n; i++) {
      const day = Math.floor(Math.random() * daysInYear) + 1;
      if (seen[day] === 1) {
        hasMatch = true;
        break;
      }
      seen[day] = 1;
    }

    if (hasMatch) {
      collisions++;
    }
  }

  return collisions;
}
