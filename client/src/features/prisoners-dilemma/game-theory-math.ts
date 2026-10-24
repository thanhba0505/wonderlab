/**
 * Game Theory & Prisoner's Dilemma Mathematical Core
 * Wonderlab Scientific Platform
 */

export type Move = 'C' | 'D'; // C: Cooperate (Hợp tác), D: Defect (Phản bội)

export interface PayoffValues {
  R: number; // Reward for Mutual Cooperation (Thưởng khi cùng hợp tác: 3)
  T: number; // Temptation to Defect (Cám dỗ khi phản bội: 5)
  S: number; // Sucker's Payoff (Kẻ bị lừa: 0)
  P: number; // Punishment for Mutual Defection (Hình phạt khi cùng phản bội: 1)
}

export const DEFAULT_PAYOFFS: PayoffValues = {
  R: 3,
  T: 5,
  S: 0,
  P: 1,
};

/**
 * Tính điểm cho 2 người chơi dựa trên ma trận thanh toán
 * Trả về [điểm người 1, điểm người 2]
 */
export function calculatePayoffs(
  move1: Move,
  move2: Move,
  payoffs: PayoffValues = DEFAULT_PAYOFFS,
): [number, number] {
  if (move1 === 'C' && move2 === 'C') return [payoffs.R, payoffs.R]; // (3, 3)
  if (move1 === 'C' && move2 === 'D') return [payoffs.S, payoffs.T]; // (0, 5)
  if (move1 === 'D' && move2 === 'C') return [payoffs.T, payoffs.S]; // (5, 0)
  return [payoffs.P, payoffs.P]; // (1, 1)
}

export type StrategyId =
  | 'tit_for_tat'
  | 'always_defect'
  | 'always_cooperate'
  | 'grudger'
  | 'pavlov'
  | 'tit_for_two_tats'
  | 'random';

export interface StrategyInfo {
  id: StrategyId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  color: string;
  avatarChar: string;
}

export const STRATEGIES_LIST: StrategyInfo[] = [
  {
    id: 'tit_for_tat',
    name: 'Ăn Miếng Trả Miếng (Tit-for-Tat)',
    shortName: 'Tit-for-Tat',
    tagline: 'Lòng vị tha có điều kiện',
    description:
      'Hiệp đầu luôn hợp tác, các hiệp sau sao chép chính xác nước đi của đối thủ ở hiệp trước. Không phản bội trước, sẵn sàng trừng phạt và lập tức tha thứ.',
    color: '#2563eb', // Blue
    avatarChar: 'T',
  },
  {
    id: 'always_defect',
    name: 'Kẻ Phản Bội (Always Defect)',
    shortName: 'Always Defect',
    tagline: 'Lợi kỷ triệt để',
    description:
      'Luôn luôn phản bội ở mọi hiệp đấu, cố gắng bóc lột tối đa bất kỳ người chơi nào có ý định hợp tác.',
    color: '#e11d48', // Rose / Red
    avatarChar: 'D',
  },
  {
    id: 'always_cooperate',
    name: 'Người Vị Tha (Always Cooperate)',
    shortName: 'Always Cooperate',
    tagline: 'Ngây thơ vô điều kiện',
    description:
      'Luôn luôn hợp tác trong mọi hoàn cảnh, chấp nhận bị đối thủ lợi dụng mà không bao giờ đáp trả.',
    color: '#059669', // Emerald
    avatarChar: 'C',
  },
  {
    id: 'grudger',
    name: 'Kẻ Ghi Thù (Grudger / Friedman)',
    shortName: 'Grudger',
    tagline: 'Không bao giờ tha thứ',
    description:
      'Hợp tác cho đến khi đối thủ phản bội dù chỉ một lần duy nhất, sau đó sẽ phản bội đối thủ đến hết ván đấu.',
    color: '#d97706', // Amber
    avatarChar: 'G',
  },
  {
    id: 'pavlov',
    name: 'Thắng Giữ Thua Đổi (Pavlov)',
    shortName: 'Pavlov',
    tagline: 'Học hỏi theo kết quả (Win-Stay, Lose-Shift)',
    description:
      'Nếu hiệp trước nhận được điểm cao (5 hoặc 3) thì giữ nguyên lựa chọn, nếu bị điểm thấp (1 hoặc 0) thì đổi lựa chọn.',
    color: '#7c3aed', // Violet
    avatarChar: 'P',
  },
  {
    id: 'tit_for_two_tats',
    name: 'Khoan Dung (Tit-for-Two-Tats)',
    shortName: 'Tit-for-Two-Tats',
    tagline: 'Kiên nhẫn trước khi đáp trả',
    description:
      'Chỉ phản bội khi đối phương phản bội liên tiếp 2 lần. Cực kỳ hiệu quả trong môi trường có nhiều hiểu lầm hoặc nhiễu.',
    color: '#0284c7', // Sky
    avatarChar: '2T',
  },
  {
    id: 'random',
    name: 'Kẻ Ngẫu Nhiên (Random)',
    shortName: 'Random',
    tagline: 'Tung đồng xu 50/50',
    description: 'Chọn ngẫu nhiên giữa Hợp tác hoặc Phản bội với xác suất ngang nhau ở mọi hiệp.',
    color: '#64748b', // Slate
    avatarChar: 'R',
  },
];

