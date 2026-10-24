'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Brain, ArrowUpRight } from 'lucide-react';
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
      {ARTICLES.map((article, idx) => (
        <Card
          key={article.id}
          className="group relative border-slate-200/90 bg-white flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all duration-300 p-6 overflow-hidden shadow-xs"
        >
          {/* Subtle watermark background number */}
          <div className="absolute top-2 right-4 text-7xl font-mono font-black text-slate-100 select-none pointer-events-none group-hover:text-blue-50 transition-colors">
            0{idx + 1}
          </div>

          <CardHeader className="p-0 space-y-3 relative z-10">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-mono text-blue-700 font-bold">
                <Brain className="h-3.5 w-3.5" />
                Tiểu luận #0{idx + 1}
              </span>
              <span className="font-mono text-slate-400">{article.readTimeMinutes} phút đọc</span>
            </div>

            <div>
              <CardTitle className="text-lg font-heading font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                {article.title}
              </CardTitle>
              <p className="text-xs font-mono text-blue-700/80 mt-1 font-medium">
                {article.subtitle}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0 pt-4 space-y-4 flex-1 flex flex-col justify-between relative z-10">
            <p className="text-sm text-slate-600 leading-relaxed font-sans">{article.teaser}</p>

            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50/80 p-3.5 border-l-2 border-blue-600 text-xs italic text-slate-800 flex items-start gap-2.5">
                <Quote className="h-4 w-4 shrink-0 text-blue-600 opacity-80 mt-0.5" />
                <span className="leading-relaxed">&ldquo;{article.quote}&rdquo;</span>
              </div>

              <div className="flex items-center text-xs font-bold text-slate-600 group-hover:text-blue-700 transition-colors">
                <span>Đọc toàn bộ tiểu luận</span>
                <ArrowUpRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
