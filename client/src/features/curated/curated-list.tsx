import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight, Compass } from 'lucide-react';
import { CuratedExperience } from '@/types';

const CURATED_LIST: CuratedExperience[] = [
  {
    id: 'birthday-paradox',
    title: 'Nghịch lý Ngày Sinh (Birthday Paradox)',
    summary:
      'Chỉ cần 23 người trong một phòng, xác suất để 2 người bất kỳ có cùng ngày sinh đã vượt quá 50%. Khám phá mô phỏng tổ hợp phản trực giác.',
    category: 'probability',
    estimatedMinutes: 4,
    highlightTag: 'Toán học xác suất',
    concept: 'P(A) = 1 - (365! / ((365-n)! * 365^n))',
  },
  {
    id: 'ship-of-theseus',
    title: 'Con tàu của Theseus & Bản thể luận',
    summary:
      'Nếu từng tấm ván của con tàu được thay thế dần dần theo thời gian, đến khi không còn tấm ván gốc nào, nó có còn là con tàu ban đầu không?',
    category: 'paradox',
    estimatedMinutes: 6,
    highlightTag: 'Triết học & Nhận thức',
    concept: 'Bản sắc theo thời gian',
  },
  {
    id: 'prisoners-dilemma',
    title: 'Song đề Tù nhân & Hợp tác Tiến hóa',
    summary:
      'Tại sao hai người hoàn toàn duy lý lại có thể không hợp tác ngay cả khi điều đó mang lại lợi ích tốt nhất cho cả hai? Khám phá Cân bằng Nash.',
    category: 'mind-games',
    estimatedMinutes: 5,
    highlightTag: 'Lý thuyết trò chơi',
    concept: 'Nash Equilibrium',
  },
  {
    id: 'double-slit-experiment',
    title: 'Thí nghiệm Khe đôi Young',
    summary:
      'Quan sát tính chất lưỡng tính sóng - hạt của ánh sáng và hiện tượng giao thoa lượng tử xuất hiện khi không có người quan sát.',
    category: 'science',
    estimatedMinutes: 8,
    highlightTag: 'Vật lý lượng tử',
    concept: 'Wave-Particle Duality',
  },
];

export function CuratedList() {
  return (
    <div className="space-y-4">
      {CURATED_LIST.map(item => (
        <Card
          key={item.id}
          className="border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700 transition-all p-5"
        >
          <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="cyan" className="text-[10px]">
                  {item.highlightTag}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>~{item.estimatedMinutes} phút trải nghiệm</span>
                </div>
              </div>
              <h3 className="text-base font-semibold text-slate-100 hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.summary}</p>
              <div className="text-[11px] font-mono text-cyan-400/80">
                Khái niệm cốt lõi: {item.concept}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <a href="#featured">
                <Button variant="secondary" size="sm" className="text-xs font-semibold gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-cyan-400" />
                  Xem mô phỏng
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
