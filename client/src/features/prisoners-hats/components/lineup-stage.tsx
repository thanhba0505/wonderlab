'use client';

import * as React from 'react';
import { PrisonerState, ColorMeta, getColorMeta, SimulationStep } from '../hat-puzzle-math';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  EyeOff,
  Sparkles,
  Radio,
  VolumeX,
} from 'lucide-react';
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
  const { isMuted, toggleMute, playBeaconSignal, playSurvivalChime } = useHatSound();

  const [hoveredPrisonerId, setHoveredPrisonerId] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

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

  // Auto-scroll to center the active prisoner in viewport when N >= 8
  React.useEffect(() => {
    if (activePrisonerId === null || !containerRef.current) return;
    const targetEl = itemRefs.current.get(activePrisonerId);
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activePrisonerId]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-300/85 bg-white p-4 sm:p-6 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)]">
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
          {/* Quick Audio Mute Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors',
              isMuted
                ? 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                : 'bg-blue-50 border-blue-200 text-blue-700 font-semibold',
            )}
            title={isMuted ? 'Bật âm thanh mô phỏng' : 'Tắt âm thanh mô phỏng'}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-blue-600" />
            )}
            <span>{isMuted ? 'MUTE' : 'SOUND'}</span>
          </button>

          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <Radio className="h-3.5 w-3.5 text-blue-600" />
            <span>{t.sight_direction.replace('{n}', String(n))}</span>
          </div>
        </div>
      </div>

      {/* Main Visual Stage */}
      <div className="relative mt-4 pb-2 pt-6">
        {/* Visual Line of Sight Horizon */}
        <div className="absolute bottom-10 left-0 right-0 h-1 bg-slate-100 rounded-full border-b border-slate-200" />

        {/* Scrollable Row of Prisoners */}
        {/* Line convention: Person N on the LEFT, facing RIGHT towards Person 1 */}
        <div
          ref={containerRef}
          className="relative z-10 flex items-end justify-between gap-3 sm:gap-4 overflow-x-auto pb-4 pt-12 scroll-smooth"
        >
          {prisoners
            .slice()
            .reverse() // Display Person N first on the left down to Person 1 on the right
            .map(prisoner => {
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

              return (
                <div
                  key={prisoner.id}
                  ref={el => {
                    if (el) itemRefs.current.set(personId, el);
                    else itemRefs.current.delete(personId);
                  }}
                  className="relative flex flex-col items-center group shrink-0"
                  onMouseEnter={() => setHoveredPrisonerId(personId)}
                  onMouseLeave={() => setHoveredPrisonerId(null)}
                >
                  {/* Dynamic Line-of-Sight Conical Light Beam radiating to the right */}
                  {isSpotlightSource && (
                    <div
                      className="absolute top-14 left-1/2 w-[700px] h-28 pointer-events-none z-0 -translate-y-1/2"
                      style={{
                        background:
                          'radial-gradient(ellipse at left, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 80%)',
                        clipPath: 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%)',
                      }}
                    />
                  )}

                  {/* Speech Bubble / Spoken Callout */}
                  <div
                    className={cn(
                      'absolute -top-14 transition-all duration-300 z-30 whitespace-nowrap',
                      isTurnActive
                        ? 'opacity-100 scale-100 -translate-y-1'
                        : 'opacity-0 scale-90 pointer-events-none',
                    )}
                  >
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl">
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
                    <div className="absolute -inset-x-2 -inset-y-3 rounded-xl bg-blue-50/80 border border-blue-200/90 -z-10 animate-in fade-in-0 duration-200" />
                  )}

                  {/* Character Avatar Wrapper */}
                  <div
                    onClick={() => {
                      if (canEditHats && onSelectHatColor) {
                        onSelectHatColor(personId - 1);
                      }
                    }}
                    className={cn(
                      'relative flex flex-col items-center cursor-pointer transition-all duration-200',
                      canEditHats && 'hover:scale-105 active:scale-95',
                      isTurnActive &&
                        'ring-2 ring-blue-500 ring-offset-2 rounded-xl p-1 bg-blue-50/40',
                      !isTurnActive && 'p-1',
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
                        <div className="flex h-9 w-12 items-center justify-center rounded-t-lg border-2 border-dashed border-amber-500 bg-amber-50 shadow-xs animate-pulse">
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
                            className="relative flex h-8 w-11 flex-col items-center justify-center rounded-t-md border shadow-xs transition-colors duration-200"
                            style={{
                              backgroundColor: colorMeta.bgHex,
                              borderColor: colorMeta.id === 0 ? '#cbd5e1' : '#0f172a',
                            }}
                          >
                            {/* Decorative Ribbon */}
                            <div
                              className="absolute bottom-0 inset-x-0 h-1.5 opacity-80 border-t border-black/10"
                              style={{
                                backgroundColor: colorMeta.id === 0 ? '#94a3b8' : '#334155',
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
                            className="h-1.5 w-14 rounded-full border shadow-2xs -mt-0.5"
                            style={{
                              backgroundColor: colorMeta.bgHex,
                              borderColor: colorMeta.id === 0 ? '#cbd5e1' : '#0f172a',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Character Body (Vector Lab Silhouette) */}
                    <div className="relative flex flex-col items-center mt-1">
                      <svg
                        viewBox="0 0 48 54"
                        className="w-12 h-14"
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
                  <div className="mt-2 text-center select-none">
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      #{personId}
                    </span>
                    {personId === n && (
                      <span className="block text-xs font-semibold text-amber-700 font-sans">
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

      {/* Mini-map Jumper Bar for larger N */}
      {n >= 8 && (
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
          <span className="text-slate-400 font-mono text-xs">MINIMAP</span>
          <div className="flex items-center gap-1">
            {prisoners
              .slice()
              .reverse()
              .map(p => {
                const isActive = activePrisonerId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      const el = itemRefs.current.get(p.id);
                      if (el) {
                        el.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                          inline: 'center',
                        });
                      }
                    }}
                    className={cn(
                      'h-5 px-1.5 rounded font-mono text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : p.isCorrect === true
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.isCorrect === false
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    #{p.id}
                  </button>
                );
              })}
          </div>
        </div>
      )}

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
