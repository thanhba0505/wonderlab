'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight, Compass, Sparkles } from 'lucide-react';
import { CuratedExperience } from '@/types';

const CURATED_LIST: CuratedExperience[] = [
  {
    id: 'birthday-paradox',
    title: 'Nghịch lý Ngày Sinh (Birthday Paradox)',
    summary:
      'Chỉ cần 23 người ngẫu nhiên trong một phòng, xác suất để có ít nhất 2 người cùng ngày sinh đã vượt quá 50%. Khám phá mô phỏng tổ hợp phản trực giác.',
    category: 'probability',
    estimatedMinutes: 4,
    highlightTag: 'Toán học xác suất',
    concept: 'P(A) = 1 - (365! / ((365-n)! · 365^n))',
  },
  {
    id: 'ship-of-theseus',
    title: 'Con tàu của Theseus & Bản thể luận',
    summary:
      'Nếu từng thanh gỗ của con tàu được thay thế dần dần theo thời gian, đến khi không còn thanh gỗ gốc nào, nó có còn là con tàu ban đầu không?',
    category: 'paradox',
    estimatedMinutes: 6,
    highlightTag: 'Triết học & Nhận thức',
    concept: 'Bản sắc theo thời gian & Cấu trúc nguyên tử',
  },
  {
    id: 'prisoners-dilemma',
    title: 'Song đề Tù nhân & Hợp tác Tiến hóa',
    summary:
      'Tại sao hai người hoàn toàn duy lý lại đưa ra kết quả bất lợi cho cả hai? Khám phá Cân bằng Nash và chiến lược hợp tác đối ứng Tit-for-Tat.',
    category: 'mind-games',
    estimatedMinutes: 5,
    highlightTag: 'Lý thuyết trò chơi',
    concept: 'Cân bằng Nash: ui(si*, s-i*) ≥ ui(si, s-i*)',
  },
  {
    id: 'double-slit-experiment',
    title: 'Thí nghiệm Khe đôi Young & Cơ học Lượng tử',
    summary:
      'Quan sát tính chất lưỡng tính sóng - hạt của ánh sáng và sự sụp đổ hàm sóng kỳ bí khi có sự can thiệp của thiết bị đo lường.',
    category: 'science',
    estimatedMinutes: 8,
    highlightTag: 'Vật lý lượng tử',
    concept: 'Lưỡng tính sóng - hạt |ψ⟩ = c1|1⟩ + c2|2⟩',
  },
];

export function CuratedList() {
  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'probability':
        return 'amber';
      case 'paradox':
        return 'violet';
      case 'mind-games':
        return 'emerald';
      case 'science':
      default:
        return 'cyan';
    }
  };

  return (
    <div className="space-y-4">
      {CURATED_LIST.map((item, index) => (
        <Card
          key={item.id}
          className="group relative border-slate-300/85 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-300 p-6 shadow-xs"
        >
          <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-500">#0{index + 1}</span>
                <Badge variant={getBadgeVariant(item.category)} className="text-[11px]">
                  {item.highlightTag}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>~{item.estimatedMinutes} phút tương tác</span>
                </div>
              </div>

              <h4 className="text-lg font-heading font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                {item.title}
              </h4>

              <p className="text-sm text-slate-600 leading-relaxed font-sans">{item.summary}</p>

              <div className="flex items-center gap-2 pt-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-xs font-mono font-medium text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                  {item.concept}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <a href="#featured">
                <Button
                  variant="secondary"
                  size="sm"
                  className="font-bold text-xs gap-1.5 shadow-2xs group-hover:border-blue-300 group-hover:text-blue-700"
                >
                  <Compass className="h-3.5 w-3.5 text-blue-600" />
                  Xem mô phỏng
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
