export interface PersonInRoom {
  id: number;
  dayOfYear: number; // 1 đến 365
  dateString: string; // ví dụ: "15 Th04"
  month: number; // 1 đến 12
  day: number; // 1 đến 31
  hue: number;
}

export interface CollisionPair {
  personAId: number;
  personBId: number;
  dayOfYear: number;
  dateString: string;
}

export interface SharedDateInfo {
  dayOfYear: number;
  dateString: string;
  count: number;
  personIds: number[];
}

export interface RoomSimulationResult {
  people: PersonInRoom[];
  hasCollision: boolean;
  collisionPairs: CollisionPair[];
  sharedDates: SharedDateInfo[];
  totalPairs: number;
}

export interface MonteCarloBatchResult {
  trials: number;
  collisions: number;
  empiricalRate: number;
  theoreticalRate: number;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = [
  'Th01',
  'Th02',
  'Th03',
  'Th04',
  'Th05',
  'Th06',
  'Th07',
  'Th08',
  'Th09',
  'Th10',
  'Th11',
  'Th12',
];

export function dayOfYearToDate(dayOfYear: number): {
  month: number;
  day: number;
  dateString: string;
} {
  let remainingDays = Math.max(1, Math.min(365, dayOfYear));
  for (let m = 0; m < 12; m++) {
    const daysThisMonth = DAYS_IN_MONTH[m];
    if (remainingDays <= daysThisMonth) {
      const month = m + 1;
      const day = remainingDays;
      const formattedDay = day < 10 ? `0${day}` : `${day}`;
      return {
        month,
        day,
        dateString: `${formattedDay} ${MONTH_NAMES[m]}`,
      };
    }
    remainingDays -= daysThisMonth;
  }
  return { month: 12, day: 31, dateString: '31 Th12' };
}

/**
 * Tính toán xác suất lý thuyết chính xác có ít nhất 2 người cùng ngày sinh trong phòng n người.
 * Công thức: P(n) = 1 - ∏_{k=0}^{n-1} (365 - k) / 365
 */
export function calculateTheoreticalProbability(n: number, daysInYear: number = 365): number {
  if (n <= 1) return 0;
  if (n > daysInYear) return 1;

  let pDistinct = 1.0;
  for (let k = 0; k < n; k++) {
    pDistinct *= (daysInYear - k) / daysInYear;
  }

  return Math.min(1, Math.max(0, 1.0 - pDistinct));
}

/**
 * Tính số cặp đối sánh có thể ghép đôi trong phòng n người: C(n, 2) = n * (n - 1) / 2
 */
export function calculateComparisonPairs(n: number): number {
  if (n < 2) return 0;
  return (n * (n - 1)) / 2;
}

/**
 * Sinh phòng gồm n người với ngày sinh ngẫu nhiên và phân tích va chạm.
 */
export function simulateRoom(
  n: number,
  daysInYear: number = 365,
  rng: () => number = Math.random,
): RoomSimulationResult {
  const people: PersonInRoom[] = [];
  const dayBuckets = new Map<number, number[]>();

  for (let i = 0; i < n; i++) {
    const dayOfYear = Math.floor(rng() * daysInYear) + 1;
    const { month, day, dateString } = dayOfYearToDate(dayOfYear);
    const hue = Math.floor((dayOfYear / 365) * 360);

    const person: PersonInRoom = {
      id: i + 1,
      dayOfYear,
      dateString,
      month,
      day,
      hue,
    };
    people.push(person);

    if (!dayBuckets.has(dayOfYear)) {
      dayBuckets.set(dayOfYear, []);
    }
    dayBuckets.get(dayOfYear)!.push(person.id);
  }

  const collisionPairs: CollisionPair[] = [];
  const sharedDates: SharedDateInfo[] = [];

  for (const [dayOfYear, personIds] of dayBuckets.entries()) {
    if (personIds.length > 1) {
      const { dateString } = dayOfYearToDate(dayOfYear);
      sharedDates.push({
        dayOfYear,
        dateString,
        count: personIds.length,
        personIds,
      });

      // Tạo các cặp va chạm
      for (let a = 0; a < personIds.length; a++) {
        for (let b = a + 1; b < personIds.length; b++) {
          collisionPairs.push({
            personAId: personIds[a],
            personBId: personIds[b],
            dayOfYear,
            dateString,
          });
        }
      }
    }
  }

  return {
    people,
    hasCollision: collisionPairs.length > 0,
    collisionPairs,
    sharedDates,
    totalPairs: calculateComparisonPairs(n),
  };
}

/**
 * Chạy mô phỏng Monte Carlo batch tối ưu tốc độ (sử dụng TypedArray)
 */
export function runMonteCarloBatch(
  n: number,
  trials: number = 1000,
  daysInYear: number = 365,
): MonteCarloBatchResult {
  if (n <= 1) {
    return {
      trials,
      collisions: 0,
      empiricalRate: 0,
      theoreticalRate: 0,
    };
  }

  if (n > daysInYear) {
    return {
      trials,
      collisions: trials,
      empiricalRate: 1,
      theoreticalRate: 1,
    };
  }

  let collisions = 0;
  const seen = new Uint8Array(daysInYear + 1);

  for (let t = 0; t < trials; t++) {
    // Reset mảng đánh dấu
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

  const theoreticalRate = calculateTheoreticalProbability(n, daysInYear);
  return {
    trials,
    collisions,
    empiricalRate: collisions / trials,
    theoreticalRate,
  };
}