export function getStrategyInfo(id: StrategyId): StrategyInfo {
  const found = STRATEGIES_LIST.find(s => s.id === id);
  return found || STRATEGIES_LIST[0];
}

/**
 * Ra quyết định nước đi tiếp theo của một chiến lược
 */
export function decideMove(
  strategyId: StrategyId,
  myHistory: Move[],
  opponentHistory: Move[],
  noiseRate: number = 0,
): Move {
  const round = myHistory.length;
  let move: Move = 'C';

  switch (strategyId) {
    case 'always_cooperate':
      move = 'C';
      break;

    case 'always_defect':
      move = 'D';
      break;

    case 'tit_for_tat':
      if (round === 0) {
        move = 'C';
      } else {
        move = opponentHistory[round - 1];
      }
      break;

    case 'grudger':
      if (opponentHistory.includes('D')) {
        move = 'D';
      } else {
        move = 'C';
      }
      break;

    case 'pavlov':
      if (round === 0) {
        move = 'C';
      } else {
        const lastMy = myHistory[round - 1];
        const lastOpp = opponentHistory[round - 1];
        const [myLastScore] = calculatePayoffs(lastMy, lastOpp);
        // Win-Stay (nếu điểm >= 3 thì giữ nguyên), Lose-Shift (nếu điểm < 3 thì đổi)
        if (myLastScore >= 3) {
          move = lastMy;
        } else {
          move = lastMy === 'C' ? 'D' : 'C';
        }
      }
      break;

    case 'tit_for_two_tats':
      if (round < 2) {
        move = 'C';
      } else {
        const last1 = opponentHistory[round - 1];
        const last2 = opponentHistory[round - 2];
        if (last1 === 'D' && last2 === 'D') {
          move = 'D';
        } else {
          move = 'C';
        }
      }
      break;

    case 'random':
      move = Math.random() < 0.5 ? 'C' : 'D';
      break;
  }

  // Áp dụng xác suất nhiễu (nhầm lẫn hành động)
  if (noiseRate > 0 && Math.random() < noiseRate) {
    return move === 'C' ? 'D' : 'C';
  }

  return move;
}

export interface RoundRecord {
  round: number;
  move1: Move;
  move2: Move;
  score1: number;
  score2: number;
  cumulativeScore1: number;
  cumulativeScore2: number;
}

export interface MatchResult {
  strategy1: StrategyId | 'human';
  strategy2: StrategyId;
  totalScore1: number;
  totalScore2: number;
  rounds: RoundRecord[];
  cooperationRate1: number;
  cooperationRate2: number;
}

/**
 * Đấu 1 trận lặp lại giữa 2 chiến lược qua K hiệp
 */
export function playMatch(
  strategy1: StrategyId,
  strategy2: StrategyId,
  roundsCount: number = 20,
  noiseRate: number = 0,
): MatchResult {
  const history1: Move[] = [];
  const history2: Move[] = [];
  const rounds: RoundRecord[] = [];

  let cumulative1 = 0;
  let cumulative2 = 0;
  let coopCount1 = 0;
  let coopCount2 = 0;

  for (let r = 0; r < roundsCount; r++) {
    const move1 = decideMove(strategy1, history1, history2, noiseRate);
    const move2 = decideMove(strategy2, history2, history1, noiseRate);

    history1.push(move1);
    history2.push(move2);

    if (move1 === 'C') coopCount1++;
    if (move2 === 'C') coopCount2++;

    const [score1, score2] = calculatePayoffs(move1, move2);
    cumulative1 += score1;
    cumulative2 += score2;

    rounds.push({
      round: r + 1,
      move1,
      move2,
      score1,
      score2,
      cumulativeScore1: cumulative1,
      cumulativeScore2: cumulative2,
    });
  }

  return {
    strategy1,
    strategy2,
    totalScore1: cumulative1,
    totalScore2: cumulative2,
    rounds,
    cooperationRate1: roundsCount > 0 ? coopCount1 / roundsCount : 0,
    cooperationRate2: roundsCount > 0 ? coopCount2 / roundsCount : 0,
  };
}

