'use client';

import React from 'react';
import { calculateComparisonPairs, calculateTheoreticalProbability } from '../birthday-math';
import { SimulationFormulaBox, MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';

interface IntuitionExplainerProps {
  currentN: number;
}

export const IntuitionExplainer: React.FC<IntuitionExplainerProps> = ({ currentN }) => {
  const { dict } = useTranslation();
  const bDict = dict.sim_birthday;

  const currentPairs = calculateComparisonPairs(currentN);
  const naivePairs = Math.max(0, currentN - 1);
  const theoreticalRate = calculateTheoreticalProbability(currentN);

  return (
    <div className="flex flex-col gap-4">
      <div className="pb-1">
        <h3 className="font-heading text-base font-bold text-slate-900">{bDict.explainer_title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{bDict.explainer_desc}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột 1: Lỗi nhận thức tự nhiên */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
              {bDict.naive_intuition}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
              {naivePairs} {bDict.naive_comparisons}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">{bDict.naive_desc}</p>

          <SimulationFormulaBox title={bDict.p_you}>
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <span className="font-bold text-slate-900">{bDict.p_you_label}</span>
              <span>=</span>
              <span>1 &minus;</span>
              <span className="inline-flex items-center">
                <span className="text-xl font-light text-slate-400 -mt-0.5">(</span>
                <MathFraction numerator="364" denominator="365" />
                <span className="text-xl font-light text-slate-400 -mt-0.5">)</span>
                <sup className="text-xs font-bold text-slate-700 -top-1 ml-0.5">{naivePairs}</sup>
              </span>
              <span className="text-slate-400">&asymp;</span>
              <span className="font-bold text-slate-900">
                {((1 - Math.pow(364 / 365, naivePairs)) * 100).toFixed(1)}%
              </span>
            </div>
          </SimulationFormulaBox>
          <p className="text-xs text-slate-500 italic">{bDict.naive_illusion_note}</p>
        </div>

        {/* Cột 2: Bản chất toán học thực tế */}
        <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
              {bDict.actual_combinatorial}
            </span>
            <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
              {currentPairs} {bDict.actual_pairs}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">{bDict.actual_desc}</p>

          <SimulationFormulaBox title={bDict.combinatorial_formula_title}>
            <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
              <span className="font-bold">C({currentN}, 2)</span>
              <span>=</span>
              <MathFraction
                numerator={`${currentN} \u00D7 (${currentN} \u2212 1)`}
                denominator="2"
              />
              <span>=</span>
              <span className="font-bold text-blue-700">
                {currentPairs} {bDict.pairs_unit}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center flex-wrap gap-2 text-xs">
              <span className="font-sans text-slate-600">
                {bDict.at_n} {currentN}:
              </span>
              <span className="font-bold text-blue-900">P(n)</span>
              <span>&asymp;</span>
              <span>1 &minus; e</span>
              <sup className="text-xs font-bold text-blue-700 -top-1">
                &minus;
                <MathFraction
                  numerator={String(currentPairs)}
                  denominator="365"
                  className="text-xs"
                />
              </sup>
              <span>=</span>
              <span className="font-bold text-blue-700 text-sm">
                {(theoreticalRate * 100).toFixed(1)}%
              </span>
            </div>
          </SimulationFormulaBox>
          <p className="text-xs text-slate-600">
            {bDict.inevitable_note.replace('{pairs}', String(currentPairs))}
          </p>
        </div>
      </div>
    </div>
  );
};
