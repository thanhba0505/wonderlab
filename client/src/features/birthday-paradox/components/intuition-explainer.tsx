'use client';

import React from 'react';
import { calculateComparisonPairs, calculateTheoreticalProbability } from '../birthday-math';
import { SimulationFormulaBox, MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';

interface IntuitionExplainerProps {
  currentN: number;
}

export const IntuitionExplainer: React.FC<IntuitionExplainerProps> = ({ currentN }) => {
  const { locale } = useTranslation();
  const isEn = locale === 'en';

  const currentPairs = calculateComparisonPairs(currentN);
  const naivePairs = Math.max(0, currentN - 1);
  const theoreticalRate = calculateTheoreticalProbability(currentN);

  return (
    <div className="flex flex-col gap-4">
      <div className="pb-1">
        <h3 className="font-heading text-base font-bold text-slate-900">
          {isEn
            ? 'Why Does Naive Intuition Fail? (The Intuitive Flaw)'
            : 'Tại sao Trực giác của bạn lại Sai? (The Intuitive Flaw)'}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {isEn
            ? 'The fundamental distinction between "Shared birthday with ME" vs. "ANY TWO PEOPLE sharing a birthday".'
            : 'Khác biệt căn bản giữa “Trùng ngày sinh với TÔI” và “BẤT KỲ HAI NGƯỜI NÀO trùng nhau”.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cột 1: Lỗi nhận thức tự nhiên */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
              {isEn ? 'Naive Intuition (Biased)' : 'Trực giác Tự nhiên (Sai lệch)'}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
              {naivePairs} {isEn ? 'comparisons' : 'phép so sánh'}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            {isEn ? (
              <>
                When entering a room of {currentN} people, you unconsciously anchor on yourself and
                wonder:
                <span className="font-semibold text-slate-800">
                  {' '}
                  &ldquo;Does anyone here share a birthday with ME?&rdquo;
                </span>
              </>
            ) : (
              <>
                Khi bước vào phòng có {currentN} người, bạn thường vô thức đặt mình làm mốc trung
                tâm và tự hỏi:
                <span className="font-semibold text-slate-800">
                  {' '}
                  &ldquo;Có ai ở đây sinh cùng ngày với TÔI không?&rdquo;
                </span>
              </>
            )}
          </p>

          <SimulationFormulaBox
            title={isEn ? 'Probability of sharing with YOU:' : 'Xác suất trùng với BẠN:'}
          >
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <span className="font-bold text-slate-900">{isEn ? 'P(you)' : 'P(bạn)'}</span>
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
          <p className="text-xs text-slate-500 italic">
            {isEn
              ? 'This single-target probability remains modest, creating the misleading illusion that shared birthdays are extraordinarily rare.'
              : 'Xác suất này rất nhỏ, tạo cảm giác sai lầm rằng biến cố trùng ngày sinh là cực kỳ hiếm thấy.'}
          </p>
        </div>

        {/* Cột 2: Bản chất toán học thực tế */}
        <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
              {isEn ? 'Actual Combinatorial Space' : 'Không gian Tổ hợp Thực tế'}
            </span>
            <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
              {currentPairs} {isEn ? 'pairwise comparisons!' : 'cặp đối sánh!'}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            {isEn ? (
              <>
                The paradox does not ask who shares a birthday with YOU, but looks for{' '}
                <span className="font-semibold text-blue-900">ANY PAIR OF PEOPLE</span> in the room.
                The number of pairwise tests scales quadratically:
                <span className="font-mono font-bold text-blue-900">
                  {' '}
                  C({currentN}, 2) = {currentN} &times; ({currentN} &minus; 1) / 2
                </span>
                .
              </>
            ) : (
              <>
                Nghịch lý không hỏi ai trùng với BẠN, mà tìm{' '}
                <span className="font-semibold text-blue-900">BẤT KỲ CẶP NGƯỜI NÀO</span> trong
                phòng trùng nhau. Số lượng cặp đối sánh tăng theo hàm bậc hai:
                <span className="font-mono font-bold text-blue-900">
                  {' '}
                  C({currentN}, 2) = {currentN} &times; ({currentN} &minus; 1) / 2
                </span>
                .
              </>
            )}
          </p>

          <SimulationFormulaBox
            title={
              isEn
                ? 'Combinatorial pairwise count & collision probability:'
                : 'Số cặp ghép đôi tổ hợp & xác suất va chạm:'
            }
          >
            <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
              <span className="font-bold">C({currentN}, 2)</span>
              <span>=</span>
              <MathFraction
                numerator={`${currentN} \u00D7 (${currentN} \u2212 1)`}
                denominator="2"
              />
              <span>=</span>
              <span className="font-bold text-blue-700">
                {currentPairs} {isEn ? 'pairs' : 'cặp'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center flex-wrap gap-2 text-xs">
              <span className="font-sans text-slate-600">
                {isEn ? `At n = ${currentN}:` : `Tại n = ${currentN}:`}
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
            {isEn
              ? `With ${currentPairs} pairwise comparison opportunities, having at least one shared birthday quickly becomes overwhelming and mathematically inevitable!`
              : `Với ${currentPairs} cơ hội đối sánh độc lập, việc xuất hiện ít nhất một cặp trùng trở thành biến cố tất yếu và rất khả dĩ!`}
          </p>
        </div>
      </div>
    </div>
  );
};
