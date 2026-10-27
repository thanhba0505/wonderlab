'use client';

import * as React from 'react';
import { PrisonerState, ColorMeta, getColorMeta, SimulationStep } from '../hat-puzzle-math';
import { CheckCircle2, XCircle, HelpCircle, Eye, Volume2 } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface LineupStageProps {
  prisoners: PrisonerState[];
  colorCount: 2 | 3;
  currentStepIndex: number;
  currentStep: SimulationStep | null;
  rolePlayPosition: number | null; // 1 to N if in roleplay mode
  isRolePlayActive: boolean;
  userGuessedColor: number | null;
  onSelectHatColor?: (prisonerIndex: number) => void;
  canEditHats?: boolean;
}

export function LineupStage({
  prisoners,
  colorCount,
  currentStepIndex,
  currentStep,
  rolePlayPosition,
  isRolePlayActive,
  userGuessedColor,
  onSelectHatColor,
  canEditHats = false,
}: LineupStageProps) {
  const { dict } = useTranslation();
  const t = dict.sim_prisoners_hats;
  const [hoveredPrisonerId, setHoveredPrisonerId] = React.useState<number | null>(null);

  const n = prisoners.length;
  // Current active prisoner ID (who is speaking now)
  const activePrisonerId = currentStep ? currentStep.prisonerId : null;

  // Effective hovered or active prisoner for showing field of view
  const spotlightPrisonerId = hoveredPrisonerId ?? activePrisonerId;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-300/85 bg-white p-4 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]">
      {/* Stage Header & Direction Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">
            {t.lineup_stage_title.replace('{n}', String(n))}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">
            {canEditHats ? t.click_to_cycle_colors : t.deduction_in_progress}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <span>{t.line_of_sight}</span>
          <span className="font-semibold text-blue-600">
            {t.sight_direction.replace('{n}', String(n))}
          </span>
        </div>
      </div>

      {/* Main Visual Stage */}
      <div className="relative mt-6 pb-4 pt-8">
        {/* Visual Line of Sight Horizon */}
        <div className="absolute bottom-8 left-0 right-0 h-1 bg-slate-100 rounded-full border-b border-slate-200" />

        {/* Row of Prisoners */}
        {/* Line convention: Person N on the LEFT, facing RIGHT towards Person 1 */}
        <div className="relative z-10 flex items-end justify-between gap-2 sm:gap-3 overflow-x-auto pb-4 pt-10">
          {prisoners
            .slice()
            .reverse() // Display Person N first on the left down to Person 1 on the right
            .map(prisoner => {
              const personId = prisoner.id;
              const isTurnActive = activePrisonerId === personId;
              const isTargetOfSpotlight =
                spotlightPrisonerId !== null && personId < spotlightPrisonerId;

              // Check if this person is roleplayed by user
              const isUserRole = isRolePlayActive && rolePlayPosition === personId;

              // Determine hat color display:
              // If user roleplay, hat is hidden until user has guessed or game ended
              const isHatHidden =
                isUserRole &&
                userGuessedColor === null &&
                (prisoner.guessedColor === null || currentStepIndex < n - personId + 1);

              const colorMeta: ColorMeta = getColorMeta(prisoner.actualColor, colorCount);

              return (
                <div
                  key={prisoner.id}
                  className="relative flex flex-col items-center group transition-transform duration-200"
                  onMouseEnter={() => setHoveredPrisonerId(personId)}
                  onMouseLeave={() => setHoveredPrisonerId(null)}
                >
                  {/* Speech Bubble / Thought Banner */}
                  <div
                    className={`absolute -top-12 transition-all duration-300 z-20 whitespace-nowrap ${
                      isTurnActive
                        ? 'opacity-100 scale-100 -translate-y-1'
                        : 'opacity-0 scale-90 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                      <Volume2 className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
                      <span>
                        {t.calls_label}&quot;
                        {prisoner.guessedColor !== null
                          ? getColorMeta(prisoner.guessedColor, colorCount).label
                          : '...'}
                        &quot;
                      </span>
                    </div>
                    {/* Bubble Arrow */}
                    <div className="mx-auto h-1.5 w-1.5 rotate-45 bg-slate-900 -mt-1" />
                  </div>

                  {/* Field of View Indicator when Hovered or Active */}
                  {isTargetOfSpotlight && (
                    <div className="absolute -inset-x-1.5 -inset-y-2 rounded-lg bg-blue-50/70 border border-blue-200/60 -z-10 animate-fade-in" />
                  )}

                  {/* Character Avatar Wrapper */}
                  <div
                    onClick={() => {
                      if (canEditHats && onSelectHatColor) {
                        onSelectHatColor(personId - 1);
                      }
                    }}
                    className={`relative flex flex-col items-center cursor-pointer transition-all ${
                      canEditHats ? 'hover:scale-105 active:scale-95' : ''
                    } ${isTurnActive ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl p-1 bg-blue-50/30' : 'p-1'}`}
                  >
                    {/* The Hat */}
                    <div className="relative z-10 -mb-1 flex items-center justify-center">
                      {isHatHidden ? (
                        // Hidden hat with mysterious question mark
                        <div className="flex h-8 w-11 items-center justify-center rounded-t-lg border-2 border-dashed border-amber-500 bg-amber-50 shadow-xs animate-pulse">
                          <HelpCircle className="h-4 w-4 text-amber-600" />
                        </div>
                      ) : (
                        // Rendered Real Hat
                        <div
                          className="relative flex h-8 w-11 flex-col items-center justify-center rounded-t-lg border shadow-xs transition-colors duration-200"
                          style={{
                            backgroundColor: colorMeta.bgHex,
                            borderColor: colorMeta.id === 0 ? '#cbd5e1' : '#0f172a',
                          }}
                        >
                          {/* Hat Brim */}
                          <div
                            className="absolute -bottom-1 h-1.5 w-14 rounded-full border shadow-2xs"
                            style={{
                              backgroundColor: colorMeta.bgHex,
                              borderColor: colorMeta.id === 0 ? '#cbd5e1' : '#0f172a',
                            }}
                          />
                          <span
                            className="text-xs font-mono font-bold leading-none select-none z-10"
                            style={{ color: colorMeta.textHex }}
                          >
                            {colorMeta.id}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Character Body (Clean Scientific Silhouette) */}
                    <div className="relative flex flex-col items-center">
                      {/* Head */}
                      <div className="h-9 w-9 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center shadow-2xs">
                        {isUserRole ? (
                          <span className="text-xs font-bold text-blue-700">{t.you_label}</span>
                        ) : (
                          <span className="text-xs font-mono font-semibold text-slate-700">
                            #{personId}
                          </span>
                        )}
                      </div>

                      {/* Torso */}
                      <div className="mt-0.5 h-11 w-12 rounded-t-md border border-slate-300 bg-slate-200/90 flex flex-col items-center justify-between p-1">
                        {/* Eye Direction Indicator (Facing Right) */}
                        <div className="w-full flex justify-end pr-0.5">
                          <Eye className="h-2.5 w-2.5 text-slate-500" />
                        </div>

                        {/* Status Icon once spoken */}
                        {prisoner.isCorrect !== null && (
                          <div className="mb-0.5 animate-scale-in">
                            {prisoner.isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-600 fill-rose-100" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Character Position Label & Role Tag */}
                  <div className="mt-2 text-center">
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      #{personId}
                    </span>
                    {personId === n && (
                      <span className="block text-xs font-medium text-amber-700 font-sans">
                        {t.sacrifice_badge}
                      </span>
                    )}
                    {isUserRole && (
                      <span className="block text-xs font-bold text-blue-600 font-sans">
                        {t.your_spot_badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Stage Legend & Controls Note */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">{t.legend_title}</span>
          {colorCount === 2 ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white shadow-2xs" />
                <span>{t.white_hat_0}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-slate-800 bg-slate-900 shadow-2xs" />
                <span>{t.black_hat_1}</span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-rose-500 shadow-2xs" />
                <span>{t.red_hat_0}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-blue-600 shadow-2xs" />
                <span>{t.blue_hat_1}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-amber-400 shadow-2xs" />
                <span>{t.yellow_hat_2}</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-sans">
          <span>{t.hover_field_of_view_hint}</span>
        </div>
      </div>
    </div>
  );
}
