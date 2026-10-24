/**
 * Calculus & Zeno's Paradox Mathematical Core
 * Wonderlab Scientific Platform
 */

export interface ZenoParameters {
  achillesSpeed: number; // m/s (v_A)
  tortoiseSpeed: number; // m/s (v_T)
  headStart: number; // meters (d_0)
  stepLimit?: number; // Maximum number of Zeno subdivisions
}

export const DEFAULT_ZENO_PARAMS: ZenoParameters = {
  achillesSpeed: 10,
  tortoiseSpeed: 1,
  headStart: 100,
  stepLimit: 15,
};

// Physics fundamental constants
export const PLANCK_LENGTH = 1.616255e-35; // meters
export const PLANCK_TIME = 5.391247e-44; // seconds

export interface OvertakeAnalyticalSolution {
  isOvertakePossible: boolean;
  overtakeTime: number; // Seconds (T*)
  overtakeDistance: number; // Meters (X*)
  speedRatio: number; // r = v_T / v_A
  convergenceRate: number; // 1 / (1 - r)
}

/**
 * Tính nghiệm giải tích của điểm bắt kịp theo Cơ học Cổ điển và Vi tích phân
 */
export function calculateOvertakePoint(
  params: ZenoParameters = DEFAULT_ZENO_PARAMS,
): OvertakeAnalyticalSolution {
  const { achillesSpeed: vA, tortoiseSpeed: vT, headStart: d0 } = params;

  if (vA <= 0 || d0 < 0) {
    return {
      isOvertakePossible: false,
      overtakeTime: 0,
      overtakeDistance: 0,
      speedRatio: 0,
      convergenceRate: 1,
    };
  }

  const speedRatio = vT / vA;

  if (vA <= vT) {
    return {
      isOvertakePossible: false,
      overtakeTime: Infinity,
      overtakeDistance: Infinity,
      speedRatio,
      convergenceRate: Infinity,
    };
  }

  // T* = d_0 / (v_A - v_T)
  const overtakeTime = d0 / (vA - vT);
  const overtakeDistance = vA * overtakeTime;
  const convergenceRate = 1 / (1 - speedRatio);

  return {
    isOvertakePossible: true,
    overtakeTime,
    overtakeDistance,
    speedRatio,
    convergenceRate,
  };
}

export interface ZenoStep {
  step: number; // n = 0, 1, 2, ...
  timeStart: number; // s
  timeEnd: number; // s
  deltaTime: number; // s
  cumulativeTime: number; // s
  achillesStart: number; // m
  achillesEnd: number; // m
  tortoiseStart: number; // m
  tortoiseEnd: number; // m
  remainingGap: number; // m
  fractionOfTotalTime: number; // %
  isPlanckScale: boolean; // Khoảng cách nhỏ hơn độ dài Planck
}

/**
 * Sinh danh sách các bước phân chia Zeno (Dichotomy Steps)
 */
export function generateZenoSteps(
  params: ZenoParameters = DEFAULT_ZENO_PARAMS,
  maxSteps: number = 15,
): ZenoStep[] {
  const { achillesSpeed: vA, tortoiseSpeed: vT, headStart: d0 } = params;
  const analytical = calculateOvertakePoint(params);

  if (!analytical.isOvertakePossible) {
    return [];
  }

  const steps: ZenoStep[] = [];
  let currentAchillesPos = 0;
  let currentTortoisePos = d0;
  let cumulativeTime = 0;

  for (let n = 0; n < maxSteps; n++) {
    const timeStart = cumulativeTime;
    const achillesStart = currentAchillesPos;
    const tortoiseStart = currentTortoisePos;

    // Achilles chạy tới vị trí hiện tại của Rùa
    const distanceToCover = tortoiseStart - achillesStart;
    const deltaTime = distanceToCover / vA;
    cumulativeTime += deltaTime;

    const achillesEnd = tortoiseStart;
    const tortoiseEnd = tortoiseStart + vT * deltaTime;
    const remainingGap = tortoiseEnd - achillesEnd;

    currentAchillesPos = achillesEnd;
    currentTortoisePos = tortoiseEnd;

    const fractionOfTotalTime =
      analytical.overtakeTime > 0 ? (cumulativeTime / analytical.overtakeTime) * 100 : 0;

    steps.push({
      step: n,
      timeStart,
      timeEnd: cumulativeTime,
      deltaTime,
      cumulativeTime,
      achillesStart,
      achillesEnd,
      tortoiseStart,
      tortoiseEnd,
      remainingGap,
      fractionOfTotalTime,
      isPlanckScale: remainingGap <= PLANCK_LENGTH,
    });
  }

  return steps;
}

export interface ContinuousPosition {
  time: number;
  achillesPos: number;
  tortoisePos: number;
  gap: number;
  isOvertaken: boolean;
}

/**
 * Tính vị trí thực tế của 2 đối tượng tại thời điểm t bất kỳ (Cơ học liên tục)
 */
export function calculateContinuousPosition(
  time: number,
  params: ZenoParameters = DEFAULT_ZENO_PARAMS,
): ContinuousPosition {
  const { achillesSpeed: vA, tortoiseSpeed: vT, headStart: d0 } = params;
  const safeTime = Math.max(0, time);

  const achillesPos = vA * safeTime;
  const tortoisePos = d0 + vT * safeTime;
  const gap = tortoisePos - achillesPos;
  const isOvertaken = achillesPos >= tortoisePos;

  return {
    time: safeTime,
    achillesPos,
    tortoisePos,
    gap: Math.max(0, gap),
    isOvertaken,
  };
}

/**
 * Tính bậc n mà tại đó khoảng cách giữa Achilles và Rùa chạm tới giới hạn độ dài Planck
 * (Không thời gian lượng tử không còn liên tục)
 */
export function findPlanckStep(params: ZenoParameters = DEFAULT_ZENO_PARAMS): number {
  const { achillesSpeed: vA, tortoiseSpeed: vT, headStart: d0 } = params;
  if (vA <= vT || d0 <= 0) return Infinity;

  const r = vT / vA;
  if (r >= 1) return Infinity;

  // d_n = d_0 * r^(n+1) <= PLANCK_LENGTH
  // (n+1) * ln(r) <= ln(PLANCK_LENGTH / d0)
  // n+1 >= ln(PLANCK_LENGTH / d0) / ln(r)  (vì ln(r) < 0 nên đổi chiều bất đẳng thức)
  const nRequired = Math.ceil(Math.log(PLANCK_LENGTH / d0) / Math.log(r)) - 1;
  return Math.max(1, nRequired);
}
