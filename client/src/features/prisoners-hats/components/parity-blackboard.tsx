'use client';

import * as React from 'react';
import { SimulationStep, PrisonerState, getColorMeta, getPalette } from '../hat-puzzle-math';
import { Binary, Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface ParityBlackboardProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  prisoners: PrisonerState[];
  colorCount: 2 | 3;
}

export function ParityBlackboard({
  steps,
  currentStepIndex,
  prisoners,
  colorCount,
}: ParityBlackboardProps) {
  const { dict } = useTranslation();
  const t = dict.sim_prisoners_hats;
  const currentStep = steps[currentStepIndex] ?? null;
  const initialStep = steps[0] ?? null;
  const palette = getPalette(colorCount);

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <Binary className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900">{t.blackboard_title}</h3>
            <p className="text-xs text-slate-500 font-sans">{t.blackboard_desc}</p>
          </div>
        </div>

        {initialStep && (
          <div className="font-mono text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700">
            <span className="text-slate-500 font-sans">
              {t.root_signal_label.replace('{id}', String(initialStep.prisonerId))}
            </span>
            <span className="font-bold text-blue-700">
              {palette[initialStep.spokenColor]?.label} ({initialStep.spokenColor})
            </span>
          </div>
        )}
      </div>

      {/* Active Turn Formula Callout */}
      {currentStep ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span className="flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              {t.current_turn_label.replace('{id}', String(currentStep.prisonerId))}
            </span>
            <span className="font-mono text-blue-700 bg-white/80 px-2 py-0.5 rounded border border-blue-200">
              {t.step_progress
                .replace('{step}', String(currentStepIndex + 1))
                .replace('{total}', String(steps.length))}
            </span>
          </div>

          <div className="font-mono text-xs sm:text-sm text-slate-800 bg-white p-2.5 rounded-md border border-blue-100 flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-sans">{t.formula_label}</span>
            <span className="font-bold text-blue-700">{currentStep.formulaString}</span>
          </div>

          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            {currentStep.reasoning}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
          {t.step_next_hint}
        </div>
      )}

      {/* Live Ledger Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold font-mono">
            <tr>
              <th className="py-2.5 px-3">{t.turn_col}</th>
              <th className="py-2.5 px-3">{t.position_col}</th>
              <th className="py-2.5 px-3">{t.actual_hat_col}</th>
              <th className="py-2.5 px-3">{t.seen_ahead_col}</th>
              <th className="py-2.5 px-3">{t.expected_parity_col}</th>
              <th className="py-2.5 px-3">{t.spoken_col}</th>
              <th className="py-2.5 px-3 text-center">{t.result_col}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {steps.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const prisoner = prisoners.find(p => p.id === step.prisonerId);
              const spokenMeta = getColorMeta(step.spokenColor, colorCount);
              const actualMeta = prisoner
                ? getColorMeta(prisoner.actualColor, colorCount)
                : spokenMeta;

              return (
                <tr
                  key={step.stepIndex}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-blue-50/80 font-semibold text-blue-900'
                      : isPast
                        ? 'bg-white text-slate-800'
                        : 'opacity-40 text-slate-400 bg-slate-50/30'
                  }`}
                >
                  <td className="py-2 px-3 font-semibold text-slate-500">#{idx + 1}</td>
                  <td className="py-2 px-3">
                    {t.person_tag.replace('{id}', String(step.prisonerId))}
                    {prisoner?.isSacrifice && (
                      <span className="ml-1 text-amber-600 font-sans text-xs">
                        {t.sacrifice_tag}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {isPast ? (
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: actualMeta.bgHex }}
                        />
                        <span>{actualMeta.label}</span>
                      </span>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {isPast ? `mod ${colorCount} = ${step.seenSumAhead}` : '--'}
                  </td>
                  <td className="py-2 px-3">{isPast ? step.runningParity : '--'}</td>
                  <td className="py-2 px-3">
                    {isPast ? (
                      <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: spokenMeta.bgHex }}
                        />
                        <span>{spokenMeta.label}</span>
                      </span>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {isPast ? (
                      step.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <Check className="h-3.5 w-3.5" /> {t.correct_label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <X className="h-3.5 w-3.5" /> {t.wrong_label}
                        </span>
                      )
                    ) : (
                      <span className="text-slate-400">{t.waiting_label}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note about parity subtraction */}
      <div className="flex items-start gap-2 text-xs text-slate-500 font-sans bg-slate-50 p-2.5 rounded-md border border-slate-200">
        <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          <strong>{t.subtraction_rule_title}</strong>{' '}
          {t.subtraction_rule_desc.includes('{formula}') ? (
            <>
              {t.subtraction_rule_desc.split('{formula}')[0]}
              <code className="text-blue-700 font-bold">{'P_{k-1} = (P_k - c_k) mod K'}</code>
              {t.subtraction_rule_desc.split('{formula}')[1]}
            </>
          ) : (
            t.subtraction_rule_desc
          )}
        </span>
      </div>
    </div>
  );
}
