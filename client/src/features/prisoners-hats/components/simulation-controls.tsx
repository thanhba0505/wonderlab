'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Dices,
  Users,
  Palette,
  FastForward,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

interface SimulationControlsProps {
  n: number;
  onChangeN: (newN: number) => void;
  colorCount: 2 | 3;
  onChangeColorCount: (count: 2 | 3) => void;
  mode: 'auto' | 'roleplay';
  onChangeMode: (mode: 'auto' | 'roleplay') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepNext: () => void;
  onReset: () => void;
  onRandomize: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isCompleted: boolean;
  className?: string;
}

export function SimulationControls({
  n,
  onChangeN,
  colorCount,
  onChangeColorCount,
  mode,
  onChangeMode,
  isPlaying,
  onTogglePlay,
  onStepNext,
  onReset,
  onRandomize,
  playbackSpeed,
  onChangeSpeed,
  isCompleted,
  className = '',
}: SimulationControlsProps) {
  const { dict } = useTranslation();
  const t = dict.sim_prisoners_hats;

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 space-y-4 shadow-2xs',
        className,
      )}
    >
      {/* 1. Mode Segmented Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-lg border border-slate-200 gap-1 text-xs font-sans">
        <button
          type="button"
          onClick={() => onChangeMode('auto')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-semibold transition-all',
            mode === 'auto'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
          )}
        >
          <Play className="h-3.5 w-3.5 text-blue-600" />
          <span className="truncate">{t.mode_auto_tab}</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeMode('roleplay')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-semibold transition-all',
            mode === 'roleplay'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50',
          )}
        >
          <Sparkles
            className={cn('h-3.5 w-3.5', mode === 'roleplay' ? 'text-amber-300' : 'text-blue-600')}
          />
          <span className="truncate">{t.mode_roleplay_tab}</span>
        </button>
      </div>

      {/* 2. Playback Action Bar */}
      <div className="space-y-2">
        {/* Row A: Primary Play & Step */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={onTogglePlay}
            disabled={isCompleted}
            className={cn(
              'h-9 gap-1.5 text-xs font-bold shadow-xs active:scale-[0.98] transition-all',
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white',
            )}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>{t.pause_btn}</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>{t.run_auto_btn}</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onStepNext}
            disabled={isPlaying || isCompleted}
            className="h-9 gap-1.5 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900 shadow-2xs active:scale-[0.98]"
          >
            <SkipForward className="h-4 w-4 text-slate-600" />
            <span>{t.step_next_btn}</span>
          </Button>
        </div>

        {/* Row B: Reset & Randomize */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1.5 text-xs font-medium border-slate-200/90 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs active:scale-[0.98]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.reset_btn}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRandomize}
            className="h-8 gap-1.5 text-xs font-medium border-slate-200/90 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs active:scale-[0.98]"
          >
            <Dices className="h-3.5 w-3.5 text-slate-500" />
            <span>{t.randomize_btn}</span>
          </Button>
        </div>
      </div>

      {/* 3. Parameter Deck */}
      <div className="border-t border-slate-200/90 pt-3.5 space-y-3.5 text-xs font-sans">
        {/* Parameter 1: Number of prisoners (N) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-bold">
              <Users className="h-4 w-4 text-blue-600" />
              <span>{t.prisoners_count_label}</span>
            </span>
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50/90 border border-blue-200/70 px-2 py-0.5 rounded">
              {n} {t.people_unit}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[3, 4, 6, 8, 10].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => onChangeN(val)}
                className={cn(
                  'py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all text-center',
                  n === val
                    ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300',
                )}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Parameter 2: Color Space (k) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-bold">
              <Palette className="h-4 w-4 text-indigo-600" />
              <span>{t.color_space_label}</span>
            </span>
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50/90 border border-indigo-200/70 px-2 py-0.5 rounded">
              k = {colorCount}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeColorCount(2)}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-medium border transition-all',
                colorCount === 2
                  ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300',
              )}
            >
              <span className="flex items-center gap-1 shrink-0">
                <span className="inline-block h-3 w-3 rounded-full bg-white border border-slate-400" />
                <span className="inline-block h-3 w-3 rounded-full bg-slate-900 border border-slate-600" />
              </span>
              <span className="truncate">2 Màu (0, 1)</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeColorCount(3)}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-medium border transition-all',
                colorCount === 3
                  ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300',
              )}
            >
              <span className="flex items-center gap-1 shrink-0">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
              </span>
              <span className="truncate">3 Màu (Mod 3)</span>
            </button>
          </div>
        </div>

        {/* Parameter 3: Playback Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-bold">
              <FastForward className="h-4 w-4 text-slate-600" />
              <span>{t.speed_label}</span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              {playbackSpeed}x
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[0.5, 1, 1.5, 2].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => onChangeSpeed(speed)}
                className={cn(
                  'py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all text-center',
                  playbackSpeed === speed
                    ? 'border-slate-800 bg-slate-800 text-white font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300',
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
