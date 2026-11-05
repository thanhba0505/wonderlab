'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Trophy,
  XCircle,
  ArrowRightLeft,
  Lock,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { useTranslation } from '@/i18n';

export type MontyStep = 'pick' | 'revealed' | 'result';

export interface DoorsStageProps {
  step: MontyStep;
  carDoor: number;
  selectedDoor: number | null;
  revealedGoatDoor: number | null;
  finalDoor: number | null;
  didSwitch: boolean;
  switchRate: number | null;
  stayRate: number | null;
  onSelectDoor: (doorIndex: number) => void;
  onFinalDecision: (shouldSwitch: boolean) => void;
  onStartNewRound: () => void;
}

export const DoorsStage: React.FC<DoorsStageProps> = ({
  step,
  carDoor,
  selectedDoor,
  revealedGoatDoor,
  finalDoor,
  didSwitch,
  switchRate,
  stayRate,
  onSelectDoor,
  onFinalDecision,
  onStartNewRound,
}) => {
  const { dict } = useTranslation();
  const mDict = dict.sim_monty_hall;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Chỉ dẫn Tương tác Xúc giác */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          {step === 'pick' && (
            <>
              <span className="flex h-3 w-3 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 font-heading">
                  {mDict.step_pick}
                </div>
                <div className="text-xs text-slate-700 font-medium">{mDict.pick_prompt}</div>
              </div>
            </>
          )}

          {step === 'revealed' && (
            <>
              <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700 font-heading">
                  {mDict.step_revealed}
                </div>
                <div className="text-xs text-slate-700 font-medium">{mDict.switch_prompt}</div>
              </div>
            </>
          )}

          {step === 'result' && (
            <>
              {finalDoor === carDoor ? (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading flex items-center gap-1.5">
                      <span>{mDict.result_win}</span>
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs text-slate-700">
                      {didSwitch ? mDict.switch_strategy : mDict.stay_strategy} mang lại chiến
                      thắng.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 shrink-0">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-700 font-heading">
                      {mDict.result_lose}
                    </div>
                    <div className="text-xs text-slate-700">
                      {didSwitch ? mDict.switch_strategy : mDict.stay_strategy} chưa trúng xe lần
                      này.
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          variant={step === 'result' ? 'default' : 'outline'}
          onClick={onStartNewRound}
          className={`h-8 gap-1.5 text-xs font-semibold shrink-0 shadow-2xs active:scale-[0.98] ${
            step === 'result'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{step === 'result' ? mDict.new_round : mDict.reset_btn}</span>
        </Button>
      </div>

      {/* 2. Sân Khấu 3 Cánh Cửa Vault */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
        {[0, 1, 2].map(doorIndex => {
          const isSelected = selectedDoor === doorIndex;
          const isRevealedGoat = revealedGoatDoor === doorIndex;
          const isFinalChoice = finalDoor === doorIndex;
          const hasCar = carDoor === doorIndex;

          let borderClass = 'border-slate-300/85 hover:border-blue-500';
          let bgClass = 'bg-white hover:bg-slate-50/50';
          let shadowClass = 'shadow-2xs';

          if (step === 'revealed') {
            if (isSelected) {
              borderClass = 'border-blue-600 ring-2 ring-blue-500/20';
              bgClass = 'bg-blue-50/40';
              shadowClass = 'shadow-md shadow-blue-500/10';
            } else if (isRevealedGoat) {
              borderClass = 'border-amber-300';
              bgClass = 'bg-amber-50/30';
            } else {
              borderClass = 'border-violet-500 ring-2 ring-violet-500/20';
              bgClass = 'bg-violet-50/40';
              shadowClass = 'shadow-md shadow-violet-500/10';
            }
          } else if (step === 'result') {
            if (hasCar) {
              borderClass = 'border-emerald-600 ring-2 ring-emerald-500/25';
              bgClass = 'bg-emerald-50/60';
              shadowClass = 'shadow-md shadow-emerald-500/15';
            } else if (isFinalChoice) {
              borderClass = 'border-rose-400';
              bgClass = 'bg-rose-50/40';
            }
          }

          const handleDoorClick = () => {
            if (step === 'pick') {
              onSelectDoor(doorIndex);
            } else if (step === 'revealed') {
              if (isSelected) {
                onFinalDecision(false);
              } else if (!isRevealedGoat) {
                onFinalDecision(true);
              }
            }
          };

          return (
            <div
              key={`monty-door-${doorIndex}`}
              onClick={handleDoorClick}
              className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl border transition-all duration-200 min-h-[220px] ${borderClass} ${bgClass} ${shadowClass} ${
                step === 'pick' || (step === 'revealed' && !isRevealedGoat)
                  ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md'
                  : ''
              }`}
            >
              {/* Header cửa */}
              <div className="w-full flex items-center justify-between gap-1.5 pb-2.5 border-b border-slate-200/70">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {mDict.door_header} #{doorIndex + 1}
                </span>

                {isSelected && step !== 'result' && (
                  <Badge variant="cyan" className="text-xs">
                    {mDict.initial_choice}
                  </Badge>
                )}

                {isRevealedGoat && (
                  <Badge variant="amber" className="text-xs">
                    {mDict.host_opened_goat}
                  </Badge>
                )}

                {step === 'revealed' && !isSelected && !isRevealedGoat && (
                  <Badge variant="violet" className="text-xs font-bold animate-pulse">
                    {mDict.available_to_switch}
                  </Badge>
                )}

                {step === 'result' && hasCar && (
                  <Badge variant="emerald" className="text-xs font-bold">
                    {mDict.won_car}
                  </Badge>
                )}

                {step === 'result' && !hasCar && isFinalChoice && (
                  <Badge variant="destructive" className="text-xs">
                    {mDict.got_goat}
                  </Badge>
                )}
              </div>

              {/* Tâm điểm cửa: Biểu tượng & Hoạt ảnh */}
              <div className="my-auto flex flex-col items-center justify-center text-center py-4">
                {step === 'result' ? (
                  hasCar ? (
                    <div className="space-y-1.5 animate-in zoom-in-75">
                      <div className="text-5xl select-none filter drop-shadow-sm">🏎️</div>
                      <div className="font-heading font-bold text-xs text-emerald-800 uppercase tracking-wider">
                        {mDict.sports_car}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 animate-in zoom-in-75">
                      <div className="text-5xl select-none">🐐</div>
                      <div className="font-heading font-medium text-xs text-slate-500 uppercase tracking-wider">
                        {mDict.goat_grass}
                      </div>
                    </div>
                  )
                ) : isRevealedGoat ? (
                  <div className="space-y-1.5 animate-in fade-in">
                    <div className="text-5xl select-none">🐐</div>
                    <div className="font-heading font-semibold text-xs text-amber-800 uppercase tracking-wider">
                      {mDict.behind_is_goat}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors border border-slate-200/60">
                      <Lock className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-800 group-hover:text-blue-700 transition-colors tabular-nums">
                      0{doorIndex + 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Đáy cửa: Nút hành động */}
              <div className="w-full pt-2">
                {step === 'pick' && (
                  <div className="w-full text-center py-1">
                    <span className="text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                      {mDict.click_to_select}
                    </span>
                  </div>
                )}

                {step === 'revealed' &&
                  !isRevealedGoat &&
                  (isSelected ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        onFinalDecision(false);
                      }}
                      className="w-full text-xs font-semibold border-blue-300 bg-white hover:bg-blue-50 text-blue-900 h-8 shadow-2xs active:scale-[0.98]"
                    >
                      {mDict.stay_btn} (33.3%)
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onFinalDecision(true);
                      }}
                      className="w-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs bg-violet-600 hover:bg-violet-700 text-white h-8 active:scale-[0.98]"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      <span>{mDict.switch_btn} (66.7%)</span>
                    </Button>
                  ))}

                {step === 'result' && (
                  <div className="w-full text-center py-0.5">
                    <span className="text-xs font-mono text-slate-500">
                      {hasCar ? mDict.grand_prize : mDict.no_prize}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Sơ đồ Nhánh Xác suất Bayes Động (Dynamic Bayesian Probability Tree) */}
      <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-violet-600" />
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
              {mDict.bayes_explainer_title}
            </h4>
          </div>
          <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
            {mDict.bayes_theorem_badge}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Nhánh 1: Cửa người chơi chọn */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              selectedDoor !== null
                ? 'border-blue-300 bg-blue-50/50 text-blue-900'
                : 'border-slate-200 bg-slate-50/60 text-slate-600'
            }`}
          >
            <div className="font-semibold text-slate-800 flex items-center justify-between pb-1">
              <span>1. Cửa bạn chọn</span>
              <span className="font-mono font-bold text-blue-700">P = 1/3</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-sans">{mDict.bayes_initial_prob}</p>
          </div>

          {/* Nhánh 2: Bộ lọc thông tin của MC */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              revealedGoatDoor !== null
                ? 'border-amber-300 bg-amber-50/50 text-amber-900'
                : 'border-slate-200 bg-slate-50/60 text-slate-600'
            }`}
          >
            <div className="font-semibold text-slate-800 flex items-center justify-between pb-1">
              <span>2. Bộ lọc của MC</span>
              <span className="font-mono font-bold text-amber-700">P(Dê bị mở) = 0</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-sans">{mDict.bayes_host_filter}</p>
          </div>

          {/* Nhánh 3: Xác suất dồn về cửa còn lại */}
          <div
            className={`p-3 rounded-lg border transition-all ${
              step === 'revealed' || step === 'result'
                ? 'border-violet-300 bg-violet-50/60 text-violet-900'
                : 'border-slate-200 bg-slate-50/60 text-slate-600'
            }`}
          >
            <div className="font-semibold text-slate-800 flex items-center justify-between pb-1">
              <span>3. Cửa đổi sang</span>
              <span className="font-mono font-bold text-violet-700">P = 2/3</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-sans">{mDict.bayes_conclusion}</p>
          </div>
        </div>
      </div>

      {/* 4. Thanh Phổ Đối Sánh Phân Bổ (Empirical vs Theoretical) */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
            <span className="font-bold text-blue-900">{mDict.switch_strategy}:</span>
            <span className="font-mono font-bold text-blue-700 tabular-nums">
              {switchRate !== null ? `${switchRate}%` : mDict.no_data}
            </span>
            <span className="text-slate-500 font-mono">({mDict.theory_switch})</span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-600 shrink-0" />
            <span className="font-bold text-violet-900">{mDict.stay_strategy}:</span>
            <span className="font-mono font-bold text-violet-700 tabular-nums">
              {stayRate !== null ? `${stayRate}%` : mDict.no_data}
            </span>
            <span className="text-slate-500 font-mono">({mDict.theory_stay})</span>
          </div>
        </div>

        {/* Progress bar so sánh */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative flex border border-slate-200/80">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${switchRate ?? 0}%` }}
            title={`${mDict.switch_strategy}: ${switchRate ?? 0}%`}
          />
          <div
            className="bg-violet-600 h-full transition-all duration-300 ml-auto"
            style={{ width: `${stayRate ?? 0}%` }}
            title={`${mDict.stay_strategy}: ${stayRate ?? 0}%`}
          />
          {/* Mốc lý thuyết 66.7% cho Đổi */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
            style={{ left: '66.7%' }}
            title={mDict.theory_switch}
          />
          {/* Mốc lý thuyết 33.3% */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
            style={{ left: '33.3%' }}
            title={mDict.theory_stay}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
          <span>0%</span>
          <span className="italic">
            {mDict.theory_stay} / {mDict.theory_switch}
          </span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
