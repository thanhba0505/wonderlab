/**
 * Động cơ toán học & mô phỏng vật lý cho "Bài toán Đàn kiến trên thanh gỗ" (Ants on a Stick).
 * Cung cấp:
 * 1. Mô hình hạt 1D va chạm đàn hồi hoàn hảo (Lagrangian view).
 * 2. Mô hình hạt bóng ma đi xuyên tương đương (Eulerian ghost view).
 * 3. Bộ tính toán giải tích giới hạn thời gian (T_max, T_min, số lượng thoát, bảo toàn thứ tự).
 * 4. Thuật toán mô phỏng bước thời gian (dt) và Monte Carlo batch.
 */

export type AntDirection = 1 | -1; // +1: Sang phải (chiều dương), -1: Sang trái (chiều âm)

export interface Ant {
  readonly id: number;
  x: number; // Vị trí hiện tại trên thanh (cm, từ 0 đến stickLength)
  readonly initialX: number; // Vị trí xuất phát ban đầu (cm)
  direction: AntDirection; // Hướng chuyển động hiện tại (+1 hoặc -1)
  readonly initialDirection: AntDirection; // Hướng xuất phát ban đầu
  ghostX: number; // Tọa độ của "bóng ma" tương ứng nếu đi xuyên
  isFallen: boolean; // Đã rơi khỏi thanh chưa
  exitSide: 'left' | 'right' | null; // Cạnh thoát ra
  exitTime: number | null; // Thời điểm rơi ra (giây)
  collisionCount: number; // Số lần va chạm đã trải qua
  readonly color: string; // Mã màu nhận diện riêng cho cá thể
}

export interface CollisionEvent {
  readonly time: number;
  readonly x: number;
  readonly antId1: number;
  readonly antId2: number;
}

export interface AntsSimulationConfig {
  stickLength: number; // Chiều dài thanh gỗ (cm), mặc định 100
  speed: number; // Vận tốc không đổi (cm/s), mặc định 1
  antCount: number; // Số lượng kiến, mặc định 10
}

export type PresetScenario =
  | 'default-10'
  | 'classic-100'
  | 'two-ant-duel'
  | 'worst-case'
  | 'symmetric-exit'
  | 'alternating-cascade';

export interface TheoreticalBounds {
  maxTime: number; // Thời gian tối đa hệ thống tồn tại (L/v)
  theoreticalCompletionTime: number; // Thời gian thực tế để cá thể cuối cùng rơi (max ghost time)
  minTime: number; // Thời gian con kiến đầu tiên rơi
  expectedLeftExits: number; // Số con kiến rơi về bên trái
  expectedRightExits: number; // Số con kiến rơi về bên phải
  totalIntersections: number; // Tổng số va chạm tối đa có thể xảy ra
}

// Bảng màu khoa học phân biệt các con kiến
const PALETTE_HUES = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
];

export function getAntColor(index: number, total: number): string {
  if (total <= PALETTE_HUES.length) {
    return PALETTE_HUES[index % PALETTE_HUES.length] ?? '#3b82f6';
  }
  // Nếu số lượng kiến lớn (e.g. 100 con), phân bố dải màu đều trên vòng tròn HSL
  const hue = Math.round((index / total) * 360);
  return `hsl(${hue}, 80%, 48%)`;
}

/**
 * Sinh danh sách kiến ban đầu theo cấu hình hoặc kịch bản mẫu.
 * Luôn đảm bảo các con kiến được sắp xếp theo tọa độ tăng dần x_1 < x_2 < ... < x_N
 */
