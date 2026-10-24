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
    hypothesis: {
      question:
        'Theo trực giác tự nhiên của bạn, trong một phòng có 23 người ngẫu nhiên, cơ hội để có ít nhất 2 người trùng ngày sinh là bao nhiêu?',
      context: 'Một năm có 365 ngày. Nhóm chỉ có 23 người (chiếm chưa đầy 6.3% số ngày trong năm).',
      options: [
        {
          id: 'opt-a',
          label: 'Rất hiếm gặp (< 10%)',
          value: 0.08,
          explanation:
            'Trực giác tuyến tính so sánh 23 với 365, cho rằng cơ hội hai người trùng nhau là cực kỳ thấp.',
        },
        {
          id: 'opt-b',
          label: 'Xác suất vừa phải (20% – 30%)',
          value: 0.25,
          explanation:
            'Cảm giác có khả năng xảy ra nhưng không thể vượt quá một nửa số trường hợp.',
        },
        {
          id: 'opt-c',
          label: 'Khoảng một nửa (~ 50%)',
          value: 0.5073,
          explanation:
            'Chính xác! 23 người tạo ra tới C(23, 2) = 253 cặp đối sánh, đẩy xác suất chạm mốc 50.73%.',
        },
        {
          id: 'opt-d',
          label: 'Gần như chắc chắn (> 80%)',
          value: 0.85,
          explanation: 'Đoán quá cao so với quy mô nhóm 23 người (mốc 80% cần khoảng 35 người).',
        },
      ],
      theoreticalTruth: 0.5073,
      truthExplanation:
        'Số cặp đối sánh trong phòng bùng nổ theo cấp số bậc hai C(23, 2) = 253 cặp. Xác suất để TẤT CẢ 253 cặp này đều không trùng là (364/365) x (363/365) x ... ≈ 49.27%, do đó cơ hội có ít nhất 1 cặp trùng là 50.73%!',
      biasType: 'linear-scaling-trap',
      biasName: 'Bẫy Tư duy Tuyến tính (Linear Scaling Bias)',
      biasDescription:
        'Não bộ tiến hóa để so sánh quan hệ 1-1 (tôi với từng người) thay vì hình dung toàn bộ không gian tổ hợp O(n²).',
    },
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
    hypothesis: {
      question:
        'Sau khi bạn chọn 1 cửa và MC mở ra 1 con dê, cơ hội chiến thắng của bạn sẽ ra sao nếu bạn ĐỔI sang cánh cửa còn lại?',
      context:
        'Còn lại đúng 2 cánh cửa đang đóng: 1 cửa chứa ô tô thể thao, 1 cửa chứa một chú dê.',
      options: [
        {
          id: 'opt-a',
          label: '50 / 50 (Giữ hay đổi đều như nhau)',
          value: 0.5,
          explanation:
            'Ảo tưởng kinh điển: Vì chỉ còn 2 cánh cửa đóng nên bộ não tự động giả định cơ hội chia đều 50/50.',
        },
        {
          id: 'opt-b',
          label: 'Giữ nguyên tốt hơn (~ 66.7%)',
          value: 0.3333,
          explanation:
            'Hiệu ứng sở hữu tâm lý (Endowment Effect): Tin rằng trực giác đầu tiên của mình linh thiêng hơn.',
        },
        {
          id: 'opt-c',
          label: 'Đổi cửa nhân đôi cơ hội thắng (66.7%)',
          value: 0.6667,
          explanation:
            'Chính xác! Cửa ban đầu chỉ có 1/3 cơ hội. MC biết rõ và triệt tiêu con dê, dồn 2/3 xác suất sang cửa còn lại.',
        },
      ],
      theoreticalTruth: 0.6667,
      truthExplanation:
        'Bạn chỉ thua khi đổi nếu bạn chọn trúng ô tô ngay từ đầu (xác suất 1/3). Bạn thắng khi đổi nếu bạn chọn trúng dê từ đầu (xác suất 2/3). Do đó, đổi cửa cho bạn chính xác 2/3 (66.67%) cơ hội chiến thắng!',
      biasType: 'conditional-probability-fallacy',
      biasName: 'Ảo tưởng Xác suất Đồng đều (Uniformity Fallacy)',
      biasDescription:
        'Bộ não bỏ qua thông tin điều kiện do hành động có chủ đích của người dẫn chương trình mang lại.',
    },
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
    status: 'active',
    accentColor: 'blue',
    hypothesis: {
      question:
        'Nếu ta bắn từng hạt photon đơn lẻ một qua 2 khe hẹp (mỗi hạt bắn cách nhau vài giây), trên màn hứng sẽ xuất hiện hình ảnh gì sau 1.000 hạt?',
      context:
        'Chỉ có đúng 1 hạt bay trong buồng thí nghiệm tại một thời điểm. Hạt hoàn toàn không thể va chạm vật lý với bất kỳ hạt nào khác.',
      options: [
        {
          id: 'opt-a',
          label: 'Hai dải vạch thẳng song song (như ném bi qua 2 khe)',
          value: 0.1,
          explanation:
            'Trực giác cơ học cổ điển: Cho rằng hạt là vật thể rắn, chỉ có thể bay qua khe trái hoặc khe phải nên tạo thành 2 dải vạch.',
        },
        {
          id: 'opt-b',
          label: 'Các hạt phân tán hỗn loạn ngẫu nhiên không có quy luật',
          value: 0.25,
          explanation:
            'Cảm giác chuyển động nhiệt ngẫu nhiên: Cho rằng hạt lượng tử bay hỗn loạn như phân tử khí.',
        },
        {
          id: 'opt-c',
          label: 'Vẫn xuất hiện hệ vân giao thoa sóng sáng tối rõ rệt',
          value: 1.0,
          explanation:
            'Chính xác tuyệt đối! Mỗi hạt tự đi qua cả 2 khe cùng lúc dưới dạng sóng xác suất và tự giao thoa với chính nó, tích lũy dần thành vân giao thoa!',
        },
        {
          id: 'opt-d',
          label: 'Màn hứng hoàn toàn tối đen vì các hạt tự triệt tiêu',
          value: 0.05,
          explanation:
            'Hiểu lầm về sự triệt tiêu: Sự giao thoa không làm biến mất năng lượng mà chỉ tái phân bố xác suất không gian.',
        },
      ],
      theoreticalTruth: 1.0,
      truthExplanation:
        'Ngay cả khi chỉ có 1 hạt duy nhất, hàm sóng Schrödinger của nó lan truyền qua cả hai khe đồng thời. Các điểm va chạm tích tụ theo mật độ xác suất I(y) tạo nên vân giao thoa hoàn hảo — trừ khi bạn đặt máy quan sát!',
      biasType: 'classical-mechanics-bias',
      biasName: 'Định kiến Cơ học Cổ điển (Classical Particle Fallacy)',
      biasDescription:
        'Não bộ người quen với thế giới vĩ mô (ném bi, quả bóng) nên không thể tự nhiên hình dung được trạng thái chồng chập lượng tử vừa là sóng vừa là hạt.',
    },
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
    status: 'active',
    accentColor: 'emerald',
    hypothesis: {
      question:
        "Trong một giải đấu lặp lại nhiều vòng (Iterated Prisoner's Dilemma) với các đối thủ đa dạng, chiến lược nào sẽ đạt tổng điểm trung bình cao nhất và chiếm lĩnh quần thể?",
      context:
        'Mỗi cá thể thi đấu nhiều ván với mọi cá thể khác. Điểm số tích lũy quyết định số lượng con cháu ở thế hệ tiếp theo (Replicator Dynamics).',
      options: [
        {
          id: 'opt-a',
          label: 'Luôn phản bội (Always Defect) — Tối ưu điểm số tức thì trong mọi hoàn cảnh',
          value: 0.1,
          explanation:
            'Bẫy cận thị ngắn hạn: Trong 1 ván đơn lẻ phản bội luôn có lợi hơn, nhưng trong trò chơi lặp lại, hai kẻ phản bội gặp nhau chỉ nhận 1 điểm mỗi ván và nhanh chóng bị đào thải.',
        },
        {
          id: 'opt-b',
          label:
            'Ăn miếng trả miếng (Tit-for-Tat) — Khởi đầu hợp tác, sau đó sao chép nước đi của đối phương',
          value: 1.0,
          explanation:
            'Chính xác xuất sắc! Chiến lược đơn giản này bất bại qua hàng trăm giải đấu nhờ 4 phẩm chất: Lương thiện, Sòng phẳng, Khoan dung và Rõ ràng.',
        },
        {
          id: 'opt-c',
          label: 'Luôn hợp tác (Always Cooperate) — Vị tha vô điều kiện',
          value: 0.05,
          explanation:
            'Ngây thơ sinh học: Cá thể luôn hợp tác dễ dàng bị những kẻ bóc lột (Always Defect) khai thác đến kiệt quệ và tuyệt chủng.',
        },
        {
          id: 'opt-d',
          label: 'Kẻ ghi thù (Grudger) — Hợp tác đến khi bị phản bội 1 lần thì trả thù vĩnh viễn',
          value: 0.35,
          explanation:
            'Thiếu lòng khoan dung: Nếu chỉ có một hiểu lầm hoặc nhiễu ngẫu nhiên, mối quan hệ sẽ rơi vào vòng xoáy hận thù vĩnh viễn không thể phục hồi.',
        },
      ],
      theoreticalTruth: 1.0,
      truthExplanation:
        'Nghiên cứu kinh điển của Robert Axelrod chứng minh rằng trong tương tác lặp lại dài hạn, lòng vị tha có điều kiện (Win-Win) luôn đánh bại sự ích kỷ thuần túy (Zero-Sum). Tit-for-Tat không bao giờ kiếm được nhiều điểm hơn đối thủ trong một trận đơn lẻ, nhưng luôn đạt tổng điểm cao nhất toàn giải đấu!',
      biasType: 'zero-sum-fallacy',
      biasName: 'Định kiến Trò chơi Tổng bằng Không (Zero-Sum Fallacy)',
      biasDescription:
        'Xu hướng tâm lý nhầm tưởng rằng thành công của bản thân bắt buộc phải đánh đổi bằng sự thất bại hoặc mất mát của người khác.',
    },
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
