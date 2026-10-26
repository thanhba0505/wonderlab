/**
 * Mathematical Engine for The Prisoners and Hats Riddle (Bài toán Đội mũ & Bit Chẵn lẻ)
 *
 * Implements:
 * 1. Parity Checksum (Z_2) for 2 colors: guarantees at least (N-1)/N survival.
 * 2. Modulo-K Checksum (Z_K) for K colors: generalized parity for arbitrary colors.
 * 3. Step-by-step deduction traces for educational animation.
 * 4. Interactive user role-play validator & hint generator.
 * 5. High-throughput Monte Carlo simulation for statistical convergence.
 */

export type HatColorId = 0 | 1 | 2;

export interface ColorMeta {
  id: HatColorId;
  label: string;
  shortLabel: string;
  bgHex: string;
  textHex: string;
  badgeClass: string;
}

export const TWO_COLORS_PALETTE: ColorMeta[] = [
  {
    id: 0,
    label: 'Trắng',
    shortLabel: '0 (Trắng)',
    bgHex: '#ffffff',
    textHex: '#0f172a',
    badgeClass: 'bg-white text-slate-800 border-slate-300 shadow-xs',
  },
  {
    id: 1,
    label: 'Đen',
    shortLabel: '1 (Đen)',
    bgHex: '#0f172a',
    textHex: '#ffffff',
    badgeClass: 'bg-slate-900 text-white border-slate-800 shadow-xs',
  },
];

export const THREE_COLORS_PALETTE: ColorMeta[] = [
  {
    id: 0,
    label: 'Đỏ',
    shortLabel: '0 (Đỏ)',
    bgHex: '#ef4444',
    textHex: '#ffffff',
    badgeClass: 'bg-rose-500 text-white border-rose-600 shadow-xs',
  },
  {
    id: 1,
    label: 'Xanh dương',
    shortLabel: '1 (Xanh)',
    bgHex: '#3b82f6',
    textHex: '#ffffff',
    badgeClass: 'bg-blue-600 text-white border-blue-700 shadow-xs',
  },
  {
    id: 2,
    label: 'Vàng',
    shortLabel: '2 (Vàng)',
    bgHex: '#eab308',
    textHex: '#0f172a',
    badgeClass: 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs',
  },
];

export function getPalette(colorCount: 2 | 3): ColorMeta[] {
  return colorCount === 2 ? TWO_COLORS_PALETTE : THREE_COLORS_PALETTE;
}

export function getColorMeta(colorId: number, colorCount: 2 | 3): ColorMeta {
  const palette = getPalette(colorCount);
  const found = palette.find(c => c.id === colorId);
  return (
    found ??
    palette[0] ?? {
      id: 0 as HatColorId,
      label: 'Màu 0',
      shortLabel: '0',
      bgHex: '#ffffff',
      textHex: '#000000',
      badgeClass: 'bg-white text-slate-800',
    }
  );
}

export interface PrisonerState {
  id: number; // 1 to N (1 = front of line, N = back of line)
  actualColor: number;
  guessedColor: number | null;
  isCorrect: boolean | null;
  spokenTurnOrder: number; // 1 = person N speaks first, N = person 1 speaks last
  isSacrifice: boolean; // true for person N
  reasoning: string;
}

export interface SimulationStep {
  stepIndex: number; // 0 to N-1
  prisonerId: number; // Who is speaking (N down to 1)
  spokenColor: number;
  isCorrect: boolean;
  seenSumAhead: number; // sum of colors seen ahead mod K
  runningParity: number; // current parity balance before this turn
  reasoning: string;
  formulaString: string;
}

export interface SimulationSolveResult {
  actualHats: number[];
  colorCount: 2 | 3;
  steps: SimulationStep[];
  prisoners: PrisonerState[];
  correctCount: number;
  totalPrisoners: number;
  survivalRate: number; // e.g. 0.9 or 1.0
  sacrificeGuessedRight: boolean;
}