export type Population = Record<StrategyId, number>;

export const DEFAULT_POPULATION: Population = {
  tit_for_tat: 25,
  always_defect: 25,
  always_cooperate: 20,
  grudger: 15,
  pavlov: 15,
  tit_for_two_tats: 0,
  random: 0,
};

/**
 * Mô phỏng 1 thế hệ tiến hóa Axelrod (Replicator Dynamics)
 */
export function runEvolutionGeneration(
  currentPop: Population,
  roundsPerMatch: number = 10,
  noiseRate: number = 0,
): { nextPop: Population; fitnessMap: Record<StrategyId, number> } {
  const strategies = Object.keys(currentPop) as StrategyId[];
  const activeStrategies = strategies.filter(s => currentPop[s] > 0);
  const totalCount = strategies.reduce((sum, s) => sum + currentPop[s], 0);

  if (totalCount === 0 || activeStrategies.length <= 1) {
    return {
      nextPop: { ...currentPop },
      fitnessMap: strategies.reduce(
        (acc, s) => ({ ...acc, [s]: 0 }),
        {} as Record<StrategyId, number>,
      ),
    };
  }

  // 1. Tính điểm trung bình (Fitness) của mỗi chiến lược khi tương tác với quần thể
  const fitnessMap: Record<StrategyId, number> = strategies.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<StrategyId, number>,
  );

  // Đấu cặp vòng tròn giữa các kiểu chiến lược
  for (const stratA of activeStrategies) {
    let totalScoreA = 0;
    let totalOpponents = 0;

    for (const stratB of activeStrategies) {
      const countB = currentPop[stratB];
      if (countB <= 0) continue;

      // Trọng số theo số lượng cá thể loại B trong quần thể
      const match = playMatch(stratA, stratB, roundsPerMatch, noiseRate);
      const avgScorePerRound = match.totalScore1 / roundsPerMatch;

      totalScoreA += avgScorePerRound * countB;
      totalOpponents += countB;
    }

    fitnessMap[stratA] = totalOpponents > 0 ? totalScoreA / totalOpponents : 0;
  }

  // 2. Điểm thích nghi trung bình toàn bộ quần thể (Average Population Fitness)
  let popWeightedSum = 0;
  for (const s of activeStrategies) {
    popWeightedSum += fitnessMap[s] * currentPop[s];
  }
  const avgPopFitness = popWeightedSum / totalCount;

  // 3. Cập nhật tỷ lệ cá thể thế hệ mới theo Replicator Dynamics
  const nextPopRaw: Record<StrategyId, number> = {} as Record<StrategyId, number>;
  for (const s of strategies) {
    if (currentPop[s] <= 0 || avgPopFitness <= 0) {
      nextPopRaw[s] = 0;
    } else {
      const growthFactor = fitnessMap[s] / avgPopFitness;
      nextPopRaw[s] = currentPop[s] * growthFactor;
    }
  }

  // Chuẩn hóa tổng số cá thể về đúng totalCount (ví dụ 100)
  const rawSum = Object.values(nextPopRaw).reduce((a, b) => a + b, 0);
  const nextPop: Population = {} as Population;
  let allocated = 0;

  for (const s of strategies) {
    if (rawSum > 0) {
      const share = Math.round((nextPopRaw[s] / rawSum) * totalCount);
      nextPop[s] = share;
      allocated += share;
    } else {
      nextPop[s] = 0;
    }
  }

  // Điều chỉnh sai số làm tròn để tổng luôn đúng bằng totalCount
  const diff = totalCount - allocated;
  if (diff !== 0) {
    // Thêm hoặc bớt vào chiến lược có số cá thể lớn nhất
    let maxStrat: StrategyId = activeStrategies[0];
    let maxVal = -1;
    for (const s of activeStrategies) {
      if (nextPop[s] > maxVal) {
        maxVal = nextPop[s];
        maxStrat = s;
      }
    }
    nextPop[maxStrat] = Math.max(0, nextPop[maxStrat] + diff);
  }

  return { nextPop, fitnessMap };
}
