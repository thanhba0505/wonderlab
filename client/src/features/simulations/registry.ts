import { SimulationMeta } from './types';

export const SIMULATIONS_REGISTRY: SimulationMeta[] = [
  {
    slug: 'birthday-paradox',
    title: 'Nghịch lý Ngày sinh (Birthday Paradox)',
    subtitle: 'Sự va chạm xác suất trong không gian tổ hợp',
    category: 'probability',
    difficulty: 'beginner',
    estimatedMinutes: 4,
    formula: 'P(n) = 1 - \\prod_{k=0}^{n-1} \\frac{365-k}{365}',
    summary:
      'Chỉ cần 23 người ngẫu nhiên trong một phòng, xác suất có ít nhất 2 người cùng ngày sinh đã vượt quá 50%; với 70 người, con số là 99.9%.',
    description:
      'Trực giác của chúng ta thường so sánh ngày sinh của chính mình với 22 người còn lại (chỉ có 22 phép thử). Nhưng thực tế, nghịch lý xem xét toàn bộ các cặp người có thể ghép đôi trong phòng: với 23 người, có tới 253 cặp đối sánh độc lập!',
    tags: ['Xác suất', 'Tổ hợp', 'Thống kê', 'Monte Carlo'],
    status: 'active',
    accentColor: 'amber',
  },
  {
    slug: 'monty-hall',
    title: 'Nghịch lý Monty Hall (The Monty Hall Problem)',
    subtitle: 'Lý thuyết xác suất có điều kiện và thông tin ẩn',
    category: 'probability',
    difficulty: 'beginner',
    estimatedMinutes: 3,
    formula:
      'P(\\text{Thắng}|\\text{Đổi}) = \\frac{2}{3}, \\quad P(\\text{Thắng}|\\text{Giữ}) = \\frac{1}{3}',
    summary:
      'Trò chơi 3 cánh cửa kinh điển: Hành động đổi cánh cửa sau khi người dẫn chương trình mở ra một con dê sẽ nhân đôi cơ hội chiến thắng của bạn.',
    description:
      'Monty Hall luôn biết con dê ở đâu và chủ ý mở cánh cửa có dê trong 2 cánh còn lại. Kiến thức của người dẫn chương trình chuyển toàn bộ xác suất 2/3 ban đầu vào cánh cửa chưa mở còn lại.',
    tags: ['Xác suất có điều kiện', 'Bayes', 'Lý thuyết quyết định'],
    status: 'active',
    accentColor: 'amber',
  },
  {
    slug: 'double-slit',
    title: 'Thí nghiệm Hai khe Young (Double-Slit Experiment)',
    subtitle: 'Lưỡng tính sóng hạt và sự sụp đổ hàm sóng lượng tử',
    category: 'physics',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    formula: 'd \\sin(\\theta) = m\\lambda',
    summary:
      'Khi từng photon đơn lẻ đi qua hai khe hẹp, chúng tạo ra vân giao thoa sóng. Nhưng nếu đặt máy dò quan sát, vân giao thoa biến mất ngay lập tức.',
    description:
      'Thí nghiệm chứng minh nền tảng của cơ học lượng tử: hạt vi mô hành xử như sóng xác suất cho đến khi chịu sự đo lường vật lý.',
    tags: ['Cơ học lượng tử', 'Quang học', 'Hàm sóng'],
    status: 'in-development',
    accentColor: 'blue',
  },
  {
    slug: 'prisoners-dilemma',
    title: "Thế lưỡng nan của người tù (Prisoner's Dilemma)",
    subtitle: 'Cân bằng Nash và sự tiến hóa của lòng vị tha có điều kiện',
    category: 'game-theory',
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    formula: 'T > R > P > S \\quad \\text{và} \\quad 2R > T + S',
    summary:
      'Hai tù nhân bị thẩm vấn riêng: nếu cả hai cùng phản bội, cả hai chịu án nặng hơn so với việc cả hai cùng giữ im lặng hợp tác.',
    description:
      'Nền tảng của lý thuyết trò chơi ứng dụng trong kinh tế học, tiến hóa sinh học và đạo đức học. Giải đấu Axelrod chỉ ra chiến lược Tit-for-Tat đem lại hiệu quả bền vững nhất.',
    tags: ['Lý thuyết trò chơi', 'Cân bằng Nash', 'Tiến hóa chiến lược'],
    status: 'in-development',
    accentColor: 'emerald',
  },
  {
    slug: 'zeno-paradox',
    title: 'Nghịch lý Zeno: Achilles và Rùa (Zeno Paradox)',
    subtitle: 'Chuỗi hội tụ vô hạn và tính liên tục của không thời gian',
    category: 'paradox',
    difficulty: 'advanced',
    estimatedMinutes: 5,
    formula: '\\sum_{n=1}^{\\infty} \\left(\\frac{1}{2}\\right)^n = 1',
    summary:
      'Chiến binh Achilles dẫu chạy nhanh gấp 10 lần con rùa nhưng theo Zeno sẽ không bao giờ đuổi kịp vì khoảng cách liên tục bị chia đôi vô tận.',
    description:
      'Nghịch lý triết học Hy Lạp cổ đại đặt nền móng cho giải tích hiện đại, định nghĩa giới hạn và tính chất topo của không thời gian thực tế.',
    tags: ['Giải tích', 'Nghịch lý', 'Triết học', 'Chuỗi vô hạn'],
    status: 'in-development',
    accentColor: 'violet',
  },
];

export function getSimulationBySlug(slug: string): SimulationMeta | undefined {
  return SIMULATIONS_REGISTRY.find(sim => sim.slug === slug);
}

export function getAllSimulations(): SimulationMeta[] {
  return SIMULATIONS_REGISTRY;
}

export function getActiveSimulations(): SimulationMeta[] {
  return SIMULATIONS_REGISTRY.filter(sim => sim.status === 'active');
}
