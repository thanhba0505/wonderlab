'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronRight, Compass, Sparkles, FlaskConical, ArrowRight } from 'lucide-react';
import { MathFraction } from '@/features/simulations/components';
import { CuratedExperience } from '@/types';
import { useTranslation } from '@/i18n';

interface LocalizedItem {
  id: string;
  title: { vi: string; en: string };
  summary: { vi: string; en: string };
  category: string;
  estimatedMinutes: number;
  highlightTag: { vi: string; en: string };
  concept: string | React.ReactNode;
  href: string;
}

export const LOCALIZED_CURATED_LIST: LocalizedItem[] = [
  {
    id: 'birthday-paradox',
    title: {
      vi: 'Nghịch lý Ngày Sinh (Birthday Paradox)',
      en: 'Birthday Paradox (Combinatorial Collision)',
    },
    summary: {
      vi: 'Chỉ cần 23 người ngẫu nhiên trong một phòng, xác suất để có ít nhất 2 người cùng ngày sinh đã vượt quá 50%. Khám phá mô phỏng tổ hợp phản trực giác.',
      en: 'With just 23 random people in a room, the probability of at least two sharing a birthday exceeds 50%. Explore counter-intuitive combinatorial mathematics.',
    },
    category: 'probability',
    estimatedMinutes: 4,
    highlightTag: {
      vi: 'Toán học xác suất',
      en: 'Probability & Combinatorics',
    },
    concept: (
      <span className="inline-flex items-center">
        <span>P(A) = 1 &minus;</span>
        <MathFraction
          numerator="365!"
          denominator={
            <span>
              (365 &minus; n)! &middot; 365<sup>n</sup>
            </span>
          }
        />
      </span>
    ),
    href: '/simulations/birthday-paradox',
  },
  {
    id: 'zeno-paradox',
    title: {
      vi: 'Nghịch lý Zeno: Achilles & Con Rùa (Zeno Paradox)',
      en: "Zeno's Paradox: Achilles & the Tortoise",
    },
    summary: {
      vi: 'Chiến binh Achilles dẫu chạy nhanh gấp 10 lần con rùa nhưng theo Zeno sẽ không bao giờ đuổi kịp vì khoảng cách liên tục bị chia đôi vô tận.',
      en: 'Achilles runs ten times faster than the tortoise, yet ancient philosopher Zeno argued he can never overtake it due to infinite division of space.',
    },
    category: 'paradox',
    estimatedMinutes: 5,
    highlightTag: {
      vi: 'Triết học & Giải tích',
      en: 'Philosophy & Calculus',
    },
    concept: (
      <span className="inline-flex items-center">
        <span>&sum;</span>
        <sub className="text-xs">n=1</sub>
        <sup className="text-xs font-semibold">&infin;</sup>
        <span className="ml-0.5">(</span>
        <MathFraction numerator="1" denominator="2" />
        <span>)</span>
        <sup className="text-xs font-semibold">n</sup>
        <span className="ml-0.5">= 1</span>
      </span>
    ),
    href: '/simulations/zeno-paradox',
  },
  {
    id: 'prisoners-dilemma',
    title: {
      vi: 'Song đề Tù nhân & Hợp tác Tiến hóa',
      en: "The Prisoner's Dilemma & Evolution of Cooperation",
    },
    summary: {
      vi: 'Tại sao hai người hoàn toàn duy lý lại đưa ra kết quả bất lợi cho cả hai? Khám phá Cân bằng Nash và chiến lược hợp tác đối ứng Tit-for-Tat.',
      en: 'Why do two rational agents choose mutual betrayal over win-win cooperation? Discover Nash Equilibrium and Axelrod tournaments.',
    },
    category: 'mind-games',
    estimatedMinutes: 5,
    highlightTag: {
      vi: 'Lý thuyết trò chơi',
      en: 'Game Theory',
    },
    concept: (
      <span className="inline-flex items-center">
        <span>
          Nash: u<sub>i</sub>(s<sub>i</sub>*, s<sub>&minus;i</sub>*) &ge; u<sub>i</sub>(s
          <sub>i</sub>, s<sub>&minus;i</sub>*)
        </span>
      </span>
    ),
    href: '/simulations/prisoners-dilemma',
  },
  {
    id: 'double-slit',
    title: {
      vi: 'Thí nghiệm Khe đôi Young & Cơ học Lượng tử',
      en: 'Double-Slit Experiment & Quantum Duality',
    },
    summary: {
      vi: 'Quan sát tính chất lưỡng tính sóng - hạt của ánh sáng và sự sụp đổ hàm sóng kỳ bí khi có sự can thiệp của thiết bị đo lường.',
      en: 'Observe wave-particle duality and the mysterious collapse of the quantum wave function upon observation.',
    },
    category: 'science',
    estimatedMinutes: 6,
    highlightTag: {
      vi: 'Vật lý lượng tử',
      en: 'Quantum Physics',
    },
    concept: (
      <span className="inline-flex items-center">
        <span>
          |&Psi;&rang; = c<sub>1</sub>|1&rang; + c<sub>2</sub>|2&rang;
        </span>
      </span>
    ),
    href: '/simulations/double-slit',
  },
  {
    id: 'art-gallery',
    title: {
      vi: 'Bài toán Người gác Phòng trưng bày (Art Gallery Problem)',
      en: 'The Art Gallery Problem (Chvátal Theorem)',
    },
    summary: {
      vi: 'Trong căn phòng đa giác bất kỳ n đỉnh, cần bao nhiêu người để quan sát trọn vẹn mọi ngóc ngách? Khám phá định lý Chvátal và chứng minh Steve Fisk.',
      en: 'In an arbitrary polygon room with n vertices, how many stationary guards are needed to see every point? Explore polygon triangulation.',
    },
    category: 'mind-games',
    estimatedMinutes: 5,
    highlightTag: {
      vi: 'Hình học & Logic',
      en: 'Computational Geometry',
    },
    concept: (
      <span className="inline-flex items-center">
        <span>g(n) = &lfloor;</span>
        <MathFraction numerator="n" denominator="3" />
        <span>&rfloor;</span>
      </span>
    ),
    href: '/simulations/art-gallery',
  },
  {
    id: 'prisoners-hats',
    title: {
      vi: 'Bài toán Đội mũ & Bit Chẵn lẻ (Prisoners Hat Puzzle)',
      en: 'Prisoners & Hats Puzzle (Parity Checksum)',
    },
    summary: {
      vi: 'Làm thế nào để 10 người đội mũ 2 màu ngẫu nhiên chắc chắn đoán đúng màu mũ của ít nhất 9 người? Khám phá chiến thuật Parity Checksum và lý thuyết thông tin.',
      en: 'How can 10 prisoners wearing random colored hats guarantee at least 9 correct guesses? Explore parity checksums and information theory.',
    },
    category: 'mind-games',
    estimatedMinutes: 4,
    highlightTag: {
      vi: 'Lý thuyết thông tin & Logic',
      en: 'Information Theory & Logic',
    },
    concept: (
      <span className="inline-flex items-center">
        <span>P &ge;</span>
        <MathFraction numerator="n &minus; 1" denominator="n" />
        <span className="mx-1">&bull;</span>
        <span>
          c<sub>k</sub> = (p &minus; &sum; c<sub>j</sub>) mod K
        </span>
      </span>
    ),
    href: '/simulations/prisoners-hats',
  },
  {
    id: 'bodyguard-problem',
    title: {
      vi: 'Bài toán Vệ sĩ & Phòng Gương (The Bodyguard Problem)',
      en: 'The Bodyguard Problem & Mirror Room (Gutkin Theorem)',
    },
    summary: {
      vi: 'Liệu có thể bảo vệ một mục tiêu trong phòng gương đa giác khỏi mọi tia laser chỉ với số lượng hữu hạn vệ sĩ? Khám phá định lý Eugene Gutkin và kỹ thuật trải phẳng mặt phẳng.',
      en: 'Can a target in a polygonal mirror room be shielded from all light rays with finitely many bodyguards? Discover Eugene Gutkin’s theorem and lattice unfolding.',
    },
    category: 'mind-games',
    estimatedMinutes: 5,
    highlightTag: {
      vi: 'Hình học & Quang học',
      en: 'Geometry & Optics',
    },
    concept: (
      <span className="inline-flex items-center">
        <span>M =</span>
        <MathFraction numerator="A + B'" denominator="2" />
        <span className="mx-1.5">&bull;</span>
        <span>
          |G| &le; 2<sup>4</sup> = 16
        </span>
      </span>
    ),
    href: '/simulations/bodyguard-problem',
  },
];