export function generateAnts(
  config: AntsSimulationConfig,
  preset: PresetScenario = 'default-10',
  customRandom?: () => number,
): Ant[] {
  const { stickLength } = config;
  const count = preset === 'classic-100' ? 100 : preset === 'two-ant-duel' ? 2 : config.antCount;

  const rand = customRandom ?? Math.random;

  let positions: number[] = [];
  let directions: AntDirection[] = [];

  switch (preset) {
    case 'two-ant-duel': {
      // 2 con kiến đối đầu trực tiếp ở giữa thước
      positions = [stickLength * 0.45, stickLength * 0.55];
      directions = [1, -1];
      break;
    }

    case 'worst-case': {
      // 1 con ở đầu trái (0.5cm) đi sang phải, tất cả các con còn lại dồn ở đầu phải đi sang trái
      // Quãng đường con đầu phải đi là gần 100cm, chạm cận tối đa T_max
      positions = [0.5];
      directions = [1];
      const remainingCount = Math.max(1, count - 1);
      const rightStart = stickLength - remainingCount * 0.8 - 0.5;
      for (let i = 0; i < remainingCount; i++) {
        positions.push(rightStart + i * 0.8);
        directions.push(-1);
      }
      break;
    }

    case 'symmetric-exit': {
      // Nửa trái đi sang trái, nửa phải đi sang phải -> Thời gian chỉ ~ 50s
      for (let i = 0; i < count; i++) {
        const x = ((i + 1) / (count + 1)) * stickLength;
        positions.push(x);
        directions.push(x < stickLength / 2 ? -1 : 1);
      }
      break;
    }

    case 'alternating-cascade': {
      // Đan xen L - R - L - R để tối đa hóa số lần nảy va chạm
      for (let i = 0; i < count; i++) {
        const x = ((i + 1) / (count + 1)) * stickLength;
        positions.push(x);
        directions.push(i % 2 === 0 ? 1 : -1);
      }
      break;
    }

    case 'classic-100':
    case 'default-10':
    default: {
      // Vị trí ngẫu nhiên không trùng lặp và được sắp xếp từ trái sang phải
      const rawPositions: number[] = [];
      const minMargin = 1.0; // Cách mép tối thiểu 1cm để quan sát chuyển động
      for (let i = 0; i < count; i++) {
        rawPositions.push(minMargin + rand() * (stickLength - 2 * minMargin));
      }
      // Đảm bảo không trùng tọa độ tuyệt đối bằng cách sort
      rawPositions.sort((a, b) => a - b);

      // Đảm bảo khoảng cách tối thiểu giữa 2 con kiến
      const minGap = 0.2;
      for (let i = 1; i < rawPositions.length; i++) {
        const prev = rawPositions[i - 1] ?? 0;
        const current = rawPositions[i] ?? 0;
        if (current - prev < minGap) {
          rawPositions[i] = prev + minGap;
        }
      }

      positions = rawPositions;
      for (let i = 0; i < count; i++) {
        directions.push(rand() < 0.5 ? -1 : 1);
      }
      break;
    }
  }

  return positions.map((x, index) => {
    const dir = directions[index] ?? (index % 2 === 0 ? 1 : -1);
    return {
      id: index + 1,
      x,
      initialX: x,
      direction: dir,
      initialDirection: dir,
      ghostX: x,
      isFallen: false,
      exitSide: null,
      exitTime: null,
      collisionCount: 0,
      color: getAntColor(index, count),
    };
  });
}

/**
 * Tính toán các cận giải tích lý thuyết cho đàn kiến đã khởi tạo.
 */
export function calculateTheoreticalBounds(
  ants: readonly Ant[],
  config: AntsSimulationConfig,
): TheoreticalBounds {
  const { stickLength, speed } = config;
  const maxTime = stickLength / speed;

  let leftExits = 0;
  let rightExits = 0;
  let theoreticalCompletionTime = 0;
  let minTime = Infinity;

  for (const ant of ants) {
    if (ant.initialDirection === -1) {
      leftExits++;
      // Thời gian để hạt bóng ma này rơi ở mép trái: initialX / speed
      const dropTime = ant.initialX / speed;
      if (dropTime > theoreticalCompletionTime) theoreticalCompletionTime = dropTime;
      if (dropTime < minTime) minTime = dropTime;
    } else {
      rightExits++;
      // Thời gian để hạt bóng ma này rơi ở mép phải: (stickLength - initialX) / speed
      const dropTime = (stickLength - ant.initialX) / speed;
      if (dropTime > theoreticalCompletionTime) theoreticalCompletionTime = dropTime;
      if (dropTime < minTime) minTime = dropTime;
    }
  }

  if (minTime === Infinity) minTime = 0;

  // Tính số vụ va chạm có thể xảy ra:
  // Mỗi cặp (i, j) với i < j (tức initialX_i < initialX_j) mà i hướng phải (+1) và j hướng trái (-1)
  // sẽ giao nhau đúng một lần trong không-thời gian.
  let totalIntersections = 0;
  for (let i = 0; i < ants.length; i++) {
    const antI = ants[i];
    if (!antI || antI.initialDirection !== 1) continue;
    for (let j = i + 1; j < ants.length; j++) {
      const antJ = ants[j];
      if (antJ && antJ.initialDirection === -1) {
        totalIntersections++;
      }
    }
  }

  return {
    maxTime,
    theoreticalCompletionTime,
    minTime,
    expectedLeftExits: leftExits,
    expectedRightExits: rightExits,
    totalIntersections,
  };
}

