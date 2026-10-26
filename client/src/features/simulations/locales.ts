import { Locale } from '@/i18n';

export interface LocalizedHypothesisOption {
  id: string;
  label: string;
  explanation: string;
}

export interface LocalizedSimulationData {
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  tags: string[];
  hypothesis?: {
    question: string;
    context: string;
    options: LocalizedHypothesisOption[];
    truthExplanation: string;
    biasName: string;
    biasDescription: string;
  };
}

export const SIMULATION_LOCALES: Record<string, Record<Locale, LocalizedSimulationData>> = {
  'birthday-paradox': {
    vi: {
      title: 'Nghịch lý Ngày sinh (Birthday Paradox)',
      subtitle: 'Sự va chạm xác suất trong không gian tổ hợp',
      summary:
        'Chỉ cần 23 người ngẫu nhiên trong một phòng, xác suất có ít nhất 2 người cùng ngày sinh đã vượt quá 50%; với 70 người, con số là 99.9%.',
      description:
        'Trực giác của chúng ta thường so sánh ngày sinh của chính mình với 22 người còn lại (chỉ có 22 phép thử). Nhưng thực tế, nghịch lý xem xét toàn bộ các cặp người có thể ghép đôi trong phòng: với 23 người, có tới 253 cặp đối sánh độc lập!',
      tags: ['Xác suất', 'Tổ hợp', 'Thống kê', 'Monte Carlo'],
      hypothesis: {
        question:
          'Theo trực giác tự nhiên của bạn, trong một phòng có 23 người ngẫu nhiên, cơ hội để có ít nhất 2 người trùng ngày sinh là bao nhiêu?',
        context:
          'Một năm có 365 ngày. Nhóm chỉ có 23 người (chiếm chưa đầy 6.3% số ngày trong năm).',
        options: [
          {
            id: 'opt-a',
            label: 'Rất hiếm gặp (< 10%)',
            explanation:
              'Trực giác tuyến tính so sánh 23 với 365, cho rằng cơ hội hai người trùng nhau là cực kỳ thấp.',
          },
          {
            id: 'opt-b',
            label: 'Xác suất vừa phải (20% – 30%)',
            explanation:
              'Cảm giác có khả năng xảy ra nhưng không thể vượt quá một nửa số trường hợp.',
          },
          {
            id: 'opt-c',
            label: 'Khoảng một nửa (~ 50%)',
            explanation:
              'Chính xác! 23 người tạo ra tới C(23, 2) = 253 cặp đối sánh, đẩy xác suất chạm mốc 50.73%.',
          },
          {
            id: 'opt-d',
            label: 'Gần như chắc chắn (> 80%)',
            explanation: 'Đoán quá cao so với quy mô nhóm 23 người (mốc 80% cần khoảng 35 người).',
          },
        ],
        truthExplanation:
          'Số cặp đối sánh trong phòng bùng nổ theo hàm bậc hai C(23, 2) = 253 cặp. Khi tích lũy xác suất độc lập của toàn bộ 253 cặp, cơ hội có ít nhất một cặp người trùng ngày sinh vượt qua ngưỡng 50%.',
        biasName: 'Bẫy Tư duy Tuyến tính (Linear Scaling Bias)',
        biasDescription:
          'Não bộ tiến hóa để so sánh quan hệ 1-1 (tôi với từng người) thay vì hình dung toàn bộ không gian tổ hợp O(n²).',
      },
    },
    en: {
      title: 'The Birthday Paradox',
      subtitle: 'Combinatorial probability collisions and quadratic pair scaling',
      summary:
        'With just 23 random people in a room, the probability that at least two share a birthday exceeds 50%; with 70 people, it reaches 99.9%.',
      description:
        'Human intuition naturally compares one’s own birthday against the other 22 people (only 22 checks). In reality, the paradox evaluates every possible pairwise combination in the room: 23 people generate 253 independent comparison pairs!',
      tags: ['Probability', 'Combinatorics', 'Statistics', 'Monte Carlo'],
      hypothesis: {
        question:
          'According to your natural intuition, in a room of 23 random people, what is the chance that at least two share a birthday?',
        context:
          'A year has 365 days. The group has only 23 people (less than 6.3% of the days in a year).',
        options: [
          {
            id: 'opt-a',
            label: 'Very rare (< 10%)',
            explanation:
              'Linear intuition traps us into comparing 23 against 365, assuming collision is extremely improbable.',
          },
          {
            id: 'opt-b',
            label: 'Moderate probability (20% – 30%)',
            explanation:
              'A feeling that it could happen, but surely not exceeding half of all random trials.',
          },
          {
            id: 'opt-c',
            label: 'About half (~ 50%)',
            explanation:
              'Exactly! 23 people generate C(23, 2) = 253 comparison pairs, pushing probability to 50.73%.',
          },
          {
            id: 'opt-d',
            label: 'Near certainty (> 80%)',
            explanation: 'Overestimated for a group of 23 (80% requires approximately 35 people).',
          },
        ],
        truthExplanation:
          'The number of pairwise comparisons grows quadratically as C(23, 2) = 253 pairs. Accumulating the complementary independent probabilities across all 253 pairs pushes the chance of at least one collision past the 50% threshold.',
        biasName: 'Linear Scaling Bias',
        biasDescription:
          'The human brain evolved to evaluate 1-to-1 relationships rather than visualizing the explosive combinatorial space of O(n²).',
      },
    },
  },
  'monty-hall': {
    vi: {
      title: 'Nghịch lý Monty Hall (The Monty Hall Problem)',
      subtitle: 'Lý thuyết xác suất có điều kiện và thông tin ẩn',
      summary:
        'Trò chơi 3 cánh cửa kinh điển: Hành động đổi cánh cửa sau khi người dẫn chương trình mở ra một con dê sẽ nhân đôi cơ hội chiến thắng của bạn.',
      description:
        'Monty Hall luôn biết con dê ở đâu và chủ ý mở cánh cửa có dê trong 2 cánh còn lại. Kiến thức của người dẫn chương trình chuyển toàn bộ xác suất 2/3 ban đầu vào cánh cửa chưa mở còn lại.',
      tags: ['Xác suất có điều kiện', 'Bayes', 'Lý thuyết quyết định'],
      hypothesis: {
        question:
          'Sau khi bạn chọn 1 cửa và MC mở ra 1 con dê, cơ hội chiến thắng của bạn sẽ ra sao nếu bạn ĐỔI sang cánh cửa còn lại?',
        context:
          'Còn lại đúng 2 cánh cửa đang đóng: 1 cửa chứa ô tô thể thao, 1 cửa chứa một chú dê.',
        options: [
          {
            id: 'opt-a',
            label: '50 / 50 (Giữ hay đổi đều như nhau)',
            explanation:
              'Ảo tưởng kinh điển: Vì chỉ còn 2 cánh cửa đóng nên bộ não tự động giả định cơ hội chia đều 50/50.',
          },
          {
            id: 'opt-b',
            label: 'Giữ nguyên tốt hơn (~ 66.7%)',
            explanation:
              'Hiệu ứng sở hữu tâm lý (Endowment Effect): Tin rằng trực giác đầu tiên của mình linh thiêng hơn.',
          },
          {
            id: 'opt-c',
            label: 'Đổi cửa nhân đôi cơ hội thắng (66.7%)',
            explanation:
              'Chính xác! Cửa ban đầu chỉ có 1/3 cơ hội. MC biết rõ và triệt tiêu con dê, dồn 2/3 xác suất sang cửa còn lại.',
          },
        ],
        truthExplanation:
          'Bạn chỉ thua khi đổi nếu đã chọn trúng ô tô ngay từ đầu (xác suất 1/3). Bạn thắng khi đổi nếu ban đầu đã chọn trúng dê (xác suất 2/3). Do đó, hành động đổi cửa mang lại chính xác 2/3 cơ hội chiến thắng.',
        biasName: 'Ảo tưởng Xác suất Đồng đều (Uniformity Fallacy)',
        biasDescription:
          'Bộ não bỏ qua thông tin điều kiện do hành động có chủ đích của người dẫn chương trình mang lại.',
      },
    },
    en: {
      title: 'The Monty Hall Problem',
      subtitle: 'Conditional probability, Bayes theorem, and host-revealed information',
      summary:
        'The classic 3-door game show: Switching your door after the host reveals a goat doubles your chances of winning the sports car.',
      description:
        'Monty Hall always knows where the goat is and deliberately opens a goat door among the remaining two. The host’s asymmetric knowledge transfers the entire 2/3 initial probability onto the remaining unopened door.',
      tags: ['Conditional Probability', 'Bayes Theorem', 'Decision Theory'],
      hypothesis: {
        question:
          'After you pick a door and the host reveals a goat behind another, what are your chances if you SWITCH to the remaining door?',
        context: 'Exactly two closed doors remain: one hides a sports car, the other hides a goat.',
        options: [
          {
            id: 'opt-a',
            label: '50 / 50 (Staying or switching is identical)',
            explanation:
              'Classic uniformity illusion: because two closed doors remain, intuition assumes a naive 50/50 split.',
          },
          {
            id: 'opt-b',
            label: 'Staying is better (~ 66.7%)',
            explanation:
              'Psychological endowment effect: believing that one’s initial intuition is inherently more reliable.',
          },
          {
            id: 'opt-c',
            label: 'Switching doubles your win rate (66.7%)',
            explanation:
              'Correct! Your initial door had only 1/3 probability. The host’s deliberate goat reveal concentrates the remaining 2/3 probability on the other door.',
          },
        ],
        truthExplanation:
          'You only lose by switching if you originally picked the car (1/3 probability). You win by switching whenever you initially picked a goat (2/3 probability). Therefore, switching guarantees exactly a 2/3 win rate.',
        biasName: 'Uniformity Fallacy',
        biasDescription:
          'The brain ignores the conditional Bayesian update resulting from the host’s purposeful, non-random action.',
      },
    },
  },
  'double-slit': {
    vi: {
      title: 'Thí nghiệm Hai khe Young (Double-Slit Experiment)',
      subtitle: 'Lưỡng tính sóng hạt và sự sụp đổ hàm sóng lượng tử',
      summary:
        'Khi từng photon đơn lẻ đi qua hai khe hẹp, chúng tạo ra vân giao thoa sóng. Nhưng nếu đặt máy dò quan sát, vân giao thoa biến mất ngay lập tức.',
      description:
        'Thí nghiệm chứng minh nền tảng của cơ học lượng tử: hạt vi mô hành xử như sóng xác suất cho đến khi chịu sự đo lường vật lý.',
      tags: ['Cơ học lượng tử', 'Quang học', 'Hàm sóng'],
      hypothesis: {
        question:
          'Nếu ta bắn từng hạt photon đơn lẻ một qua 2 khe hẹp (mỗi hạt bắn cách nhau vài giây), trên màn hứng sẽ xuất hiện hình ảnh gì sau 1.000 hạt?',
        context:
          'Chỉ có đúng 1 hạt bay trong buồng thí nghiệm tại một thời điểm. Hạt hoàn toàn không thể va chạm vật lý với bất kỳ hạt nào khác.',
        options: [
          {
            id: 'opt-a',
            label: 'Hai dải vạch thẳng song song (như ném bi qua 2 khe)',
            explanation:
              'Trực giác cơ học cổ điển: Cho rằng hạt là vật thể rắn, chỉ có thể bay qua khe trái hoặc khe phải nên tạo thành 2 dải vạch.',
          },
          {
            id: 'opt-b',
            label: 'Các hạt phân tán hỗn loạn ngẫu nhiên không có quy luật',
            explanation:
              'Cảm giác chuyển động nhiệt ngẫu nhiên: Cho rằng hạt lượng tử bay hỗn loạn như phân tử khí.',
          },
          {
            id: 'opt-c',
            label: 'Vẫn xuất hiện hệ vân giao thoa sóng sáng tối rõ rệt',
            explanation:
              'Chính xác tuyệt đối! Mỗi hạt tự đi qua cả 2 khe cùng lúc dưới dạng sóng xác suất và tự giao thoa với chính nó, tích lũy dần thành vân giao thoa!',
          },
          {
            id: 'opt-d',
            label: 'Màn hứng hoàn toàn tối đen vì các hạt tự triệt tiêu',
            explanation:
              'Hiểu lầm về sự triệt tiêu: Sự giao thoa không làm biến mất năng lượng mà chỉ tái phân bố xác suất không gian.',
          },
        ],
        truthExplanation:
          'Ngay cả khi chỉ có 1 hạt duy nhất, hàm sóng Schrödinger của nó lan truyền qua cả hai khe đồng thời. Các điểm va chạm tích tụ theo mật độ xác suất I(y) tạo nên vân giao thoa hoàn hảo — trừ khi bạn đặt máy quan sát!',
        biasName: 'Định kiến Cơ học Cổ điển (Classical Particle Fallacy)',
        biasDescription:
          'Não bộ người quen với thế giới vĩ mô (ném bi, quả bóng) nên không thể tự nhiên hình dung được trạng thái chồng chập lượng tử vừa là sóng vừa là hạt.',
      },
    },
    en: {
      title: 'Young’s Double-Slit Experiment',
      subtitle: 'Wave-particle duality and quantum wave function collapse',
      summary:
        'When individual photons pass through two narrow slits one by one, they build an interference pattern. But if a detector observes which slit each passes through, the interference vanishes instantly.',
      description:
        'The foundational experiment of quantum mechanics: microscopic particles behave as probability waves until subjected to physical measurement.',
      tags: ['Quantum Mechanics', 'Optics', 'Wave Function'],
      hypothesis: {
        question:
          'If single photons are fired one at a time through two narrow slits (seconds apart), what pattern will appear on the detector screen after 1,000 photons?',
        context:
          'Only one photon is in the chamber at any given moment. Particles cannot physically collide with each other.',
        options: [
          {
            id: 'opt-a',
            label: 'Two parallel bands (like throwing marbles through 2 slits)',
            explanation:
              'Classical mechanics intuition: assumes particles are rigid bodies that can only pass through one slit or the other.',
          },
          {
            id: 'opt-b',
            label: 'Random chaotic dispersion with no order',
            explanation:
              'Thermal motion intuition: assuming quantum particles scatter chaotically like gas molecules.',
          },
          {
            id: 'opt-c',
            label: 'A distinct wave interference pattern of bright and dark fringes',
            explanation:
              'Absolute truth! Each particle travels through both slits as a superposition probability wave and interferes with itself!',
          },
          {
            id: 'opt-d',
            label: 'Screen remains dark due to self-cancellation',
            explanation:
              'Destructive interference misconception: interference redistributes probability density rather than destroying energy.',
          },
        ],
        truthExplanation:
          'Even with a single particle, its Schrödinger wave function propagates through both slits simultaneously. Impact points accumulate according to probability density I(y) to produce an interference pattern — unless an observer measures which slit it traverses!',
        biasName: 'Classical Particle Fallacy',
        biasDescription:
          'Human intuition evolved in a macroscopic realm and struggles to conceive quantum superposition where entities exhibit simultaneous wave and particle nature.',
      },
    },
  },
  'prisoners-dilemma': {
    vi: {
      title: 'Thế lưỡng nan của người tù (Prisoner’s Dilemma)',
      subtitle: 'Cân bằng Nash và sự tiến hóa của lòng vị tha có điều kiện',
      summary:
        'Hai tù nhân bị thẩm vấn riêng: nếu cả hai cùng phản bội, cả hai chịu án nặng hơn so với việc cả hai cùng giữ im lặng hợp tác.',
      description:
        'Nền tảng của lý thuyết trò chơi ứng dụng trong kinh tế học, tiến hóa sinh học và đạo đức học. Giải đấu Axelrod chỉ ra chiến lược Tit-for-Tat đem lại hiệu quả bền vững nhất.',
      tags: ['Lý thuyết trò chơi', 'Cân bằng Nash', 'Tiến hóa chiến lược'],
      hypothesis: {
        question:
          'Trong một giải đấu lặp lại nhiều vòng (Iterated Prisoner’s Dilemma) với các đối thủ đa dạng, chiến lược nào sẽ đạt tổng điểm trung bình cao nhất và chiếm lĩnh quần thể?',
        context:
          'Mỗi cá thể thi đấu nhiều ván với mọi cá thể khác. Điểm số tích lũy quyết định số lượng con cháu ở thế hệ tiếp theo (Replicator Dynamics).',
        options: [
          {
            id: 'opt-a',
            label: 'Luôn phản bội (Always Defect) — Tối ưu điểm số tức thì trong mọi hoàn cảnh',
            explanation:
              'Bẫy cận thị ngắn hạn: Trong 1 ván đơn lẻ phản bội luôn có lợi hơn, nhưng trong trò chơi lặp lại, hai kẻ phản bội gặp nhau chỉ nhận 1 điểm mỗi ván và nhanh chóng bị đào thải.',
          },
          {
            id: 'opt-b',
            label:
              'Ăn miếng trả miếng (Tit-for-Tat) — Khởi đầu hợp tác, sau đó sao chép nước đi của đối phương',
            explanation:
              'Chính xác xuất sắc! Chiến lược đơn giản này bất bại qua hàng trăm giải đấu nhờ 4 phẩm chất: Lương thiện, Sòng phẳng, Khoan dung và Rõ ràng.',
          },
          {
            id: 'opt-c',
            label: 'Luôn hợp tác (Always Cooperate) — Vị tha vô điều kiện',
            explanation:
              'Ngây thơ sinh học: Cá thể luôn hợp tác dễ dàng bị những kẻ bóc lột (Always Defect) khai thác đến kiệt quệ và tuyệt chủng.',
          },
          {
            id: 'opt-d',
            label: 'Kẻ ghi thù (Grudger) — Hợp tác đến khi bị phản bội 1 lần thì trả thù vĩnh viễn',
            explanation:
              'Thiếu lòng khoan dung: Nếu chỉ có một hiểu lầm hoặc nhiễu ngẫu nhiên, mối quan hệ sẽ rơi vào vòng xoáy hận thù vĩnh viễn không thể phục hồi.',
          },
        ],
        truthExplanation:
          'Nghiên cứu kinh điển của Robert Axelrod chứng minh rằng trong tương tác lặp lại dài hạn, lòng vị tha có điều kiện (Win-Win) luôn đánh bại sự ích kỷ thuần túy (Zero-Sum). Tit-for-Tat không bao giờ kiếm được nhiều điểm hơn đối thủ trong một trận đơn lẻ, nhưng luôn đạt tổng điểm cao nhất toàn giải đấu!',
        biasName: 'Định kiến Trò chơi Tổng bằng Không (Zero-Sum Fallacy)',
        biasDescription:
          'Xu hướng tâm lý nhầm tưởng rằng thành công của bản thân bắt buộc phải đánh đổi bằng sự thất bại hoặc mất mát của người khác.',
      },
    },
    en: {
      title: 'The Prisoner’s Dilemma',
      subtitle: 'Nash Equilibrium and the evolution of conditional cooperation',
      summary:
        'Two prisoners interrogated separately: if both defect, both suffer heavier penalties than if both cooperated by remaining silent.',
      description:
        'The cornerstone of game theory with deep applications in economics, evolutionary biology, and ethics. Robert Axelrod’s tournaments proved Tit-for-Tat to be the most robust evolutionary strategy.',
      tags: ['Game Theory', 'Nash Equilibrium', 'Strategy Evolution'],
      hypothesis: {
        question:
          'In an Iterated Prisoner’s Dilemma tournament against diverse opponents, which strategy achieves the highest average score and dominates the population?',
        context:
          'Each agent plays multiple rounds against every opponent. Accumulated payoff determines offspring count in subsequent generations via replicator dynamics.',
        options: [
          {
            id: 'opt-a',
            label: 'Always Defect — Maximizes immediate score in every single round',
            explanation:
              'Short-sighted trap: while defecting is dominant in a single game, mutual defectors earn only 1 point per round and quickly go extinct.',
          },
          {
            id: 'opt-b',
            label: 'Tit-for-Tat — Start cooperative, then mimic opponent’s previous move',
            explanation:
              'Brilliantly correct! This simple strategy proved unbeatable across hundreds of tournaments due to 4 traits: Nice, Retaliatory, Forgiving, and Clear.',
          },
          {
            id: 'opt-c',
            label: 'Always Cooperate — Unconditional altruism',
            explanation:
              'Evolutionary naivety: pure cooperators are easily exploited by defectors and driven to extinction.',
          },
          {
            id: 'opt-d',
            label: 'Grudger — Cooperate until betrayed once, then defect forever',
            explanation:
              'Lacks forgiveness: a single noise perturbation sends the interaction into an irreversible death spiral of mutual betrayal.',
          },
        ],
        truthExplanation:
          'Robert Axelrod’s landmark tournaments demonstrated that under repeated interaction with a shadow of the future, conditional altruism (win-win) consistently outperforms ruthless selfishness. Tit-for-Tat never defeats an opponent in a single head-to-head match, yet reliably wins tournaments overall!',
        biasName: 'Zero-Sum Fallacy',
        biasDescription:
          'The cognitive mistake of assuming that any player’s gain must inherently come at the expense of an opponent’s loss.',
      },
    },
  },
  'zeno-paradox': {
    vi: {
      title: 'Nghịch lý Zeno: Achilles và Rùa (Zeno Paradox)',
      subtitle: 'Chuỗi hội tụ vô hạn và tính liên tục của không thời gian',
      summary:
        'Chiến binh Achilles dẫu chạy nhanh gấp 10 lần con rùa nhưng theo Zeno sẽ không bao giờ đuổi kịp vì khoảng cách liên tục bị chia đôi vô tận.',
      description:
        'Nghịch lý triết học Hy Lạp cổ đại đặt nền móng cho giải tích hiện đại, định nghĩa giới hạn và tính chất topo của không thời gian thực tế.',
      tags: ['Giải tích', 'Nghịch lý', 'Triết học', 'Chuỗi vô hạn'],
      hypothesis: {
        question:
          'Nếu khoảng cách giữa Achilles và Rùa bị chia thành vô số (vô hạn) chặng nhỏ kế tiếp nhau, thì tổng thời gian Achilles cần để hoàn thành vô hạn chặng đó là bao nhiêu?',
        context:
          'Mỗi chặng sau có độ dài bằng 1/10 chặng trước. Vận tốc của Achilles và Rùa giữ nguyên liên tục không đổi.',
        options: [
          {
            id: 'opt-a',
            label: 'Vô hạn thời gian — Vì tổng của vô số bước thì không bao giờ kết thúc',
            explanation:
              'Ảo tưởng phân kỳ: Mặc định rằng cứ có vô số số hạng thì tổng phải bằng vô cùng, bỏ qua việc độ dài mỗi bước co lại với tốc độ cấp số nhân.',
          },
          {
            id: 'opt-b',
            label:
              'Hữu hạn thời gian — Tổng của vô hạn số hạng nhỏ dần có thể hội tụ về một con số hữu hạn duy nhất',
            explanation:
              'Chính xác xuất sắc! Nền tảng của Vi tích phân (Calculus) chứng minh chuỗi cấp số nhân lùi vô hạn với công bội r < 1 luôn hội tụ về một đại lượng hữu hạn.',
          },
          {
            id: 'opt-c',
            label: 'Thời gian ngừng trôi — Khi khoảng cách tiến về 0, chuyển động bị đóng băng',
            explanation:
              'Ngộ nhận của trường phái Elea: Zeno nhầm lẫn giữa sự phân chia toán học trên lý thuyết với dòng chảy thực tế liên tục của thời gian vật lý.',
          },
          {
            id: 'opt-d',
            label: 'Không xác định được — Vì toán học và thế giới vật chất không tương thích',
            explanation:
              'Tư duy hoài nghi cổ đại: Cho rằng chuyển động chỉ là ảo ảnh thị giác (Parmenides).',
          },
        ],
        truthExplanation:
          'Nghịch lý Zeno được giải quyết hoàn toàn nhờ phép tính vi tích phân: Tổng của một chuỗi vô hạn các khoảng thời gian co lại theo cấp số nhân là một đại lượng hữu hạn xác định. Achilles vượt qua Rùa chỉ sau hơn 11 giây.',
        biasName: 'Ảo tưởng Phân kỳ Vô hạn (Infinite Sum Divergence Fallacy)',
        biasDescription:
          'Não bộ con người thường mặc định rằng hễ cộng vô số thứ lại với nhau thì kết quả bắt buộc phải là vô cực, mà không nhận ra các khoảng vô hạn nhỏ có thể lấp đầy một khoảng thời gian hữu hạn.',
      },
    },
    en: {
      title: 'Zeno’s Paradox: Achilles & the Tortoise',
      subtitle: 'Infinite convergent series, calculus, and the continuum of spacetime',
      summary:
        'Achilles runs ten times faster than the tortoise, yet philosopher Zeno argued he can never overtake it because distance is infinitely subdivided.',
      description:
        'Ancient Greek philosophical paradox that laid the groundwork for modern calculus, limits, and the topology of physical spacetime.',
      tags: ['Calculus', 'Paradox', 'Philosophy', 'Infinite Series'],
      hypothesis: {
        question:
          'If the distance between Achilles and the Tortoise is divided into infinitely many sequential sub-intervals, what is the total time Achilles requires to complete them?',
        context:
          'Each subsequent interval is 1/10 the length of the previous. Achilles and Tortoise maintain constant velocities.',
        options: [
          {
            id: 'opt-a',
            label: 'Infinite time — Summing infinite intervals can never terminate',
            explanation:
              'Divergence illusion: assuming that infinitely many terms must sum to infinity, ignoring that intervals shrink exponentially.',
          },
          {
            id: 'opt-b',
            label:
              'Finite time — Sum of an infinite geometric progression converges to a single finite value',
            explanation:
              'Brilliantly correct! Calculus proves that infinite geometric series with ratio r < 1 converge to a strictly finite limit.',
          },
          {
            id: 'opt-c',
            label: 'Time stops — As distance approaches zero, motion freezes',
            explanation:
              'Eleatic school fallacy: confusing mathematical abstraction with physical time continuity.',
          },
          {
            id: 'opt-d',
            label: 'Indeterminate — Mathematics and physical reality are incompatible',
            explanation:
              'Skeptical nihilism: asserting motion is merely a sensory illusion (Parmenides).',
          },
        ],
        truthExplanation:
          'Zeno’s paradox is fully resolved by modern calculus: an infinite series of shrinking time intervals converges to a well-defined finite duration. Achilles overtakes the tortoise in approximately 11.11 seconds.',
        biasName: 'Infinite Sum Divergence Fallacy',
        biasDescription:
          'The intuition that summing infinitely many items must always blow up to infinity, failing to grasp convergence to a finite value.',
      },
    },
  },
  'art-gallery': {
    vi: {
      title: 'Bài toán Người gác Phòng trưng bày (Art Gallery Problem)',
      subtitle: 'Định lý Chvátal, tam giác hóa Steve Fisk và bài toán tối ưu NP-hard',
      summary:
        'Trong một căn phòng đa giác bất kỳ gồm n bức tường (lồi hoặc lõm ngoằn ngoèo), luôn luôn chỉ cần tối đa ⌊n/3⌋ người gác để quan sát trọn vẹn 100% diện tích mà không bị che khuất.',
      description:
        'Định lý kinh điển được Václav Chvátal chứng minh năm 1975 và Steve Fisk đưa ra lời giải hình học tuyệt đẹp năm 1978 bằng tam giác hóa và tô 3 màu. Mặc dù chặn trên luôn là ⌊n/3⌋, nhưng bài toán tìm số lính tối thiểu tuyệt đối cho một bản vẽ phòng cụ thể lại là bài toán NP-hard.',
      tags: ['Hình học tính toán', 'Định lý Chvátal', 'Tam giác hóa', 'Tô 3 màu', 'NP-hard'],
      hypothesis: {
        question:
          'Trong trường hợp xấu nhất của căn phòng đa giác đơn n đỉnh (nhiều ngách nhọn che khuất), cần tối đa bao nhiêu người gác để chắc chắn quan sát trọn vẹn 100% diện tích?',
        context:
          'Căn phòng có n bức tường thẳng liên tiếp khép kín, không tự cắt. Người gác đứng yên tại các đỉnh hoặc bên trong phòng.',
        options: [
          {
            id: 'opt-a',
            label: 'Khoảng một nửa số đỉnh (~ n/2)',
            explanation:
              'Đánh giá quá cao số người cần thiết do nghĩ rằng mỗi góc nhọn cần 1 người riêng biệt.',
          },
          {
            id: 'opt-b',
            label: 'Đúng ⌊n/3⌋ người gác (Khoảng 1/3 số đỉnh)',
            explanation:
              'Chính xác xuất sắc! Định lý Chvátal chứng minh ⌊n/3⌋ người luôn luôn đủ và đôi khi là bắt buộc (như phòng hình răng lược).',
          },
          {
            id: 'opt-c',
            label: 'Khoảng 1/4 số đỉnh (~ n/4)',
            explanation:
              'Ngưỡng ⌊n/4⌋ chỉ áp dụng cho phòng trực giao (chỉ gồm các bức tường vuông góc 90 độ), không đủ cho phòng có góc nhọn.',
          },
          {
            id: 'opt-d',
            label: 'Chỉ cần đúng 1 người nếu chọn góc đặt khéo léo',
            explanation:
              'Ngộ nhận hình lồi: Chỉ căn phòng lồi mới cần 1 người. Các góc lõm và ngách sâu sẽ tạo ra nhiều góc chết không thể nhìn thấy chỉ từ 1 điểm.',
          },
        ],
        truthExplanation:
          'Định lý Chvátal (1975) và chứng minh tuyệt đẹp của Steve Fisk (1978) sử dụng phương pháp tam giác hóa và tô 3 màu để chứng minh rằng ⌊n/3⌋ người luôn luôn đủ để bao quát mọi ngóc ngách của bất kỳ đa giác n đỉnh nào.',
        biasName: 'Ngộ Nhận Tính Lồi & Bẫy Góc Chết (Convexity Illusion)',
        biasDescription:
          'Xu hướng tâm lý đánh giá thấp số góc chết trong không gian đa giác lõm phức tạp, hoặc ngược lại đánh giá quá cao số người cần vì không nhận ra mỗi người có thể nhìn thấy nhiều tam giác cùng lúc.',
      },
    },
    en: {
      title: 'The Art Gallery Problem',
      subtitle: 'Chvátal Theorem, Steve Fisk triangulation, and NP-hard optimization',
      summary:
        'In any arbitrary polygon room with n walls, at most ⌊n/3⌋ stationary guards are always sufficient to monitor 100% of the interior space.',
      description:
        'Proven by Václav Chvátal in 1975 with a stunning geometric proof by Steve Fisk in 1978 via polygon triangulation and 3-coloring. While the upper bound is ⌊n/3⌋, finding the minimum guards for a specific polygon is NP-hard.',
      tags: ['Computational Geometry', 'Chvátal Theorem', 'Triangulation', '3-Coloring', 'NP-hard'],
      hypothesis: {
        question:
          'In the worst-case scenario of an n-vertex simple polygon room, at most how many stationary guards are needed to guarantee 100% visual coverage?',
        context:
          'The room has n straight closed walls without self-intersections. Guards are stationed at vertices or interior points.',
        options: [
          {
            id: 'opt-a',
            label: 'About half the vertices (~ n/2)',
            explanation:
              'Overestimating requirement by assuming every reflex pocket requires a dedicated guard.',
          },
          {
            id: 'opt-b',
            label: 'Exactly ⌊n/3⌋ guards (approximately one third of vertices)',
            explanation:
              'Brilliantly correct! Chvátal Theorem proves ⌊n/3⌋ guards are always sufficient and occasionally necessary (like comb-shaped galleries).',
          },
          {
            id: 'opt-c',
            label: 'About one fourth (~ n/4)',
            explanation:
              '⌊n/4⌋ only applies to orthogonal galleries (with 90° walls), insufficient for arbitrary acute polygons.',
          },
          {
            id: 'opt-d',
            label: 'Only 1 guard if positioned strategically',
            explanation:
              'Convex room illusion: only strictly convex polygons require 1 guard; reflex angles cause blind pockets.',
          },
        ],
        truthExplanation:
          'Chvátal’s Theorem (1975) and Steve Fisk’s elegant proof (1978) utilize polygon triangulation and 3-coloring to prove that ⌊n/3⌋ guards always suffice to monitor every nook and cranny of any n-gon.',
        biasName: 'Convexity Illusion',
        biasDescription:
          'The cognitive tendency to underestimate blind spots in non-convex spaces, or overestimate guards needed by overlooking triangular sightlines.',
      },
    },
  },
  'prisoners-hats': {
    vi: {
      title: 'Bài toán Đội mũ & Bit Chẵn lẻ (Prisoners Hat Puzzle)',
      subtitle: 'Lý thuyết thông tin, mã sửa sai và chiến thuật suy luận hợp tác',
      summary:
        'Với 10 người đội mũ 2 màu đứng thành hàng, bằng cách hy sinh người cuối cùng phát tín hiệu Parity bit, 9 người còn lại được bảo đảm chắc chắn 100% đoán đúng màu mũ của mình.',
      description:
        'Bài toán kinh điển minh họa sức mạnh của lý thuyết thông tin và mã kiểm tra chẵn lẻ (Parity Bit). Khi chuyển hóa các phán đoán độc lập thành hệ phương trình đồng dư trên trường nhị phân F2, thông tin được trừ lùi tuần tự giúp giải cứu đồng đội.',
      tags: [
        'Lý thuyết thông tin',
        'Parity Bit',
        'Mã sửa sai',
        'Logic hợp tác',
        'XOR',
        'Monte Carlo',
      ],
      hypothesis: {
        question:
          'Trong bài toán 10 người đội mũ 2 màu (mỗi người chỉ thấy người trước mặt, nghe người sau hô), chiến thuật tối ưu nhất có thể bảo đảm chắc chắn bao nhiêu người đoán đúng?',
        context:
          '10 người xếp hàng dọc, mũ Đen/Trắng ngẫu nhiên 50/50. Người thứ 10 hô trước tiên, chỉ được nói một từ màu mũ.',
        options: [
          {
            id: 'opt-a',
            label: 'Khoảng 5 người (~ 50% vì mũ ngẫu nhiên độc lập)',
            explanation:
              'Bẫy tư duy ngộ nhận tính độc lập: cho rằng không thấy mũ mình thì chỉ có thể đoán mò 50/50.',
          },
          {
            id: 'opt-b',
            label: 'Khoảng 7-8 người nếu ghi nhớ tốt',
            explanation:
              'Đoán dựa trên cảm tính xác suất nhưng chưa nhận ra cấu trúc đại số của mã chẵn lẻ.',
          },
          {
            id: 'opt-c',
            label: 'Chắc chắn đúng 9 người (người cuối cùng hy sinh làm bit kiểm tra)',
            explanation:
              'Chính xác xuất sắc! Người thứ 10 dùng lượt hô để phát đi tính chẵn lẻ của 9 người phía trước, giúp 9 người còn lại giải mã hoàn hảo 100%.',
          },
          {
            id: 'opt-d',
            label: 'Có thể cứu được cả 10 người 100%',
            explanation:
              'Không thể bảo đảm 10 người vì người thứ 10 không nhận được bất kỳ thông tin nào về chiếc mũ của chính mình.',
          },
        ],
        truthExplanation:
          'Người thứ 10 không có thông tin về mũ của mình nên chỉ có 50% cơ hội đúng, nhưng lời hô của người này đóng vai trò là một Parity Checksum. Nhờ đó, toàn bộ 9 người còn lại đều suy ra chính xác 100% màu mũ của mình.',
        biasName: 'Ảo Tưởng Tính Độc Lập Biến Cố (Independence Fallacy)',
        biasDescription:
          'Xu hướng mặc định rằng vì các chiếc mũ được đội ngẫu nhiên độc lập nên xác suất đoán đúng của mỗi cá nhân cũng hoàn toàn độc lập, bỏ qua khả năng truyền tin và mã hóa thông tin hợp tác.',
      },
    },
    en: {
      title: 'The Prisoners & Hats Puzzle',
      subtitle: 'Information theory, error-correcting codes, and cooperative deductive logic',
      summary:
        'With 10 prisoners wearing 2-color hats in a single file line, having the last person sacrifice their turn to broadcast a parity bit guarantees that all 9 remaining prisoners guess their hat color with 100% certainty.',
      description:
        'A classic riddle demonstrating information theory and parity checksums. By formulating independent guesses into modular arithmetic equations over binary field F2, sequential backward substitution guarantees 9 out of 10 survive.',
      tags: [
        'Information Theory',
        'Parity Bit',
        'Error Correction',
        'Cooperative Logic',
        'XOR',
        'Monte Carlo',
      ],
      hypothesis: {
        question:
          'In the 10-prisoner, 2-hat color puzzle (each only sees people ahead and hears people behind), what is the maximum guaranteed number of correct guesses under optimal strategy?',
        context:
          '10 prisoners line up in single file with random 50/50 Black/White hats. Prisoner 10 speaks first, strictly uttering one color name.',
        options: [
          {
            id: 'opt-a',
            label: 'About 5 prisoners (~ 50% because hats are independently random)',
            explanation:
              'Independence fallacy: assuming that without seeing one’s own hat, one can only make a 50/50 blind guess.',
          },
          {
            id: 'opt-b',
            label: 'Around 7-8 prisoners with good memory',
            explanation:
              'Intuitive probabilistic estimate that overlooks the exact algebraic parity structure.',
          },
          {
            id: 'opt-c',
            label: 'Guaranteed 9 prisoners (the last person sacrifices their turn as parity check)',
            explanation:
              'Brilliantly correct! Prisoner 10 broadcasts the parity of the 9 hats ahead, allowing the remaining 9 to decode with 100% precision.',
          },
          {
            id: 'opt-d',
            label: 'All 10 prisoners can be 100% guaranteed',
            explanation:
              'Impossible because Prisoner 10 receives zero information about their own hat.',
          },
        ],
        truthExplanation:
          'Prisoner 10 has no information about their own hat (50% random chance), but their shout serves as a broadcast Parity Checksum. Consequently, all 9 remaining prisoners deductively reconstruct their own hat color with 100% certainty.',
        biasName: 'Independence Fallacy',
        biasDescription:
          'The cognitive trap of assuming that because hat assignments are independent, correct guesses must be independent, ignoring cooperative information encoding.',
      },
    },
  },
};