export const CURATED_LIST: CuratedExperience[] = LOCALIZED_CURATED_LIST.map(item => ({
  id: item.id,
  title: item.title.vi,
  summary: item.summary.vi,
  category: item.category as CuratedExperience['category'],
  estimatedMinutes: item.estimatedMinutes,
  highlightTag: item.highlightTag.vi,
  concept: item.concept,
  href: item.href,
}));

export function CuratedList() {
  const { locale, dict } = useTranslation();

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
      {LOCALIZED_CURATED_LIST.map((item, index) => {
        const targetHref = item.href || `/simulations/${item.id}`;
        const title = item.title[locale] || item.title.vi;
        const summary = item.summary[locale] || item.summary.vi;
        const tag = item.highlightTag[locale] || item.highlightTag.vi;

        return (
          <Card
            key={item.id}
            className="relative border-slate-300/85 bg-white hover:border-slate-400 hover:shadow-md transition-all duration-200 p-6 shadow-xs"
          >
            <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-500">#0{index + 1}</span>
                  <Badge variant={getBadgeVariant(item.category)} className="text-xs">
                    {tag}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      ~{item.estimatedMinutes} {dict.home.min_experience}
                    </span>
                  </div>
                </div>

                <h4 className="text-lg font-heading font-extrabold text-slate-900">{title}</h4>

                <p className="text-sm text-slate-600 leading-relaxed font-sans">{summary}</p>

                <div className="flex items-center gap-2 pt-1">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="text-xs font-mono font-medium text-blue-900 bg-slate-100 px-2.5 py-1 rounded-md inline-flex items-center">
                    {item.concept}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start md:self-center shrink-0">
                <Link
                  href={targetHref}
                  className="group/btn inline-flex items-center justify-center font-bold text-xs gap-1.5 h-9 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-700 shadow-xs hover:border-blue-600 hover:bg-blue-600 hover:text-white active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                >
                  <Compass className="h-4 w-4 text-blue-600 group-hover/btn:text-white transition-colors" />
                  <span>{dict.home.enter_lab}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Hành động điều hướng tới danh mục toàn bộ phòng lab */}
      <div className="pt-2 flex justify-center">
        <Link
          href="/simulations"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 text-xs font-mono font-bold transition shadow-xs group"
        >
          <FlaskConical className="h-4 w-4 text-blue-600" />
          <span>{dict.home.explore_catalog}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