export interface SimulationStepResult {
  updatedAnts: Ant[];
  newCollisions: CollisionEvent[];
  newlyFallen: Ant[];
  isCompleted: boolean;
}

/**
 * Thực hiện bước nhảy thời gian delta T (dùng cho vòng lặp Animation 60fps).
 * Sử dụng giải thuật va chạm chính xác (Event-driven sub-stepping):
 * - Tìm thời điểm va chạm gần nhất giữa các cặp liền kề đang tiến lại gần nhau
 * - Nhảy tới thời điểm đó, hoán đổi vận tốc, ghi nhận va chạm
 * - Đảm bảo tính bất biến tuyệt đối: x_1 <= x_2 <= ... <= x_N (Không xuyên ngẫu nhiên, không tunneling)
 */
export function stepSimulation(
  currentAnts: readonly Ant[],
  dt: number,
  config: AntsSimulationConfig,
  currentTime: number,
): SimulationStepResult {
  const { stickLength, speed } = config;
  const newCollisions: CollisionEvent[] = [];
  const newlyFallen: Ant[] = [];

  // Deep clone danh sách kiến
  const ants: Ant[] = currentAnts.map(ant => ({ ...ant }));

  // Cập nhật vị trí bóng ma (luôn đi thẳng với vận tốc ban đầu)
  for (let i = 0; i < ants.length; i++) {
    const ant = ants[i];
    if (ant && !ant.isFallen) {
      ant.ghostX += ant.initialDirection * speed * dt;
    }
  }

  let remainingDt = dt;
  let simulatedTime = currentTime;

  // Lặp giải quyết các va chạm vi mô trong khoảng dt
  while (remainingDt > 1e-6) {
    const activeIndices: number[] = [];
    for (let i = 0; i < ants.length; i++) {
      const a = ants[i];
      if (a && !a.isFallen) {
        activeIndices.push(i);
      }
    }

    if (activeIndices.length === 0) break;

    // Tìm va chạm sớm nhất giữa 2 con kiến liền kề đang tiến về phía nhau
    let minCollisionDt = Infinity;
    const collidingPairIndices: [number, number][] = [];

    for (let k = 0; k < activeIndices.length - 1; k++) {
      const idx1 = activeIndices[k];
      const idx2 = activeIndices[k + 1];
      if (idx1 === undefined || idx2 === undefined) continue;

      const a1 = ants[idx1];
      const a2 = ants[idx2];
      if (!a1 || !a2) continue;

      // a1 ở bên trái a2. Nếu a1 đi sang phải (+1) và a2 đi sang trái (-1)
      if (a1.direction === 1 && a2.direction === -1) {
        const gap = a2.x - a1.x;
        if (gap >= -1e-6) {
          const timeToCollision = gap / (2 * speed);
          if (timeToCollision < minCollisionDt - 1e-7) {
            minCollisionDt = Math.max(0, timeToCollision);
            collidingPairIndices.length = 0;
            collidingPairIndices.push([idx1, idx2]);
          } else if (Math.abs(timeToCollision - minCollisionDt) <= 1e-7) {
            collidingPairIndices.push([idx1, idx2]);
          }
        }
      }
    }

    // Thời gian bước nhảy tiếp theo
    const stepTime = Math.min(remainingDt, minCollisionDt);

    // Di chuyển tất cả active ants theo stepTime
    for (const idx of activeIndices) {
      const ant = ants[idx];
      if (ant) {
        ant.x += ant.direction * speed * stepTime;
      }
    }

    simulatedTime += stepTime;
    remainingDt -= stepTime;

    // Nếu xảy ra va chạm trong bước này
    if (minCollisionDt <= remainingDt + stepTime && collidingPairIndices.length > 0) {
      for (const [idx1, idx2] of collidingPairIndices) {
        const a1 = ants[idx1];
        const a2 = ants[idx2];
        if (!a1 || !a2) continue;

        // Đổi chiều đàn hồi
        a1.direction = -1;
        a2.direction = 1;

        // Đảm bảo không trùng khít tọa độ tuyệt đối bằng cách cân bằng tâm
        const midX = (a1.x + a2.x) / 2;
        a1.x = midX - 1e-5;
        a2.x = midX + 1e-5;

        a1.collisionCount += 1;
        a2.collisionCount += 1;

        newCollisions.push({
          time: simulatedTime,
          x: midX,
          antId1: a1.id,
          antId2: a2.id,
        });
      }
    }
  }

  // Kiểm tra rơi khỏi thanh gỗ
  const nextTime = currentTime + dt;
  for (let i = 0; i < ants.length; i++) {
    const ant = ants[i];
    if (!ant || ant.isFallen) continue;

    if (ant.x <= 0) {
      ant.isFallen = true;
      ant.exitSide = 'left';
      ant.exitTime = nextTime;
      ant.x = 0;
      newlyFallen.push(ant);
    } else if (ant.x >= stickLength) {
      ant.isFallen = true;
      ant.exitSide = 'right';
      ant.exitTime = nextTime;
      ant.x = stickLength;
      newlyFallen.push(ant);
    }
  }

  const isCompleted = ants.every(a => a.isFallen);

  return {
    updatedAnts: ants,
    newCollisions,
    newlyFallen,
    isCompleted,
  };
}

