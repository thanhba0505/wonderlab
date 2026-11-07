import { describe, it, expect } from 'vitest';
import {
  generateAnts,
  calculateTheoreticalBounds,
  stepSimulation,
  runMonteCarloSimulations,
  AntsSimulationConfig,
} from './ants-math';

describe('ants-math pure engine', () => {
  const defaultConfig: AntsSimulationConfig = {
    stickLength: 100,
    speed: 1,
    antCount: 10,
  };

  it('khởi tạo danh sách kiến được sắp xếp tăng dần theo tọa độ', () => {
    const ants = generateAnts(defaultConfig, 'default-10');
    expect(ants).toHaveLength(10);

    for (let i = 0; i < ants.length - 1; i++) {
      const current = ants[i];
      const next = ants[i + 1];
      expect(current).toBeDefined();
      expect(next).toBeDefined();
      if (current && next) {
        expect(current.x).toBeLessThan(next.x);
        expect(current.id).toBe(i + 1);
      }
    }
  });

  it('tính toán giới hạn lý thuyết: T_max luôn bằng L / v = 100s', () => {
    const ants = generateAnts(defaultConfig, 'classic-100');
    const bounds = calculateTheoreticalBounds(ants, {
      stickLength: 100,
      speed: 1,
      antCount: 100,
    });

    expect(bounds.maxTime).toBe(100);
    expect(bounds.theoreticalCompletionTime).toBeLessThanOrEqual(100);
    expect(bounds.theoreticalCompletionTime).toBeGreaterThan(0);
    expect(bounds.expectedLeftExits + bounds.expectedRightExits).toBe(100);
  });

  it('kịch bản song đấu 2 kiến (Two-Ant Duel): va chạm ở giữa và hoán đổi vận tốc', () => {
    const duelConfig: AntsSimulationConfig = {
      stickLength: 100,
      speed: 1,
      antCount: 2,
    };
    const ants = generateAnts(duelConfig, 'two-ant-duel');
    expect(ants).toHaveLength(2);

    const antA = ants[0];
    const antB = ants[1];
    expect(antA).toBeDefined();
    expect(antB).toBeDefined();
    if (!antA || !antB) return;

    expect(antA.x).toBeCloseTo(45, 5);
    expect(antA.direction).toBe(1); // Sang phải
    expect(antB.x).toBeCloseTo(55, 5);
    expect(antB.direction).toBe(-1); // Sang trái

    // Khoảng cách ban đầu là 10cm, tốc độ tương đối là 2cm/s -> Va chạm sau 5s ở x = 50cm
    const bounds = calculateTheoreticalBounds(ants, duelConfig);
    expect(bounds.totalIntersections).toBe(1);
    expect(bounds.theoreticalCompletionTime).toBeCloseTo(55, 5); // Ghost A đến 100cm sau 55s, Ghost B đến 0cm sau 55s

    // Mô phỏng từng bước 1s
    let currentAnts = ants;
    let collisionsCount = 0;
    const dt = 0.5;

    for (let t = 0; t < 120; t++) {
      const step = stepSimulation(currentAnts, dt, duelConfig, t * dt);
      currentAnts = step.updatedAnts;
      collisionsCount += step.newCollisions.length;

      if (step.isCompleted) {
        break;
      }
    }

    expect(collisionsCount).toBe(1);
    // Sau khi rơi, con 1 rơi sang trái, con 2 rơi sang phải
    const finalA = currentAnts.find(a => a.id === 1);
    const finalB = currentAnts.find(a => a.id === 2);
    expect(finalA?.exitSide).toBe('left');
    expect(finalB?.exitSide).toBe('right');
  });

  it('định lý bảo toàn thứ tự: các con kiến không bao giờ nhảy qua mặt nhau trên đường 1D', () => {
    const ants = generateAnts(defaultConfig, 'alternating-cascade');
    let currentAnts = ants;
    const dt = 0.2;

    for (let step = 0; step < 50; step++) {
      const res = stepSimulation(currentAnts, dt, defaultConfig, step * dt);
      currentAnts = res.updatedAnts;

      const activeAnts = currentAnts.filter(a => !a.isFallen);
      for (let i = 0; i < activeAnts.length - 1; i++) {
        const left = activeAnts[i];
        const right = activeAnts[i + 1];
        if (left && right) {
          expect(left.id).toBeLessThan(right.id);
          expect(left.x).toBeLessThanOrEqual(right.x + 0.002);
        }
      }

      if (res.isCompleted) break;
    }
  });

  it('định lý bảo toàn số lượng thoát: số lượng rơi sang trái đúng bằng số lượng ban đầu hướng sang trái', () => {
    const ants = generateAnts(defaultConfig, 'default-10');
    const initialLeftCount = ants.filter(a => a.initialDirection === -1).length;
    const initialRightCount = ants.filter(a => a.initialDirection === 1).length;

    let currentAnts = ants;
    const dt = 0.5;
    let isCompleted = false;

    // Chạy tới khi toàn bộ kiến rơi hết
    for (let step = 0; step < 300; step++) {
      const res = stepSimulation(currentAnts, dt, defaultConfig, step * dt);
      currentAnts = res.updatedAnts;
      if (res.isCompleted) {
        isCompleted = true;
        break;
      }
    }

    expect(isCompleted).toBe(true);
    const actualLeftCount = currentAnts.filter(a => a.exitSide === 'left').length;
    const actualRightCount = currentAnts.filter(a => a.exitSide === 'right').length;

    expect(actualLeftCount).toBe(initialLeftCount);
    expect(actualRightCount).toBe(initialRightCount);
  });

  it('mô phỏng Monte Carlo 500 lần: không có lần thử nào vượt quá 100 giây', () => {
    const result = runMonteCarloSimulations(10, 100, 1, 500);
    expect(result.iterations).toBe(500);
    expect(result.maxObservedTime).toBeLessThanOrEqual(100);
    expect(result.averageTime).toBeGreaterThan(0);
    expect(result.averageTime).toBeLessThan(100);
  });
});