/**
 * Generate random hat configuration
 */
export function generateRandomHats(n: number, colorCount: 2 | 3): number[] {
  const clampedN = Math.max(2, Math.min(10, Math.floor(n)));
  const hats: number[] = [];
  for (let i = 0; i < clampedN; i++) {
    hats.push(Math.floor(Math.random() * colorCount));
  }
  return hats;
}

/**
 * Helper to compute positive modulo
 */
export function modPositive(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Solve the hat puzzle deterministically using Parity Checksum (mod K).
 *
 * Line convention:
 * Index 0: Person 1 (front of the line, sees no one ahead).
 * Index N-1: Person N (back of the line, sees people 1 to N-1).
 * Speaking order: Person N (index N-1) speaks first, down to Person 1 (index 0).
 */
export function solveHatPuzzle(actualHats: number[], colorCount: 2 | 3 = 2): SimulationSolveResult {
  const n = actualHats.length;
  if (n < 2) {
    throw new Error('Số lượng người tham gia tối thiểu phải từ 2 người trở lên.');
  }

  const palette = getPalette(colorCount);
  const steps: SimulationStep[] = [];
  const prisoners: PrisonerState[] = actualHats.map((color, idx) => ({
    id: idx + 1,
    actualColor: color,
    guessedColor: null,
    isCorrect: null,
    spokenTurnOrder: n - idx,
    isSacrifice: idx === n - 1,
    reasoning: '',
  }));

  // Step 1: Person N (back of line, index n - 1)
  // Person N sums all hats seen in front (index 0 to n - 2) modulo K
  let seenSumByN = 0;
  for (let i = 0; i < n - 1; i++) {
    seenSumByN += actualHats[i] ?? 0;
  }
  const initialParity = modPositive(seenSumByN, colorCount);
  const personN = prisoners[n - 1]!;
  personN.guessedColor = initialParity;
  personN.isCorrect = personN.guessedColor === personN.actualColor;
  personN.reasoning =
    colorCount === 2
      ? `Người số ${n} (cuối hàng) nhìn thấy ${seenSumByN} mũ Đen phía trước (tổng ${initialParity === 0 ? 'Chẵn' : 'Lẻ'}). Hô "${palette[initialParity]!.label}" để phát tín hiệu Parity cho 9 người còn lại.`
      : `Người số ${n} tính tổng ${seenSumByN} màu nhìn thấy mod 3 = ${initialParity}. Hô "${palette[initialParity]!.label}" để phát mã checksum mod 3.`;

  steps.push({
    stepIndex: 0,
    prisonerId: n,
    spokenColor: initialParity,
    isCorrect: personN.isCorrect,
    seenSumAhead: initialParity,
    runningParity: initialParity,
    reasoning: personN.reasoning,
    formulaString:
      colorCount === 2
        ? `\\sum_{i=1}^{${n - 1}} c_i \\equiv ${seenSumByN} \\equiv ${initialParity} \\pmod 2`
        : `\\sum_{i=1}^{${n - 1}} c_i \\equiv ${seenSumByN} \\equiv ${initialParity} \\pmod 3`,
  });

  // Step 2: Persons (n - 2) down to 0
  let runningParity = initialParity;

  for (let k = n - 2; k >= 0; k--) {
    const prisoner = prisoners[k]!;
    // Sum what prisoner k sees ahead (index 0 to k - 1)
    let seenSumAhead = 0;
    for (let j = 0; j < k; j++) {
      seenSumAhead += actualHats[j] ?? 0;
    }
    const seenSumMod = modPositive(seenSumAhead, colorCount);

    // Deduced color = (runningParity - seenSumAhead) mod K
    const deducedColor = modPositive(runningParity - seenSumMod, colorCount);
    prisoner.guessedColor = deducedColor;
    prisoner.isCorrect = prisoner.guessedColor === prisoner.actualColor;

    const myColorLabel = palette[deducedColor]!.label;
    prisoner.reasoning =
      colorCount === 2
        ? `Người số ${k + 1} thấy ${seenSumAhead} mũ Đen phía trước (mod 2 = ${seenSumMod}), Parity kỳ vọng là ${runningParity}. Hiệu: (${runningParity} - ${seenSumMod}) mod 2 = ${deducedColor} => Mũ của tôi chắc chắn là "${myColorLabel}".`
        : `Người số ${k + 1} thấy tổng phía trước mod 3 = ${seenSumMod}. Tính: (${runningParity} - ${seenSumMod}) mod 3 = ${deducedColor} => Hô "${myColorLabel}".`;

    steps.push({
      stepIndex: steps.length,
      prisonerId: k + 1,
      spokenColor: deducedColor,
      isCorrect: prisoner.isCorrect,
      seenSumAhead: seenSumMod,
      runningParity,
      reasoning: prisoner.reasoning,
      formulaString: `c_{${k + 1}} = (${runningParity} - ${seenSumMod}) \\equiv ${deducedColor} \\pmod{${colorCount}}`,
    });

    // Update running parity for the next person:
    // runningParity = (runningParity - deducedColor) mod K
    runningParity = modPositive(runningParity - deducedColor, colorCount);
  }

  const correctCount = prisoners.filter(p => p.isCorrect === true).length;
  const survivalRate = correctCount / n;

  return {
    actualHats,
    colorCount,
    steps,
    prisoners,
    correctCount,
    totalPrisoners: n,
    survivalRate,
    sacrificeGuessedRight: personN.isCorrect ?? false,
  };
}

export interface UserEvaluationResult {
  isCorrect: boolean;
  optimalGuess: number;
  optimalLabel: string;
  userGuessLabel: string;
  explanation: string;
  seenSumAhead: number;
  runningParity: number;
}

/**
 * Evaluates the user's guess when role-playing as prisoner at `position` (1-based, 1 = front, n = back).
 * `actualHats`: array of hat colors [hat_0 (person 1), ..., hat_{n-1} (person n)]
 * `spokenHistory`: history of answers spoken by persons who already went (from person n down to position + 1)
 */
export function evaluateUserGuess(
  position: number, // 1 to n
  userGuess: number,
  actualHats: number[],
  colorCount: 2 | 3 = 2,
): UserEvaluationResult {
  const n = actualHats.length;
  const palette = getPalette(colorCount);
  const userIndex = position - 1;
  const actualColor = actualHats[userIndex] ?? 0;
  const isCorrect = userGuess === actualColor;

  // Let's compute what the optimal deduction would be:
  let optimalGuess = 0;
  let seenSumAhead = 0;
  let runningParity = 0;

  if (position === n) {
    // User is the sacrifice person
    for (let i = 0; i < n - 1; i++) {
      seenSumAhead += actualHats[i] ?? 0;
    }
    optimalGuess = modPositive(seenSumAhead, colorCount);
    runningParity = optimalGuess;
  } else {
    // User is at position 1 to n - 1
    // First, run full solver to see what running parity and deduction should be
    const solution = solveHatPuzzle(actualHats, colorCount);
    const step = solution.steps.find(s => s.prisonerId === position);
    if (step) {
      optimalGuess = step.spokenColor;
      seenSumAhead = step.seenSumAhead;
      runningParity = step.runningParity;
    }
  }

  const optimalLabel = palette[optimalGuess]?.label ?? String(optimalGuess);
  const userGuessLabel = palette[userGuess]?.label ?? String(userGuess);

  let explanation = '';
  if (position === n) {
    if (userGuess === optimalGuess) {
      explanation = `Tuyệt vời! Bạn là người hy sinh ở vị trí số ${n}. Bạn đã đếm đúng tổng phía trước (${seenSumAhead}) và phát tín hiệu "${userGuessLabel}" chuẩn xác cho đồng đội. ${isCorrect ? 'Và bạn cũng cực kỳ may mắn đoán trúng luôn mũ của mình!' : 'Dù mũ bạn không trùng màu, 9 đồng đội còn lại sẽ chắc chắn được cứu!'}`;
    } else {
      explanation = `Bạn đã hô "${userGuessLabel}", nhưng tổng ${colorCount === 2 ? 'số mũ Đen' : 'màu'} nhìn thấy phía trước là ${seenSumAhead} (mod ${colorCount} = ${optimalGuess} - "${optimalLabel}"). Nếu bạn hô sai tín hiệu, tất cả đồng đội phía trước có thể bị ảnh hưởng dây chuyền!`;
    }
  } else {
    if (isCorrect) {
      explanation = `Chính xác 100%! Bạn đã phối hợp tín hiệu từ những người phía sau và số lượng mũ phía trước để suy luận chuẩn xác mình đang đội mũ "${optimalLabel}".`;
    } else {
      explanation = `Rất tiếc! Mũ của bạn thực tế là "${optimalLabel}". Dựa vào tín hiệu Parity còn lại (${runningParity}) trừ đi tổng số mũ phía trước (${seenSumAhead} mod ${colorCount}), kết quả chính xác phải là (${runningParity} - ${seenSumAhead}) mod ${colorCount} = ${optimalGuess} ("${optimalLabel}").`;
    }
  }

  return {
    isCorrect,
    optimalGuess,
    optimalLabel,
    userGuessLabel,
    explanation,
    seenSumAhead,
    runningParity,
  };
}

/**
 * Monte Carlo Simulation Engine
 */
export interface MonteCarloSummary {
  trials: number;
  totalPrisoners: number;
  n: number;
  colorCount: 2 | 3;
  totalCorrect: number;
  overallAccuracy: number; // e.g. 0.95
  sacrificeCorrectCount: number;
  sacrificeAccuracy: number; // should be ~ 0.50 (for 2 colors) or ~ 0.33 (for 3 colors)
  guaranteedGroupCorrectCount: number;
  guaranteedGroupAccuracy: number; // should be exactly 1.0 (100%)
  expectedTheoreticalAccuracy: number; // ((n - 1) + 1/K) / n
}

export function runMonteCarloSimulations(
  n: number,
  colorCount: 2 | 3,
  trials = 1000,
): MonteCarloSummary {
  let totalCorrect = 0;
  let sacrificeCorrect = 0;
  let guaranteedCorrect = 0;
  const clampedTrials = Math.max(10, Math.min(10000, trials));

  for (let t = 0; t < clampedTrials; t++) {
    const hats = generateRandomHats(n, colorCount);
    const result = solveHatPuzzle(hats, colorCount);

    totalCorrect += result.correctCount;
    if (result.sacrificeGuessedRight) {
      sacrificeCorrect++;
    }
    // The guaranteed group is the remaining (n - 1) people
    guaranteedCorrect += result.correctCount - (result.sacrificeGuessedRight ? 1 : 0);
  }

  const totalPrisoners = clampedTrials * n;
  const guaranteedTotal = clampedTrials * (n - 1);
  const overallAccuracy = totalCorrect / totalPrisoners;
  const sacrificeAccuracy = sacrificeCorrect / clampedTrials;
  const guaranteedGroupAccuracy = guaranteedTotal > 0 ? guaranteedCorrect / guaranteedTotal : 1;
  const expectedTheoreticalAccuracy = (n - 1 + 1 / colorCount) / n;

  return {
    trials: clampedTrials,
    totalPrisoners,
    n,
    colorCount,
    totalCorrect,
    overallAccuracy,
    sacrificeCorrectCount: sacrificeCorrect,
    sacrificeAccuracy,
    guaranteedGroupCorrectCount: guaranteedCorrect,
    guaranteedGroupAccuracy,
    expectedTheoreticalAccuracy,
  };
}
