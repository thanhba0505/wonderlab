import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Atom,
  Dice5,
  Binary,
  Infinity as InfinityIcon,
  Puzzle,
  Gamepad2,
  ArrowRight,
} from 'lucide-react';
import { CategoryInfo } from '@/types';

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'science',
    name: 'Khoa học Thực nghiệm',
    tagline: 'Vật lý, quang học & tự nhiên',
    description:
      'Mô phỏng thí nghiệm khe đôi, khúc xạ ánh sáng, dao động sóng và trọng lực thông qua tương tác hình học trực quan.',
    iconName: 'Atom',
    accentColor: 'cyan',
    countLabel: '4 chủ đề mẫu',
  },
  {
    id: 'probability',
    name: 'Xác suất & Thống kê',
    tagline: 'Điều trực giác dễ đánh lừa bạn',
    description:
      'Nghịch lý ngày sinh nhật, bài toán Monty Hall, xúc xắc thiên vị và định lý giới hạn trung tâm qua mô phỏng Monte Carlo.',
    iconName: 'Dice5',
    accentColor: 'amber',
    countLabel: '5 mô phỏng',
  },
  {
    id: 'logic',
    name: 'Logic Học',
    tagline: 'Chân trị, suy luận & mệnh đề',
    description:
      'Khám phá bảng chân lý Boolean, nghịch lý người cạo râu Russell, định lý Gödel và các câu đố kỵ sĩ & kẻ nói dối.',
    iconName: 'Binary',
    accentColor: 'emerald',
    countLabel: '3 câu đố',
  },
  {
    id: 'paradox',
    name: 'Nghịch lý Tư duy',
    tagline: 'Những hiện tượng phản trực giác',
    description:
      'Con tàu Theseus, Nghịch lý Fermi về người ngoài hành tinh, Nghịch lý Achilles và Rùa của Zeno.',
    iconName: 'Infinity',
    accentColor: 'violet',
    countLabel: '6 nghịch lý',
  },
  {
    id: 'puzzles',
    name: 'Câu đố Trí tuệ',
    tagline: 'Thử thách não bộ từng bước',
    description:
      'Tháp Hà Nội đệ quy, bài toán sói - cừu - bắp cải qua sông và các bài toán phân chia công bằng.',
    iconName: 'Puzzle',
    accentColor: 'cyan',
    countLabel: '4 trò chơi',
  },
  {
    id: 'mind-games',
    name: 'Lý thuyết Trò chơi',
    tagline: 'Chiến lược, cân bằng & quyết định',
    description:
      'Song đề tù nhân (Prisoner’s Dilemma), Cân bằng Nash, chiến thuật Ăn miếng trả miếng (Tit for Tat).',
    iconName: 'Gamepad2',
    accentColor: 'amber',
    countLabel: '3 tình huống',
  },
];

export function CategoryGrid() {
  const renderIcon = (name: string, color: string) => {
    const className = `h-6 w-6 ${
      color === 'cyan'
        ? 'text-cyan-400'
        : color === 'violet'
          ? 'text-violet-400'
          : color === 'amber'
            ? 'text-amber-400'
            : 'text-emerald-400'
    }`;

    switch (name) {
      case 'Atom':
        return <Atom className={className} />;
      case 'Dice5':
        return <Dice5 className={className} />;
      case 'Binary':
        return <Binary className={className} />;
      case 'Infinity':
        return <InfinityIcon className={className} />;
      case 'Puzzle':
        return <Puzzle className={className} />;
      case 'Gamepad2':
      default:
        return <Gamepad2 className={className} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {CATEGORIES.map(cat => (
        <Card
          key={cat.id}
          className="group relative overflow-hidden border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300"
        >
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 group-hover:border-slate-700 transition">
                {renderIcon(cat.iconName, cat.accentColor)}
              </div>
              <Badge variant={cat.accentColor} className="text-[11px]">
                {cat.countLabel}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {cat.name}
              </CardTitle>
              <p className="text-xs font-mono text-slate-400 mt-1">{cat.tagline}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-sm text-slate-400 leading-relaxed">
              {cat.description}
            </CardDescription>
            <div className="pt-2 flex items-center text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
              <span>Tìm hiểu danh mục</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
