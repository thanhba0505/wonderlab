import { EditorialArticle } from '@/types';

export const ESSAYS: EditorialArticle[] = [
  {
    id: 'intuition-failure',
    slug: 'vi-sao-truc-giac-sai-lam-truoc-xac-suat',
    issueNumber: '01',
    title: 'Vì sao trực giác của bộ não thường xuyên sai lầm trước xác suất?',
    subtitle: 'Ảo giác nhận thức và thiên kiến sinh tồn',
    readTimeMinutes: 5,
    publishedDate: '2026-10-20',
    category: 'probability',
    categoryLabel: 'Xác suất & Nhận thức',
    teaser:
      'Bộ não người được tiến hóa để nhận diện mô hình nguy hiểm tức thời trên thảo nguyên, không phải để tính toán phân phối Poisson hay cập nhật Bayes. Khi đối mặt với xác suất có điều kiện, trực giác thường đưa ra câu trả lời sai hoàn toàn.',
    quote: 'Toán học là công cụ giải phóng con người khỏi những ngộ nhận của chính các giác quan.',
    quoteAuthor: 'Phòng Nghiên cứu Nhận thức Wonderlab',
    sections: [
      {
        id: 'evolutionary-bias',
        heading: 'Chiếc bẫy tiến hóa trên thảo nguyên cổ đại',
        paragraphs: [
          'Hàng triệu năm tiến hóa của loài vượn người Homo sapiens diễn ra trong môi trường mà phản xạ nhanh quyết định sự sống còn. Nếu nghe thấy tiếng sột soạt trong lùm cỏ, giả định rằng có một con thú dữ và lập tức bỏ chạy là chiến lược sinh tồn tối ưu — kể cả khi 99% trường hợp đó chỉ là ngọn gió vô hại.',
          'Cơ chế nhận diện mẫu hình thiên lệch này (patternicity) giúp tổ tiên chúng ta sống sót, nhưng lại để lại một di sản nhận thức phiền toái trong kỷ nguyên hiện đại: chúng ta luôn tìm kiếm trật tự và ý nghĩa nhân quả ngay cả trong những biến cố hoàn toàn ngẫu nhiên.',
        ],
        callout: {
          type: 'insight',
          title: 'Thiên kiến Quy nạp Tuyến tính',
          text: 'Não bộ người vốn dĩ xử lý rất tốt các hàm số tuyến tính (1 quả táo + 1 quả táo = 2 quả táo), nhưng hoàn toàn tê liệt khi đối mặt với hàm mũ, tổ hợp rời rạc và xác suất nghịch đảo.',
        },
      },
      {
        id: 'birthday-paradox-trap',
        heading: 'Ảo giác số học: Vì sao 23 người là đủ?',
        paragraphs: [
          'Một trong những minh chứng kinh điển cho sự mù lòa xác suất của trực giác là Nghịch lý Ngày sinh (Birthday Paradox). Khi được hỏi: "Cần bao nhiêu người trong một phòng để xác suất có ít nhất 2 người trùng ngày sinh đạt trên 50%?", phần lớn mọi người đưa ra con số trên 180 — một nửa số ngày trong năm.',
          'Thực tế toán học chỉ ra con số chỉ là 23. Sai lầm của trực giác bắt nguồn từ việc chúng ta vô thức so sánh ngày sinh của chính mình với 22 người còn lại (22 phép so sánh), thay vì nhận ra bài toán yêu cầu so sánh mọi cặp đôi có thể tạo ra giữa 23 người: C(23, 2) = 253 phép thử độc lập.',
        ],
        callout: {
          type: 'simulation-link',
          simulationSlug: 'birthday-paradox',
          simulationTitle: 'Thử nghiệm Nghịch lý Ngày Sinh',
          text: 'Trải nghiệm trực quan thuật toán Monte Carlo với 23 người ngẫu nhiên để thấy tần suất trùng hợp vượt qua 50%.',
        },
      },
      {
        id: 'conditional-probability-monty-hall',
        heading: 'Xác suất có điều kiện và cú sốc Monty Hall',
        paragraphs: [
          'Nếu bài toán ngày sinh làm ta bối rối về tổ hợp, thì Nghịch lý Monty Hall là đòn giáng trực diện vào trực giác về xác suất có điều kiện. Sau khi bạn chọn một trong 3 cánh cửa, người dẫn chương trình mở ra một con dê ở cánh cửa còn lại và cho bạn cơ hội đổi lựa chọn.',
          'Hầu như trực giác của mọi người — kể cả nhiều tiến sĩ toán học từng gửi thư phản đối Marilyn vos Savant năm 1990 — đều quả quyết xác suất lúc này là 50/50 vì chỉ còn 2 cánh cửa đóng. Nhưng thực tế, hành động mở cửa của người dẫn chương trình không ngẫu nhiên: ông ta luôn tránh chiếc xe hơi và cửa bạn đã chọn.',
          'Bằng cách gom toàn bộ 2/3 xác suất ban đầu của hai cánh cửa chưa chọn vào cánh cửa còn lại duy nhất, quyết định đổi cửa sẽ tăng gấp đôi cơ hội chiến thắng của bạn từ 1/3 lên 2/3.',
        ],
        callout: {
          type: 'quote',
          text: 'Khi bạn không hiểu quy luật của ngẫu nhiên, bạn sẽ nhìn đâu cũng thấy phép màu hoặc âm mưu.',
          author: 'Leonard Mlodinow, The Drunkard’s Walk',
        },
      },
      {
        id: 'conclusion-new-intuition',
        heading: 'Rèn luyện trực giác toán học mới',
        paragraphs: [
          'Không ai sinh ra với trực giác xác suất hoàn hảo. Trực giác là kết quả của việc tích lũy kinh nghiệm qua hàng ngàn lần tương tác với thế giới vật lý.',
          'Để không bị đánh lừa bởi xác suất, chúng ta không thể chỉ dựa vào cảm tính. Chúng ta cần những công cụ tính toán giải tích và các mô phỏng máy tính trực quan để tận mắt chứng kiến Luật số lớn (Law of Large Numbers) vận hành trong thực tế.',
        ],
      },
    ],
    linkedSimulations: [
      {
        slug: 'monty-hall',
        title: 'Nghịch lý Ba Cánh Cửa (Monty Hall)',
        description: 'Tự tay chọn cửa, đổi quyết định và theo dõi tỷ lệ thắng hội tụ về 66.7%.',
        badge: 'Xác suất có điều kiện',
      },
      {
        slug: 'birthday-paradox',
        title: 'Nghịch lý Ngày Sinh (Birthday Paradox)',
        description: 'Khám phá sự bùng nổ tổ hợp với 23 cá nhân ngẫu nhiên trong phòng.',
        badge: 'Tổ hợp & Xác suất',
      },
    ],
  },
  {
    id: 'paradox-power',
    slug: 'mot-nghich-ly-thay-doi-cach-tu-duy',
    issueNumber: '02',
    title: 'Một nghịch lý có thể thay đổi cách chúng ta tư duy như thế nào?',
    subtitle: 'Từ khủng hoảng nền tảng đến bước nhảy vọt khoa học',
    readTimeMinutes: 7,
    publishedDate: '2026-10-22',
    category: 'paradox',
    categoryLabel: 'Nghịch lý & Triết học',
    teaser:
      'Mỗi khi một nghịch lý xuất hiện trong lịch sử toán học — như Nghịch lý Russell trong lý thuyết tập hợp hay Nghịch lý EPR trong cơ học lượng tử — đó không phải là dấu chấm hết, mà là phát súng mở màn cho một hệ tiên đề sâu sắc hơn.',
    quote:
      'Nghịch lý không phải là sai lầm; nghịch lý là tấm gương phản chiếu giới hạn của hệ thống tư duy hiện hành.',
    quoteAuthor: 'Hệ Tiên Đề & Siêu Toán Học',
    sections: [
      {
        id: 'nature-of-paradox',
        heading: 'Nghịch lý: Khi logic tự cắn vào đuôi mình',
        paragraphs: [
          'Trong ngôn ngữ đời thường, từ "nghịch lý" thường bị hiểu nhầm là một sự mâu thuẫn vô lý hoặc một ngụy biện sai lầm. Nhưng trong triết học khoa học, một nghịch lý đích thực là một kết luận tưởng chừng hoàn toàn phi lý nhưng lại được dẫn xuất chặt chẽ từ những tiền đề tưởng chừng hiển nhiên đúng.',
          'Chính khoảng cách nghẹt thở giữa "tiền đề hiển nhiên" và "kết luận phi lý" này buộc các nhà khoa học phải đặt câu hỏi về những giả định sâu kín nhất mà trước đó không ai dám nghi ngờ.',
        ],
        callout: {
          type: 'insight',
          title: 'Ý nghĩa của sự bế tắc',
          text: 'Một cuộc khủng hoảng nền tảng không bao giờ phá hủy khoa học; nó chỉ phá hủy sự ngây thơ của những giả định cũ để nhường chỗ cho một hệ tiên đề vững chắc hơn.',
        },
      },
      {
        id: 'zeno-and-calculus',
        heading: 'Achilles và rùa: Đốm lửa khai sinh Giải tích',
        paragraphs: [
          'Khoảng thế kỷ thứ 5 TCN, Zeno xứ Elea đưa ra nghịch lý nổi tiếng: Chiến binh dũng mãnh Achilles chạy nhanh gấp 10 lần con rùa nhưng không bao giờ đuổi kịp nó nếu rùa được chấp một quãng đường xuất phát ban đầu.',
          'Lý lẽ của Zeno: Để bắt kịp rùa, Achilles phải đến được điểm xuất phát của rùa; khi anh đến đó, rùa đã nhích thêm một đoạn; khi anh vượt qua đoạn đó, rùa lại nhích thêm nữa. Quá trình này chia đôi khoảng cách vô hạn lần.',
          'Trực giác thông thường biết Achilles chắc chắn sẽ vượt qua rùa trong tích tắc. Nhưng phải mất hơn 2000 năm, cho đến khi Newton và Leibniz phát minh ra Phép tính Vi tích phân và khái niệm chuỗi vô hạn hội tụ, nhân loại mới chính thức có ngôn ngữ toán học để chứng minh: Tổng của vô hạn khoảng thời gian vẫn có thể là một số hữu hạn.',
        ],
        callout: {
          type: 'simulation-link',
          simulationSlug: 'zeno-paradox',
          simulationTitle: 'Mô phỏng Nghịch lý Zeno',
          text: 'Theo dõi từng bước chân của Achilles và đồ thị chuỗi hình học hội tụ tiệm cận về 1.',
        },
      },
      {
        id: 'prisoners-dilemma-rationality',
        heading: 'Song đề Tù nhân: Bi kịch của sự duy lý cá nhân',
        paragraphs: [
          "Nghịch lý không chỉ tồn tại trong hình học hay giải tích mà còn định hình sâu sắc khoa học xã hội. Trong Lý thuyết Trò chơi, Song đề Tù nhân (Prisoner's Dilemma) đặt ra một bài toán nhức nhối: Hai kẻ tình nghi bị thẩm vấn độc lập, nếu cả hai cùng giữ im lặng họ chỉ chịu án nhẹ; nhưng mỗi người đều có động lực ích kỷ để phản bội người kia.",
          'Kết quả là cả hai đều phản bội và cùng nhận mức án nặng nhất. Sự duy lý hoàn hảo ở cấp độ cá nhân dẫn thẳng tới sự phi lý và thảm họa ở cấp độ tập thể. Nghịch lý này đã mở ra các công trình nghiên cứu đoạt giải Nobel về Cân bằng Nash, sự tiến hóa của lòng vị tha và chiến lược hợp tác đối ứng Tit-for-Tat.',
        ],
        callout: {
          type: 'simulation-link',
          simulationSlug: 'prisoners-dilemma',
          simulationTitle: 'Thử nghiệm Song đề Tù nhân',
          text: 'Chơi thử với các chiến lược đối kháng tự động để tìm hiểu bí quyết duy trì hợp tác bền vững.',
        },
      },
      {
        id: 'conclusion-embracing-paradox',
        heading: 'Đón nhận nghịch lý như ngọn hải đăng',
        paragraphs: [
          'Khi gặp một nghịch lý, người nghiệp dư vội vàng bác bỏ nó như một trò đố vui vô bổ, còn nhà khoa học chân chính nhìn thấy ở đó dấu hiệu của một cuộc cách mạng tư duy.',
          'Từ thuyết tương đối của Einstein (bắt đầu từ nghịch lý ánh sáng) đến định lý bất toàn của Gödel, mọi bước nhảy vọt của tri thức loài người đều bắt đầu bằng việc dũng cảm đối diện với những điều nghịch lý.',
        ],
      },
    ],
    linkedSimulations: [
      {
        slug: 'zeno-paradox',
        title: 'Nghịch lý Zeno (Achilles & Rùa)',
        description:
          'Quan sát chuỗi vô hạn khoảng cách thu hẹp và bắt kịp trong thời gian hữu hạn.',
        badge: 'Giải tích vi phân',
      },
      {
        slug: 'prisoners-dilemma',
        title: 'Song đề Tù nhân & Cân bằng Nash',
        description: 'Mô phỏng lý thuyết trò chơi và các chiến lược tiến hóa hợp tác xã hội.',
        badge: 'Lý thuyết trò chơi',
      },
    ],
  },
  {
    id: 'quantum-reality',
    slug: 'xac-suat-thuc-te-the-gioi-vi-mo-ngau-nhien',
    issueNumber: '03',
    title: 'Xác suất thực tế: Thế giới vi mô có thực sự ngẫu nhiên?',
    subtitle: 'Trực giác cổ điển vs Bản chất lượng tử',
    readTimeMinutes: 6,
    publishedDate: '2026-10-24',
    category: 'science',
    categoryLabel: 'Vật lý Lượng tử',
    teaser:
      'Liệu Chúa có chơi trò đổ xúc xắc với vũ trụ như Einstein từng băn khoăn? Khám phá cách các định lý Bell và thí nghiệm hiện đại chứng minh rằng tính bất định không bắt nguồn từ sự thiếu hiểu biết của chúng ta, mà nằm ngay trong bản chất của thực tại.',
    quote: 'Nếu cơ học lượng tử không làm bạn kinh ngạc sâu sắc, bạn chưa thực sự hiểu nó.',
    quoteAuthor: 'Niels Bohr',
    sections: [
      {
        id: 'einstein-vs-bohr',
        heading: 'Cuộc tranh luận thế kỷ: Xúc xắc hay Quy luật ngầm?',
        paragraphs: [
          'Vào thế kỷ 18, nhà toán học Pierre-Simon Laplace tuyên bố rằng nếu có một trí tuệ siêu việt biết được vị trí và động lượng chính xác của mọi hạt trong vũ trụ tại một thời điểm, vũ trụ sẽ hoàn toàn tất định: tương lai cũng sáng tỏ như quá khứ. Không hề có ngẫu nhiên thực sự, chỉ có sự thiếu hụt dữ liệu của con người.',
          'Thế nhưng, sự ra đời của Cơ học Lượng tử vào đầu thế kỷ 20 đã làm sụp đổ hoàn toàn thế giới quan cơ giới ấy. Khi Albert Einstein thốt lên câu nói bất hủ: "Chúa không chơi trò đổ xúc xắc với vũ trụ", Niels Bohr đã lập tức đáp lại: "Einstein, đừng nói Chúa phải làm gì!".',
        ],
        callout: {
          type: 'quote',
          text: 'Vũ trụ không chỉ kỳ lạ hơn những gì chúng ta tưởng tượng, nó còn kỳ lạ hơn những gì chúng ta CÓ THỂ tưởng tượng.',
          author: 'J.B.S. Haldane',
        },
      },
      {
        id: 'double-slit-mystery',
        heading: 'Thí nghiệm Khe đôi: Cú sụp đổ của Hàm sóng',
        paragraphs: [
          'Thí nghiệm Khe đôi Young với từng electron đơn lẻ là thí nghiệm cô đọng toàn bộ bí ẩn của thế giới lượng tử. Khi ta bắn từng electron qua hai khe hẹp mà không quan sát, trên màn chắn phía sau xuất hiện vân giao thoa sóng — chứng tỏ mỗi electron bằng cách nào đó đã đi qua CẢ HAI KHE cùng một lúc dưới dạng một sóng xác suất chồng chập.',
          'Thế nhưng, chỉ cần ta đặt một máy dò tại một trong hai khe để xác định electron thực sự đi qua đâu, vân giao thoa biến mất ngay lập tức! Electron lại hành xử như một viên bi cổ điển thuần túy. Hành vi quan sát của chủ thể đo đạc dường như đã can thiệp trực tiếp vào bản chất khách quan của thực tại.',
        ],
        callout: {
          type: 'simulation-link',
          simulationSlug: 'double-slit',
          simulationTitle: 'Buồng Thí nghiệm Khe đôi Young',
          text: 'Bật/tắt thiết bị quan sát trực tiếp để tận mắt chứng kiến sự sụp đổ của hàm sóng lượng tử.',
        },
      },
      {
        id: 'bell-theorem-reality',
        heading: 'Định lý Bell: Không có biến ẩn cục bộ',
        paragraphs: [
          'Nhiều thập kỷ sau, câu hỏi "Liệu có các biến ẩn chưa được phát hiện điều khiển hạt hay không?" đã được giải quyết dứt điểm nhờ Định lý Bell (1964) và các thí nghiệm kiểm chứng đoạt giải Nobel Vật lý 2022 của Alain Aspect, John Clauser và Anton Zeilinger.',
          'Kết quả thực nghiệm khẳng định dứt khoát: Tự nhiên không tuân theo Thuyết Hiện thực Định vị (Local Realism). Tính ngẫu nhiên trong cơ học lượng tử không phải là do dụng cụ đo chưa đủ tinh vi, mà là một thuộc tính căn bản, bất khả quy của chính tấm vải cấu tạo nên không-thời gian.',
        ],
      },
      {
        id: 'conclusion-quantum-wisdom',
        heading: 'Khiêm nhường trước tấm màn thực tại',
        paragraphs: [
          'Hiểu được tính ngẫu nhiên lượng tử dạy cho con người sự khiêm nhường nhận thức. Chúng ta không còn là những quan sát viên đứng ngoài vũ trụ cơ học vô tri, mà là một phần gắn liền hữu cơ với bức tranh thực tại mà chúng ta đang khám phá.',
        ],
      },
    ],
    linkedSimulations: [
      {
        slug: 'double-slit',
        title: 'Thí nghiệm Khe đôi Young',
        description:
          'Quan sát tính chất lưỡng tính sóng - hạt và hiện tượng sụp đổ hàm sóng khi đo lường.',
        badge: 'Vật lý lượng tử',
      },
    ],
  },
];

export function getAllEssays(): EditorialArticle[] {
  return ESSAYS;
}

export function getEssayBySlug(slug: string): EditorialArticle | undefined {
  return ESSAYS.find(essay => essay.slug === slug || essay.id === slug);
}
