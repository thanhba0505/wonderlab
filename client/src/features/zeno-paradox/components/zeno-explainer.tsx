'use client';

import * as React from 'react';
import { SimulationFormulaBox, MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';

export function ZenoExplainer() {
  const { dict } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="pb-1">
        <h3 className="font-heading text-base font-bold text-slate-900">
          {dict.sim_zeno.explainer_title}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">{dict.sim_zeno.explainer_desc}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột 1: Ngộ nhận cổ đại */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
              {dict.sim_zeno.misconception_title}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
              {dict.sim_zeno.infinite_steps_badge}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">{dict.sim_zeno.misconception_p1}</p>

          <SimulationFormulaBox title={dict.sim_zeno.fallacy_formula_title}>
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
                <span className="text-rose-700 font-bold">{dict.sim_zeno.fallacy_label}</span>
              </div>
              <p className="text-xs text-slate-500 font-sans pt-1 border-t border-slate-100">
                {dict.sim_zeno.fallacy_note}
              </p>
            </div>
          </SimulationFormulaBox>

          <p className="text-xs text-slate-500 italic">{dict.sim_zeno.misconception_p2}</p>
        </div>

        {/* Cột 2: Đột phá Giải tích & Giới hạn Vật lý */}
        <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
              {dict.sim_zeno.calculus_title}
            </span>
            <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
              {dict.sim_zeno.finite_series_badge}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">{dict.sim_zeno.calculus_p1}</p>

          <SimulationFormulaBox title={dict.sim_zeno.calculus_formula_title}>
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
                  {dict.sim_zeno.with_r_less_than_1}
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

          <p className="text-xs text-slate-600">{dict.sim_zeno.calculus_conclusion}</p>
        </div>
      </div>
    </div>
  );
}
