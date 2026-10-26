'use client';

import * as React from 'react';
import { PolygonPreset, GALLERY_PRESETS } from '../art-gallery-math';
import { Button } from '@/components/ui/button';
import { Shuffle, RotateCcw, Wand2, Shield, Crosshair } from 'lucide-react';
import { useTranslation } from '@/i18n';

export interface GalleryControlsProps {
  currentPresetId: string | null;
  onSelectPreset: (preset: PolygonPreset) => void;
  onGenerateRandom: (numVertices: number) => void;
  onApplyFiskGuards: () => void;
  onReset: () => void;
  isVertexOnlyMode: boolean;
  onToggleVertexMode: (vertexOnly: boolean) => void;
}

export const GalleryControls: React.FC<GalleryControlsProps> = ({
  currentPresetId,
  onSelectPreset,
  onGenerateRandom,
  onApplyFiskGuards,
  onReset,
  isVertexOnlyMode,
  onToggleVertexMode,
}) => {
  const { dict } = useTranslation();
  const [randomVerticesCount, setRandomVerticesCount] = React.useState<number>(9);

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

      {/* 3. Chế độ đặt lính & Thao tác tự động */}
      <div className="space-y-3">
        <label className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
          {dict.sim_art_gallery.placement_mode_title}
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onToggleVertexMode(true)}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
              isVertexOnlyMode
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span>{dict.sim_art_gallery.mode_vertices_only}</span>
          </button>

          <button
            onClick={() => onToggleVertexMode(false)}
            className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
              !isVertexOnlyMode
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5 text-blue-600" />
            <span>{dict.sim_art_gallery.mode_anywhere}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <Button
            onClick={onApplyFiskGuards}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>{dict.sim_art_gallery.auto_fisk_btn}</span>
          </Button>

          <Button
            variant="outline"
            onClick={onReset}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>{dict.sim_art_gallery.reset_default_btn}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
