'use client';

import * as React from 'react';
import { PolygonPreset, GALLERY_PRESETS } from '../art-gallery-math';
import { Button } from '@/components/ui/button';
import {
  Shuffle,
  RotateCcw,
  Wand2,
  Shield,
  Crosshair,
  Move,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Trophy,
  Award,
} from 'lucide-react';
import { MathFraction } from '@/features/simulations/components';
import { useTranslation } from '@/i18n';

export type GalleryInteractionMode = 'free' | 'vertex' | 'drag';

export interface GalleryControlsProps {
  currentPresetId: string | null;
  onSelectPreset: (preset: PolygonPreset) => void;
  onGenerateRandom: (numVertices: number) => void;
  onApplyFiskGuards: () => void;
  onReset: () => void;
  mode: GalleryInteractionMode;
  onChangeMode: (mode: GalleryInteractionMode) => void;
  showBlindSpots: boolean;
  onToggleBlindSpots: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  numVertices: number;
  guardsCount: number;
  coveragePercentage: number;
}

export const GalleryControls: React.FC<GalleryControlsProps> = ({
  currentPresetId,
  onSelectPreset,
  onGenerateRandom,
  onApplyFiskGuards,
  onReset,
  mode,
  onChangeMode,
  showBlindSpots,
  onToggleBlindSpots,
  isSoundEnabled,
  onToggleSound,
  numVertices,
  guardsCount,
  coveragePercentage,
}) => {
  const { dict } = useTranslation();
  const [randomVerticesCount, setRandomVerticesCount] = React.useState<number>(9);

  const chvatalBound = Math.floor(numVertices / 3);
  const isFullyCovered = coveragePercentage >= 99.5;
  const currentPreset = GALLERY_PRESETS.find(p => p.id === currentPresetId);

  // Challenge evaluation
  const challengeMedal = React.useMemo(() => {
    if (!isFullyCovered || guardsCount === 0) return null;

    if (currentPreset && guardsCount < currentPreset.recommendedGuards) {
      return {
        type: 'legendary' as const,
        icon: Trophy,
        label: dict.sim_art_gallery.medal_legendary,
        color: 'text-amber-700 bg-amber-50 border-amber-300',
      };
    }
    if (currentPreset && guardsCount === currentPreset.recommendedGuards) {
      return {
        type: 'optimal' as const,
        icon: Trophy,
        label: dict.sim_art_gallery.medal_optimal,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      };
    }
    if (guardsCount <= chvatalBound) {
      return {
        type: 'chvatal' as const,
        icon: Award,
        label: dict.sim_art_gallery.medal_chvatal,
        color: 'text-blue-700 bg-blue-50 border-blue-300',
      };
    }
    return {
      type: 'safe' as const,
      icon: Award,
      label: dict.sim_art_gallery.medal_safe,
      color: 'text-slate-700 bg-slate-50 border-slate-300',
    };
  }, [isFullyCovered, guardsCount, currentPreset, chvatalBound, dict.sim_art_gallery]);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-300/85 bg-white p-5 shadow-xs">
      {/* 1. Thư viện phòng mẫu (Presets) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
            {dict.sim_art_gallery.presets_title}
          </label>
          <span className="font-mono text-xs text-slate-500">
            {dict.sim_art_gallery.presets_available.replace(
              '{count}',
              String(GALLERY_PRESETS.length),
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GALLERY_PRESETS.map(preset => {
            const isSelected = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all duration-150 active:scale-[0.98] ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-1 ring-blue-500 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="font-sans text-xs font-semibold leading-tight line-clamp-1">
                  {dict.sim_art_gallery.preset_names[preset.id] ?? preset.name}
                </span>
                <span className="font-mono text-xs text-slate-500 mt-1">
                  {dict.sim_art_gallery.needs_guards
                    .replace('{vertices}', String(preset.vertices.length))
                    .replace('{guards}', String(preset.recommendedGuards))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* 2. Bộ tạo phòng ngẫu nhiên (Random Generator) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
            {dict.sim_art_gallery.random_room_title}
          </label>
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            {dict.sim_art_gallery.vertices_badge.replace('{count}', String(randomVerticesCount))}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-500">4</span>
            <input
              type="range"
              min="4"
              max="16"
              step="1"
              value={randomVerticesCount}
              onChange={e => setRandomVerticesCount(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <span className="font-mono text-xs text-slate-500">16</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>{dict.sim_art_gallery.simple_desc}</span>
            <span>{dict.sim_art_gallery.complex_desc}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => onGenerateRandom(randomVerticesCount)}
          className="w-full border-slate-300 hover:bg-slate-100 text-slate-800 font-medium text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Shuffle className="h-4 w-4 text-blue-600" />
          <span>
            {dict.sim_art_gallery.generate_btn.replace('{count}', String(randomVerticesCount))}
          </span>
        </Button>
      </div>

      <hr className="border-slate-200/80" />

      {/* 3. Chế độ tương tác & Thao tác buồng thí nghiệm */}
      <div className="space-y-3">
        <label className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
          {dict.sim_art_gallery.placement_mode_title}
        </label>

        {/* 3-Way Mode Segmented Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-100">
          <button
            type="button"
            onClick={() => onChangeMode('vertex')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-md text-xs font-medium transition-all ${
              mode === 'vertex'
                ? 'bg-white text-blue-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{dict.sim_art_gallery.mode_vertices_only}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('free')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-md text-xs font-medium transition-all ${
              mode === 'free'
                ? 'bg-white text-blue-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{dict.sim_art_gallery.mode_anywhere}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('drag')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-md text-xs font-medium transition-all ${
              mode === 'drag'
                ? 'bg-white text-blue-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Move className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{dict.sim_art_gallery.mode_drag_vertices}</span>
          </button>
        </div>

        {/* Dynamic Mode Helper Hint */}
        {mode === 'drag' && (
          <div className="text-xs text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded-lg p-2.5 font-sans leading-relaxed">
            {dict.sim_art_gallery.mode_drag_hint}
          </div>
        )}

        {/* Toggles: Lớp phủ điểm mù & Âm thanh */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleBlindSpots}
            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
              showBlindSpots
                ? 'border-rose-400 bg-rose-50/80 text-rose-900 font-semibold'
                : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {showBlindSpots ? (
                <Eye className="h-3.5 w-3.5 text-rose-600" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{dict.sim_art_gallery.blind_spots_toggle}</span>
            </span>
            <span
              className={`h-2 w-2 rounded-full ${showBlindSpots ? 'bg-rose-500' : 'bg-slate-300'}`}
            />
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
              isSoundEnabled
                ? 'border-blue-400 bg-blue-50/80 text-blue-900 font-semibold'
                : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {isSoundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-blue-600" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{dict.sim_art_gallery.sound_toggle}</span>
            </span>
            <span
              className={`h-2 w-2 rounded-full ${isSoundEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
            />
          </button>
        </div>

        {/* Action Buttons: Tự Đặt Lính (Steve Fisk) & Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            onClick={onApplyFiskGuards}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>{dict.sim_art_gallery.auto_fisk_btn}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>{dict.sim_art_gallery.reset_default_btn}</span>
          </Button>
        </div>
      </div>

      {/* 4. Thử Thách Tối Ưu Người Gác (Challenge Rating Card) */}
      <div className="border-t border-slate-200/80 pt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
            {dict.sim_art_gallery.challenge_title}
          </span>
          <span className="font-mono text-xs text-slate-500 inline-flex items-center">
            <span>&lfloor;</span>
            <MathFraction numerator="n" denominator="3" />
            <span>&rfloor; = {chvatalBound}</span>
          </span>
        </div>

        {challengeMedal ? (
          <div
            className={`flex items-start gap-2.5 p-3 rounded-lg border font-sans text-xs ${challengeMedal.color}`}
          >
            <challengeMedal.icon className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold">{challengeMedal.label}</div>
              <div className="font-mono text-xs opacity-85">
                {guardsCount} {dict.sim_art_gallery.guards_count.toLowerCase()} &bull;{' '}
                {coveragePercentage.toFixed(1)}% {dict.sim_art_gallery.coverage_title.toLowerCase()}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-50 text-slate-600 text-xs font-sans leading-relaxed border border-slate-200/70">
            {dict.sim_art_gallery.guard_tip_body}
          </div>
        )}
      </div>
    </div>
  );
};
