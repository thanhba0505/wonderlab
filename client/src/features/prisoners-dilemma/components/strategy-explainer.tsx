'use client';

import * as React from 'react';
import { SimulationFormulaBox, MathFraction } from '@/features/simulations/components';

export function StrategyExplainer() {
  return (
    <div className="flex flex-col gap-4">
      <div className="pb-1">
        <h3 className="font-heading text-base font-bold text-slate-900">
          Tại sao Lòng Vị tha Có Điều kiện Lại Thống trị? (The Evolution of Cooperation)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Khác biệt căn bản giữa tương tác duy lý một ván đơn lẻ và trò chơi lặp vô hạn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột 1: Bẫy cận thị 1 ván */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
              Bẫy Cận thị 1 Ván (Cân bằng Nash)
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
              Thế kẹt song đề
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            Trong một ván đơn lẻ, bất kể đối phương chọn gì, phản bội (Defect) luôn đem lại điểm số
            cao hơn tức thì. Khi cả hai bên cùng duy lý ích kỷ, kết cục tất yếu rơi vào{' '}
            <span className="font-semibold text-slate-800">Cân bằng Nash (P, P) = (1, 1)</span> —
            một kết quả tệ hơn rất nhiều so với việc cùng hợp tác (R, R) = (3, 3).
          </p>

          <SimulationFormulaBox title="Thứ bậc phần thưởng định nghĩa Thế lưỡng nan:">
            <div className="space-y-1.5 text-xs text-slate-900">
              <div className="flex items-center flex-wrap gap-2 text-sm">
                <span className="font-bold text-amber-800">
                  T (5) &gt; R (3) &gt; P (1) &gt; S (0)
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-emerald-800">2R &gt; T + S (6 &gt; 5)</span>
              </div>
              <p className="text-xs text-slate-500 font-sans pt-1 border-t border-slate-100">
                Temptation (5 điểm) &gt; Reward (3 điểm) &gt; Punishment (1 điểm) &gt; Sucker (0
                điểm).
              </p>
            </div>
          </SimulationFormulaBox>

          <p className="text-xs text-slate-500 italic">
            Mâu thuẫn bi kịch giữa tối ưu cá nhân ngắn hạn và sự thịnh vượng chung dài hạn.
          </p>
        </div>

        {/* Cột 2: Sự tiến hóa hợp tác trong trò chơi lặp */}
        <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
              Sự Tiến hóa trong Trò chơi Lặp
            </span>
            <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
              Bóng tương lai w &ge; 0.5
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            Khi tương tác lặp lại nhiều vòng, &ldquo;bóng tối của tương lai&rdquo; mở ra. Chiến
            thuật{' '}
            <span className="font-semibold text-blue-900">Tit-for-Tat (Ăn miếng trả miếng)</span>{' '}
            bất bại nhờ 4 phẩm chất: Lương thiện (không phản bội trước), Sòng phẳng (đáp trả ngay),
            Bao dung (tha thứ khi đối thủ quay lại), và Minh bạch.
          </p>

          <SimulationFormulaBox title="Hệ số tương lai để Hợp tác trở thành trạng thái ổn định (ESS):">
            <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
              <span className="font-bold text-blue-900">w</span>
              <span>&ge;</span>
              <MathFraction numerator="T &minus; R" denominator="T &minus; P" />
              <span>=</span>
              <MathFraction numerator="5 &minus; 3" denominator="5 &minus; 1" />
              <span>=</span>
              <MathFraction numerator="2" denominator="4" />
              <span>=</span>
              <span className="font-bold text-blue-700 text-sm">0.5 (50%)</span>
            </div>
          </SimulationFormulaBox>

          <p className="text-xs text-slate-600">
            Với w là xác suất trận đấu còn tiếp tục ở hiệp sau. Khi bóng tương lai đủ dài (w &ge;
            0.5), lòng vị tha có điều kiện (Win-Win) luôn đánh bại sự ích kỷ thuần túy.
          </p>
        </div>
      </div>
    </div>
  );
}
