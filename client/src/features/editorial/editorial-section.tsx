import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Brain } from 'lucide-react';
import { EditorialArticle } from '@/types';

const ARTICLES: EditorialArticle[] = [
  {
    id: 'intuition-failure',
    title: 'Vì sao trực giác của bộ não thường xuyên sai lầm trước xác suất?',
    subtitle: 'Ảo giác nhận thức và thiên kiến sinh tồn',
    readTimeMinutes: 5,
    teaser:
      'Bộ não người được tiến hóa để nhận diện mô hình nguy hiểm tức thời trên thảo nguyên, không phải để tính toán phân phối Poisson hay cập nhật Bayes. Khi đối mặt với xác suất có điều kiện, trực giác thường đưa ra câu trả lời sai hoàn toàn.',
    quote: 'Toán học là công cụ giải phóng con người khỏi những ngộ nhận của chính các giác quan.',
  },
  {
    id: 'paradox-power',
    title: 'Một nghịch lý có thể thay đổi cách chúng ta tư duy như thế nào?',
    subtitle: 'Từ khủng hoảng nền tảng đến bước nhảy vọt khoa học',
    readTimeMinutes: 7,
    teaser:
      'Mỗi khi một nghịch lý xuất hiện trong lịch sử toán học — như Nghịch lý Russell trong lý thuyết tập hợp hay Nghịch lý EPR trong cơ học lượng tử — đó không phải là dấu chấm hết, mà là phát súng mở màn cho một hệ tiên đề sâu sắc hơn.',
    quote:
      'Nghịch lý không phải là sai lầm; nghịch lý là tấm gương phản chiếu giới hạn của hệ thống tư duy hiện hành.',
  },
  {
    id: 'quantum-reality',
    title: 'Xác suất thực tế: Thế giới vi mô có thực sự ngẫu nhiên?',
    subtitle: 'Trực giác cổ điển vs Bản chất lượng tử',
    readTimeMinutes: 6,
    teaser:
      'Liệu Chúa có chơi trò đổ xúc xắc với vũ trụ như Einstein từng băn khoăn? Khám phá cách các định lý Bell và thí nghiệm hiện đại chứng minh rằng tính bất định không bắt nguồn từ sự thiếu hiểu biết của chúng ta, mà nằm ngay trong bản chất của thực tại.',
    quote: 'Nếu cơ học lượng tử không làm bạn kinh ngạc sâu sắc, bạn chưa thực sự hiểu nó.',
  },
];

export function EditorialSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ARTICLES.map(article => (
        <Card
          key={article.id}
          className="border-slate-800/80 bg-slate-900/30 flex flex-col justify-between hover:border-slate-700 transition"
        >
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-cyan-400">
                <Brain className="h-3.5 w-3.5" />
                Tiểu luận
              </span>
              <span>{article.readTimeMinutes} phút đọc</span>
            </div>
            <CardTitle className="text-base font-bold text-slate-100 leading-snug">
              {article.title}
            </CardTitle>
            <p className="text-xs text-slate-400 font-medium">{article.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <p className="text-xs text-slate-300 leading-relaxed">{article.teaser}</p>
            <div className="rounded-lg bg-slate-950/60 p-3 border-l-2 border-cyan-400 text-xs italic text-slate-300 flex items-start gap-2">
              <Quote className="h-4 w-4 shrink-0 text-cyan-400 opacity-60" />
              <span>&ldquo;{article.quote}&rdquo;</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
