'use client';

import * as React from 'react';
import { BookOpen, Heart, Shield, RotateCcw, Lightbulb, Award } from 'lucide-react';

export function StrategyExplainer() {
  return (
    <div className="rounded-2xl border border-slate-300/85 bg-white p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
          <BookOpen className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-slate-900">
            Bí quyết Tiến hóa: 4 Phẩm chất Khiến Lòng Vị tha Thống trị
          </h3>
          <p className="text-xs text-slate-500">
            Khám phá công trình đoạt giải của Robert Axelrod về nguồn gốc sự hợp tác trong tự nhiên
            và xã hội
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Phẩm chất 1: Lương thiện */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <Heart className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              1. Lương thiện (Nice)
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Không bao giờ là người chủ động phản bội trước. Khởi đầu bằng thiện chí hợp tác giúp mở
            ra cơ hội đôi bên cùng nhận phần thưởng lớn nhất ($R = 3$).
          </p>
        </div>

        {/* Phẩm chất 2: Đáp trả ngay */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-700">
            <Shield className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              2. Sòng phẳng (Retaliatory)
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Không làm kẻ ngây thơ bị bóc lột. Nếu đối phương phản bội, bạn phải lập tức phản bội đáp
            trả ngay ở hiệp sau để thiết lập ranh giới răn đe rõ ràng.
          </p>
        </div>

        {/* Phẩm chất 3: Tha thứ */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-700">
            <RotateCcw className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              3. Bao dung (Forgiving)
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Không thù dai như <em>Grudger</em>. Khi đối phương dừng phản bội và quay lại hợp tác,
            bạn lập tức tha thứ và hợp tác lại để tránh rơi vào vòng xoáy hủy diệt lẫn nhau.
          </p>
        </div>

        {/* Phẩm chất 4: Minh bạch */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700">
            <Lightbulb className="h-4 w-4" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider">
              4. Minh bạch (Clear)
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            Không chơi bài mập mờ, không đố kỵ. Hành vi đơn giản giúp đối thủ nhanh chóng nhận ra
            quy tắc và nhận thức rằng: <em>hợp tác là con đường duy nhất để cả hai cùng thắng</em>.
          </p>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-4 font-mono text-xs text-slate-700">
        <div className="flex items-start gap-3">
          <Award className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <blockquote className="italic leading-relaxed text-slate-800">
              &ldquo;Trong một thế giới có tính lặp lại, lòng vị tha không phải là một sự yếu đuối
              ngây thơ, mà là một chiến lược tiến hóa tối ưu và kiên cường nhất của sự sống.&rdquo;
            </blockquote>
            <p className="mt-1 text-xs text-slate-500 font-bold">
              — Robert Axelrod (The Evolution of Cooperation, 1984)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
