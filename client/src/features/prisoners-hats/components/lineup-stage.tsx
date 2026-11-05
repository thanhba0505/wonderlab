'use client';

import * as React from 'react';
import { PrisonerState, ColorMeta, getColorMeta, SimulationStep } from '../hat-puzzle-math';
import { CheckCircle2, XCircle, HelpCircle, Volume2, EyeOff, Sparkles, Radio } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import { useHatSound } from '../utils/hat-audio';

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
  const { playBeaconSignal, playSurvivalChime } = useHatSound();

  const [hoveredPrisonerId, setHoveredPrisonerId] = React.useState<number | null>(null);

  const n = prisoners.length;
  // Current active prisoner ID (who is speaking now)
  const activePrisonerId = currentStep ? currentStep.prisonerId : null;

  // Effective hovered or active prisoner for showing field of view
  const spotlightPrisonerId = hoveredPrisonerId ?? activePrisonerId;

  // Sound triggering when currentStep changes
  React.useEffect(() => {
    if (!currentStep) return;
    if (currentStep.prisonerId === n) {
      playBeaconSignal();
    } else {
      playSurvivalChime(currentStepIndex, n);
    }
  }, [currentStep, currentStepIndex, n, playBeaconSignal, playSurvivalChime]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 sm:p-5">
      {/* Stage Header & Direction Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 text-xs text-slate-500 font-sans">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">
            {t.lineup_stage_title.replace('{n}', String(n))}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">
            {canEditHats ? t.click_to_cycle_colors : t.deduction_in_progress}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <Radio className="h-3.5 w-3.5 text-blue-600" />
            <span>{t.sight_direction.replace('{n}', String(n))}</span>
          </div>
        </div>
      </div>

      {/* Main Visual Stage (strictly stationary & locked: no overflow scrolling) */}
      <div className="relative mt-2 pb-2 pt-4 overflow-hidden select-none">
        {/* Dynamic Line-of-Sight Conical Light Beam radiating to the right from the speaker's eyes */}
        {spotlightPrisonerId !== null && spotlightPrisonerId > 1 && (
          <div
            className="absolute pointer-events-none z-0 h-24 -translate-y-1/2 overflow-hidden transition-all duration-300"
            style={{
              top: '80px',
              left: `${((n - spotlightPrisonerId) / Math.max(1, n - 1)) * 90 + 5}%`,
              right: '2%',
              background:
                'linear-gradient(90deg, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0.08) 60%, transparent 100%)',
              clipPath: 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%)',
            }}
          />
        )}

        {/* Visual Line of Sight Horizon */}
        <div className="absolute bottom-9 left-0 right-0 h-1 bg-slate-200/60 rounded-full" />

        {/* Row of Prisoners: strictly fixed layout, NO overflow-x-auto, no scrolling whatsoever */}
        {/* Line convention: Person N on the LEFT, facing RIGHT towards Person 1 */}
        <div className="relative z-10 flex items-end justify-between w-full gap-1 sm:gap-2 pb-3 pt-12">
          {prisoners
            .slice()
            .reverse() // Display Person N first on the left down to Person 1 on the right
            .map((prisoner, idx) => {
              const personId = prisoner.id;
              const isTurnActive = activePrisonerId === personId;
              const isTargetOfSpotlight =
                spotlightPrisonerId !== null && personId < spotlightPrisonerId;
              const isSpotlightSource = spotlightPrisonerId === personId;

              // Check if this person is roleplayed by user
              const isUserRole = isRolePlayActive && rolePlayPosition === personId;

              // Determine hat color display:
              // If user roleplay, hat is hidden until user has guessed or game ended
              const isHatHidden =
                isUserRole &&
                userGuessedColor === null &&
                (prisoner.guessedColor === null || currentStepIndex < n - personId + 1);

              const colorMeta: ColorMeta = getColorMeta(prisoner.actualColor, colorCount);
              const hatBorderColor =
                colorMeta.id === 0 ? '#cbd5e1' : colorCount === 2 ? '#172554' : '#1e293b';
              const hatRibbonColor =
                colorCount === 2
                  ? colorMeta.id === 0
                    ? '#94a3b8'
                    : '#3b82f6'
                  : colorMeta.id === 0
                    ? '#991b1b'
                    : colorMeta.id === 1
                      ? '#1d4ed8'
                      : '#a16207';

              // Position speech bubble safely on screen edges
              const bubbleAlignClass =
                idx === 0
                  ? 'left-0'
                  : idx === prisoners.length - 1
                    ? 'right-0'
                    : 'left-1/2 -translate-x-1/2';

              return (
                <div
                  key={prisoner.id}
                  className="relative flex flex-1 min-w-0 max-w-[76px] flex-col items-center group"
                  onMouseEnter={() => setHoveredPrisonerId(personId)}
                  onMouseLeave={() => setHoveredPrisonerId(null)}
                >
                  {/* Speech Bubble / Spoken Callout */}
                  <div
                    className={cn(
                      'absolute -top-14 transition-all duration-300 z-30 whitespace-nowrap',
                      bubbleAlignClass,
                      isTurnActive
                        ? 'opacity-100 scale-100 -translate-y-1'
                        : 'opacity-0 scale-90 pointer-events-none',
                    )}
                  >
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl">
                      <Volume2 className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      <span>
                        {t.calls_label}&quot;
                        {prisoner.guessedColor !== null
                          ? getColorMeta(prisoner.guessedColor, colorCount).label
                          : '...'}
                        &quot;
                      </span>
                    </div>
                    {/* Bubble Arrow */}
                    <div className="mx-auto h-2 w-2 rotate-45 bg-slate-900 -mt-1 shadow-xs" />
                  </div>

                  {/* Flying Parity Bit Particle Badge */}
                  {isTurnActive && prisoner.guessedColor !== null && (
                    <div className="absolute -top-4 z-40 animate-bounce pointer-events-none">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-xs font-bold shadow-md shadow-blue-500/40 border border-blue-400">
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                        <span>c = {prisoner.guessedColor}</span>
                      </div>
                    </div>
                  )}

                  {/* Target of Field of View Highlight */}
                  {isTargetOfSpotlight && (
                    <div className="absolute -inset-x-0.5 -inset-y-2 rounded-xl bg-blue-100/70 border border-blue-200/90 -z-10 animate-in fade-in-0 duration-200" />
                  )}

                  {/* Character Avatar Wrapper */}
                  <div
                    onClick={() => {
                      if (canEditHats && onSelectHatColor) {
                        onSelectHatColor(personId - 1);
                      }
                    }}
                    className={cn(
                      'relative flex flex-col items-center cursor-pointer transition-all duration-200 w-full',
                      canEditHats && 'hover:scale-105 active:scale-95',
                      isTurnActive &&
                        'ring-2 ring-blue-500 ring-offset-2 rounded-xl p-0.5 bg-blue-50/50',
                      !isTurnActive && 'p-0.5',
                    )}
                  >
                    {/* Blind Spot indicator on speaker's own hat */}
                    {isSpotlightSource && !isHatHidden && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded-full text-xs font-mono shadow-sm"
                        title={t.blind_spot_label || 'Điểm mù: Không thể thấy mũ trên đầu mình'}
                      >
                        <EyeOff className="h-3 w-3 text-amber-400" />
                      </div>
                    )}

                    {/* The Hat */}
                    <div className="relative z-10 -mb-1 flex items-center justify-center">
                      {isHatHidden ? (
                        // Hidden hat with mysterious question mark in roleplay mode
                        <div className="flex h-7 w-9 sm:h-8 sm:w-11 items-center justify-center rounded-t-lg border-2 border-dashed border-amber-500 bg-amber-50 shadow-xs animate-pulse">
                          <HelpCircle className="h-4 w-4 text-amber-600" />
                        </div>
                      ) : (
                        // Rendered Real Hat with tactile depth
                        <div
                          className={cn(
                            'relative flex flex-col items-center justify-center transition-all duration-200',
                            isTargetOfSpotlight &&
                              'scale-105 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
                          )}
                        >
                          {/* Crown */}
                          <div
                            className="relative flex h-6 w-8 sm:h-8 sm:w-11 flex-col items-center justify-center rounded-t-md border shadow-xs transition-colors duration-200"
                            style={{
                              backgroundColor: colorMeta.bgHex,
                              borderColor: hatBorderColor,
                            }}
                          >
                            {/* Decorative Ribbon */}
                            <div
                              className="absolute bottom-0 inset-x-0 h-1.5 opacity-90 border-t border-black/10"
                              style={{
                                backgroundColor: hatRibbonColor,
                              }}
                            />
                            <span
                              className="text-xs font-mono font-bold leading-none select-none z-10"
                              style={{ color: colorMeta.textHex }}
                            >
                              {colorMeta.id}
                            </span>
                          </div>

                          {/* Hat Brim */}
                          <div
                            className="h-1.5 w-10 sm:w-13 rounded-full border shadow-2xs -mt-0.5"
                            style={{
                              backgroundColor: colorMeta.bgHex,
                              borderColor: hatBorderColor,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Character Body (Vector Lab Silhouette) */}
                    <div className="relative flex flex-col items-center mt-0.5">
                      <svg
                        viewBox="0 0 48 54"
                        className="w-8 h-10 sm:w-11 sm:h-13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Head */}
                        <circle
                          cx="24"
                          cy="16"
                          r="11"
                          fill={isUserRole ? '#dbeafe' : '#f8fafc'}
                          stroke={isUserRole ? '#2563eb' : '#94a3b8'}
                          strokeWidth="1.5"
                        />
                        {/* Eyewear / Profile Eye facing Right */}
                        <path
                          d="M26 14 C30 14, 33 16, 33 17 C33 18, 30 19, 26 19 Z"
                          fill={isTurnActive ? '#2563eb' : '#64748b'}
                        />
                        <circle cx="28.5" cy="16.5" r="1.2" fill="#ffffff" />

                        {/* Torso & Lab Coat */}
                        <path
                          d="M12 50 C12 36, 17 31, 24 31 C31 31, 36 36, 36 50 Z"
                          fill={isTurnActive ? '#eff6ff' : '#f1f5f9'}
                          stroke={isTurnActive ? '#3b82f6' : '#94a3b8'}
                          strokeWidth="1.5"
                        />
                        <path d="M20 31 L24 40 L28 31" stroke="#cbd5e1" strokeWidth="1.5" />

                        {/* Chest Metallic Badge */}
                        <rect
                          x="18"
                          y="41"
                          width="12"
                          height="7"
                          rx="2"
                          fill="#ffffff"
                          stroke={isUserRole ? '#2563eb' : '#64748b'}
                          strokeWidth="1"
                        />
                        <text
                          x="24"
                          y="46.5"
                          textAnchor="middle"
                          fontSize="5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill={isUserRole ? '#1d4ed8' : '#334155'}
                        >
                          #{personId}
                        </text>
                      </svg>

                      {/* Status Icon once spoken */}
                      {prisoner.isCorrect !== null && (
                        <div className="absolute bottom-1 right-0 animate-in zoom-in-75 duration-200">
                          {prisoner.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-600 fill-rose-100" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Character Position Label & Role Tag */}
                  <div className="mt-1 text-center select-none w-full">
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      #{personId}
                    </span>
                    {personId === n && (
                      <span className="block text-xs font-semibold text-amber-700 font-sans truncate">
                        {t.sacrifice_badge}
                      </span>
                    )}
                    {isUserRole && (
                      <span className="block text-xs font-bold text-blue-600 font-sans truncate">
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
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">{t.legend_title}</span>
          {colorCount === 2 ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white shadow-2xs" />
                <span>{t.white_hat_0}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-3.5 w-3.5 rounded border shadow-2xs"
                  style={{ backgroundColor: '#1e3a8a', borderColor: '#172554' }}
                />
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