/**
 * Mô phỏng Monte Carlo batch để tính phân bố xác suất của thời gian hoàn thành T.
 */
export interface MonteCarloResult {
  iterations: number;
  averageTime: number;
  maxObservedTime: number;
  minObservedTime: number;
  histogram: { binStart: number; binEnd: number; count: number }[];
}

export function runMonteCarloSimulations(
  antCount: number,
  stickLength = 100,
  speed = 1,
  iterations = 1000,
): MonteCarloResult {
  const times: number[] = [];
  let totalTime = 0;
  let maxTime = -Infinity;
  let minTime = Infinity;

  const binCount = 10;
  const binWidth = stickLength / speed / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    binStart: i * binWidth,
    binEnd: (i + 1) * binWidth,
    count: 0,
  }));

  for (let it = 0; it < iterations; it++) {
    // Với mỗi lần thử, thời gian để toàn bộ đàn kiến rơi đúng bằng:
    // max_{i} [ (direction_i == -1) ? x_i / speed : (stickLength - x_i) / speed ]
    let iterationMax = 0;
    for (let i = 0; i < antCount; i++) {
      const x = Math.random() * stickLength;
      const dir = Math.random() < 0.5 ? -1 : 1;
      const t = dir === -1 ? x / speed : (stickLength - x) / speed;
      if (t > iterationMax) iterationMax = t;
    }

    times.push(iterationMax);
    totalTime += iterationMax;
    if (iterationMax > maxTime) maxTime = iterationMax;
    if (iterationMax < minTime) minTime = iterationMax;

    const binIndex = Math.min(binCount - 1, Math.floor(iterationMax / binWidth));
    const targetBin = bins[binIndex];
    if (targetBin) {
      targetBin.count++;
    }
  }

  return {
    iterations,
    averageTime: totalTime / iterations,
    maxObservedTime: maxTime,
    minObservedTime: minTime,
    histogram: bins,
  };
}
