'use client';

import * as React from 'react';
import { SimulationFormulaBox, MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';

export function ZenoExplainer() {
  const { locale } = useTranslation();
  const isEn = locale === 'en';

  return (
    <div className="flex flex-col gap-4">
      <div className="pb-1">
        <h3 className="font-heading text-base font-bold text-slate-900">
          {isEn
            ? "Demystifying Zeno's Paradox: Achilles and the Tortoise (The Infinite Trap)"
            : 'Giải Mã Nghịch Lý Zeno: Achilles và Con Rùa (The Infinite Trap)'}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {isEn
            ? 'Fundamental distinction between ancient infinite subdivision fallacy and modern calculus.'
            : 'Khác biệt căn bản giữa tư duy phân chia vô hạn cổ đại và phép tính vi tích phân hiện đại.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột 1: Ngộ nhận cổ đại */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
              {isEn ? 'Ancient Misconception (Divergence Trap)' : 'Ngộ nhận Cổ đại (Bẫy Phân kỳ)'}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
              {isEn ? 'Infinite steps' : 'Vô số bước chia'}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            {isEn
              ? 'Zeno argued: to catch up with the Tortoise, Achilles must first reach its former position. By the time he arrives, the Tortoise has crept forward. This subdivision recurs ad infinitum, misleading ancient thinkers into believing that "infinitely many steps" must require "infinite time".'
              : 'Zeno lập luận: để bắt kịp Rùa, Achilles trước hết phải chạy đến vị trí cũ của Rùa. Khi tới đó, Rùa đã bò thêm một khoảng mới. Quá trình chia nhỏ này lặp lại vô tận, khiến người xưa lầm tưởng rằng “vô số bước” bắt buộc phải tốn “vô hạn thời gian”.'}
          </p>

          <SimulationFormulaBox
            title={
              isEn
                ? 'Intuitive fallacy regarding infinite sum of steps:'
                : 'Ngộ nhận trực giác về tổng vô hạn bước:'
            }
          >
            <div className="space-y-1.5 text-xs text-slate-900">
              <div className="flex items-center flex-wrap gap-2 text-sm font-mono">
                <span>
                  &Delta;t<sub className="text-xs">1</sub> + &Delta;t
                  <sub className="text-xs">2</sub> + &hellip;
                </span>
                <span>=</span>
                <span>
                  &sum; &Delta;t<sub className="text-xs">k</sub>
                </span>
                <span className="text-rose-700 font-bold">
                  {isEn ? '&rarr; &infin; (Fallacy!)' : '&rarr; &infin; (Sai lầm!)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans pt-1 border-t border-slate-100">
                {isEn
                  ? '10s + 1s + 0.1s + 0.01s + … does not diverge to infinity; it is strictly bounded above.'
                  : '10s + 1s + 0.1s + 0.01s + … không hề tiến tới vô cực mà bị chặn trên hoàn toàn.'}
              </p>
            </div>
          </SimulationFormulaBox>

          <p className="text-xs text-slate-500 italic">
            {isEn
              ? 'The flaw: Ancients failed to realize that the duration of each successive step shrinks exponentially at tremendous speed.'
              : 'Sai lầm ở chỗ: Người xưa không nhận ra rằng độ dài của mỗi chặng thời gian co lại theo cấp số nhân với tốc độ cực nhanh.'}
          </p>
        </div>

        {/* Cột 2: Đột phá Giải tích & Giới hạn Vật lý */}
        <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
              {isEn
                ? 'Calculus Breakthrough & Planck Physics'
                : 'Đột phá Giải tích & Vật lý Planck'}
            </span>
            <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
              {isEn ? 'Finite converging series!' : 'Chuỗi hội tụ hữu hạn!'}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            {isEn ? (
              <>
                Calculus proves: The sum of infinitely many exponentially shrinking terms with
                common ratio |r| &lt; 1 is a finite real number. At quantum scale, Planck length
                (&ell;
                <sub className="text-xs font-semibold">P</sub> &asymp; 1.6 &times; 10
                <sup className="text-xs font-semibold">-35</sup>m) asserts spacetime discreteness.
              </>
            ) : (
              <>
                Vi tích phân (Calculus) chứng minh: Tổng của vô số đại lượng nhỏ dần theo cấp số
                nhân với công bội |r| &lt; 1 là một số thực hữu hạn. Ở quy mô lượng tử, độ dài
                Planck (&ell;
                <sub className="text-xs font-semibold">P</sub> &asymp; 1.6 &times; 10
                <sup className="text-xs font-semibold">-35</sup>m) khẳng định không gian có tính rời
                rạc.
              </>
            )}
          </p>

          <SimulationFormulaBox
            title={
              isEn
                ? 'Geometric series sum & exact overtake point:'
                : 'Tổng chuỗi cấp số nhân & Thời điểm vượt qua chính xác:'
            }
          >
            <div className="space-y-2 text-xs text-slate-900 font-mono">
              <div className="flex items-center flex-wrap gap-2 text-sm">
                <span className="font-bold text-blue-900">S</span>
                <span>=</span>
                <span>
                  &sum; a &middot; r<sup className="text-xs font-semibold">k</sup>
                </span>
                <span>=</span>
                <MathFraction
                  numerator="a"
                  denominator="1 &minus; r"
                  className="text-sm font-bold text-blue-700"
                />
                <span className="text-xs text-slate-500 font-sans">
                  {isEn ? '(with |r| < 1)' : '(với |r| < 1)'}
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-100 flex items-center flex-wrap gap-2 text-xs">
                <span className="font-bold text-blue-900">T*</span>
                <span>=</span>
                <MathFraction
                  numerator={
                    <span>
                      d<sub className="text-xs">0</sub>
                    </span>
                  }
                  denominator={
                    <span>
                      v<sub className="text-xs">A</sub> &minus; v<sub className="text-xs">T</sub>
                    </span>
                  }
                  className="text-xs"
                />
                <span>=</span>
                <MathFraction numerator="100" denominator="10 &minus; 1" className="text-xs" />
                <span>=</span>
                <MathFraction
                  numerator="100"
                  denominator="9"
                  className="text-xs font-bold text-blue-700"
                />
                <span>&asymp;</span>
                <span className="font-bold text-blue-700 text-sm">11.11 s</span>
              </div>
            </div>
          </SimulationFormulaBox>

          <p className="text-xs text-slate-600">
            {isEn
              ? 'All infinitely many steps of Achilles conclude precisely at 11.11 seconds, at position 111.11 meters!'
              : 'Toàn bộ vô số chặng chạy của Achilles khép lại chính xác tại thời điểm 11.11 giây, tại vị trí 111.11 mét!'}
          </p>
        </div>
      </div>
    </div>
  );
}
