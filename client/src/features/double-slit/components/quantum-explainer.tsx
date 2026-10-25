'use client';

import * as React from 'react';
import { SimulationFormulaBox, MathFraction } from '@/features/simulations/components';

export function QuantumExplainer() {
  return (
    <div className="flex flex-col gap-4">
      <div className="pb-1">
        <h3 className="font-heading text-base font-bold text-slate-900">
          Giải Mã Lưỡng Tính Sóng - Hạt & Sự Sụp Đổ Hàm Sóng (Wave-Particle Duality)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Khác biệt căn bản giữa trực giác cơ học cổ điển tiền định và bản chất xác suất lượng tử.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột 1: Trực giác cổ điển (Tiền định) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
              Trực giác Cổ điển (Tiền định)
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
              2 vệt hạt rời rạc
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            Trong thế giới vĩ mô quen thuộc, một hạt vật chất (như viên bi) chỉ có thể đi qua một
            trong hai khe. Khi bật máy quan sát (Detector ON), thông tin đo lường lập tức triệt tiêu
            trạng thái chồng chập, buộc hạt phải sụp đổ về hành vi cổ điển.
          </p>

          <SimulationFormulaBox title="Mật độ xác suất cổ điển (Khi có máy quan sát):">
            <div className="space-y-1.5 text-xs text-slate-900">
              <div className="flex items-center flex-wrap gap-2 text-sm">
                <span className="font-bold text-rose-700">
                  P<sub className="text-xs">cổ điển</sub>(y)
                </span>
                <span>=</span>
                <span>
                  P<sub className="text-xs">1</sub>(y) + P<sub className="text-xs">2</sub>(y)
                </span>
              </div>
              <div className="text-xs text-slate-500 font-sans pt-1 border-t border-slate-100 flex items-center gap-1.5">
                <span>Số hạng giao thoa:</span>
                <span className="font-mono font-bold text-slate-700">
                  2&radic;(P<sub className="text-xs">1</sub>P<sub className="text-xs">2</sub>)
                  &times; cos(&Delta;&phi;) = 0
                </span>
              </div>
            </div>
          </SimulationFormulaBox>

          <p className="text-xs text-slate-500 italic">
            Hai khe hẹp hoạt động độc lập, trên màn huỳnh quang chỉ còn lại hai dải phân bố song
            song tương ứng với vị trí hai khe.
          </p>
        </div>

        {/* Cột 2: Bản chất lượng tử thực tế */}
        <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
              Bản chất Lượng tử Thực tế
            </span>
            <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
              Hàm sóng tự giao thoa!
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            Khi không bị can thiệp đo lường, mỗi photon tồn tại dưới dạng hàm sóng xác suất
            |&Psi;&rang; đi qua{' '}
            <span className="font-semibold text-blue-900">đồng thời cả hai khe</span> và tự giao
            thoa với chính mình, tích tụ dần thành hệ vân sáng tối hoàn hảo.
          </p>

          <SimulationFormulaBox title="Chồng chập lượng tử & Khoảng vân giao thoa:">
            <div className="space-y-2 text-xs text-slate-900">
              {/* Trạng thái chồng chập */}
              <div className="flex items-center flex-wrap gap-2 text-sm">
                <span className="font-bold text-blue-900">|&Psi;&rang;</span>
                <span>=</span>
                <MathFraction numerator="1" denominator="&radic;2" />
                <span className="inline-flex items-center">
                  <span className="text-lg font-light text-slate-400 -mt-0.5">(</span>
                  <span>|Khe 1&rang; + |Khe 2&rang;</span>
                  <span className="text-lg font-light text-slate-400 -mt-0.5">)</span>
                </span>
              </div>

              {/* Khoảng vân i */}
              <div className="pt-1.5 border-t border-slate-100 flex items-center flex-wrap gap-2 text-xs">
                <span className="font-bold text-blue-900">i = &Delta;y</span>
                <span>=</span>
                <MathFraction
                  numerator="&lambda; &middot; D"
                  denominator="d"
                  className="text-xs font-bold text-blue-700"
                />
                <span className="text-slate-300">|</span>
                <span>
                  y<sub className="text-xs font-semibold">m</sub> = m &middot;
                </span>
                <MathFraction numerator="&lambda; &middot; D" denominator="d" className="text-xs" />
                <span className="text-slate-400 font-sans">(m &isin; &Zopf;)</span>
              </div>
            </div>
          </SimulationFormulaBox>

          <p className="text-xs text-slate-600">
            Khoảng vân i tỷ lệ thuận với bước sóng &lambda;, khoảng cách màn D và tỷ lệ nghịch với
            khoảng cách giữa hai khe hẹp d.
          </p>
        </div>
      </div>
    </div>
  );
}
