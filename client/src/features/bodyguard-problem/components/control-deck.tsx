'use client';

import React from 'react';
import {
  Point,
  BODYGUARD_PRESETS,
  BodyguardPreset,
} from '@/features/bodyguard-problem/bodyguard-math';
import {
  Shield,
  ShieldAlert,
  RotateCcw,
  Eye,
  Compass,
  Target,
  SunMedium,
  Magnet,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export type ViewMode = 'dual' | 'room' | 'unfolded';
export type RayMode = 'targeted' | 'sweep360' | 'manual';

interface ControlDeckProps {
  source: Point;
  target: Point;
  guardsCount: number;
  showGuards: boolean;
  setShowGuards: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  rayMode: RayMode;
  setRayMode: (v: RayMode) => void;
  maxBounces: number;
  setMaxBounces: (v: number) => void;
  rayCount: number;
  setRayCount: (v: number) => void;
  manualAngle: number;
  setManualAngle: (v: number) => void;
  activePresetId: string;
  onSelectPreset: (preset: BodyguardPreset) => void;
  onReset: () => void;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => void;
  onAudioShieldToggle?: (active: boolean) => void;
  onAudioPresetChange?: () => void;
  onAudioModeChange?: () => void;
}

export function ControlDeck({
  source,
  target,
  guardsCount,
  showGuards,
  setShowGuards,
  viewMode,
  setViewMode,
  rayMode,
  setRayMode,
  maxBounces,
  setMaxBounces,
  rayCount,
  setRayCount,
  manualAngle,
  setManualAngle,
  activePresetId,
  onSelectPreset,
  onReset,
  snapToGrid,
  setSnapToGrid,
  onAudioShieldToggle,
  onAudioPresetChange,
  onAudioModeChange,
}: ControlDeckProps): React.JSX.Element {
  const activePreset =
    BODYGUARD_PRESETS.find(p => p.id === activePresetId) ?? BODYGUARD_PRESETS[0]!;

  const handleToggleShield = () => {
    const nextState = !showGuards;
    setShowGuards(nextState);
    onAudioShieldToggle?.(nextState);
  };

  const handlePresetClick = (preset: BodyguardPreset) => {
    onSelectPreset(preset);
    onAudioPresetChange?.();
  };

  const handleViewModeClick = (mode: ViewMode) => {
    setViewMode(mode);
    onAudioModeChange?.();
  };

  const handleRayModeClick = (mode: RayMode) => {
    setRayMode(mode);
    onAudioModeChange?.();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Thư viện Cấu hình Mẫu */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Cấu hình đối xứng mẫu
          </span>
          <button
            type="button"
            onClick={onReset}
            title="Thiết lập lại mặc định ban đầu"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Mặc định</span>
          </button>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BODYGUARD_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/60 shadow-2xs ring-1 ring-blue-400/40'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span
                    className={`font-heading text-xs font-semibold ${
                      isActive ? 'text-blue-900' : 'text-slate-800'
                    }`}
                  >
                    {preset.nameVi.split('(')[0]?.trim()}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {preset.expectedGuards} điểm
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-slate-500 leading-snug">
                  {preset.descriptionVi}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Preset Explanation Strip */}
        <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Đặc tính: </span>
          {activePreset.descriptionVi}
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* 2. Chế độ Góc Nhìn & Bắt Điểm */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Góc nhìn quan sát
          </span>

          {/* Snap-to-grid toggle */}
          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              snapToGrid
                ? 'border border-blue-400 bg-blue-50 text-blue-700'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title="Tự động bắt điểm lưới 0.05 đơn vị khi kéo nốt A và B"
          >
            <Magnet className="h-3 w-3" />
            <span>Lưới 0.05</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200/90 bg-slate-100/80 p-1">
          <button
            type="button"
            onClick={() => handleViewModeClick('dual')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
              viewMode === 'dual'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Song song</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeClick('room')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
              viewMode === 'room'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Phòng Gương</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeClick('unfolded')}
            className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
              viewMode === 'unfolded'
                ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lưới Phẳng</span>
          </button>
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* 3. Công Tắc Lá Chắn Vệ Sĩ Gutkin */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
          Trạng thái lá chắn bảo vệ
        </span>
        <button
          type="button"
          onClick={handleToggleShield}
          className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-semibold transition-all active:scale-[0.99] ${
            showGuards
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-2xs hover:bg-emerald-100/70'
              : 'border-amber-300 bg-amber-50 text-amber-900 shadow-2xs hover:bg-amber-100/70'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {showGuards ? (
              <Shield className="h-5 w-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            )}
            <div className="text-left">
              <div className="leading-tight">
                {showGuards ? `${guardsCount} Vệ Sĩ Đang Hoạt Động` : 'Vệ Sĩ Đang Tắt'}
              </div>
              <div className="text-xs font-normal opacity-85">
                {showGuards
                  ? 'Bảo vệ tuyệt đối 100% mọi tia phản xạ'
                  : 'Mục tiêu B đang bị chiếu sáng tự do'}
              </div>
            </div>
          </div>
          <span
            className={`rounded-md px-2 py-1 font-mono text-xs font-bold ${
              showGuards ? 'bg-emerald-200/70 text-emerald-900' : 'bg-amber-200/70 text-amber-900'
            }`}
          >
            {showGuards ? '100% BẢO VỆ' : 'LỘ SÁNG'}
          </span>
        </button>
      </div>

      <hr className="border-slate-200/80" />

      {/* 4. Chế Độ Bắn Tia & Tham Số Quang Học */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Chế độ tia quang học
          </span>
        </div>

        {/* Ray Mode Segmented Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200/90 bg-slate-100/80 p-1">
          <button
            type="button"
            onClick={() => handleRayModeClick('targeted')}
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              rayMode === 'targeted'
                ? 'bg-cyan-600 font-semibold text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Nhắm B</span>
          </button>
          <button
            type="button"
            onClick={() => handleRayModeClick('sweep360')}
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              rayMode === 'sweep360'
                ? 'bg-blue-600 font-semibold text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SunMedium className="h-3.5 w-3.5" />
            <span>Quét 360°</span>
          </button>
          <button
            type="button"
            onClick={() => handleRayModeClick('manual')}
            className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              rayMode === 'manual'
                ? 'bg-amber-600 font-semibold text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Laser</span>
          </button>
        </div>

        {/* Sliders Container */}
        <div className="space-y-3 rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 text-xs text-slate-700">
          {/* Max Bounces Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">Số lần phản xạ thành gương:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{maxBounces}</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={maxBounces}
              onChange={e => setMaxBounces(Number(e.target.value))}
              className="h-1.5 w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>5 lần</span>
              <span>40 lần</span>
            </div>
          </div>

          {/* Density slider for 360 mode */}
          {rayMode === 'sweep360' && (
            <div className="space-y-1.5 border-t border-slate-200/80 pt-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Mật độ quét tia chùm:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {rayCount} tia
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[36, 72, 120].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setRayCount(cnt)}
                    className={`rounded-md border py-1 text-xs font-mono font-semibold transition-colors ${
                      rayCount === cnt
                        ? 'border-blue-500 bg-blue-100 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cnt} tia
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Angle slider for manual mode */}
          {rayMode === 'manual' && (
            <div className="space-y-1.5 border-t border-slate-200/80 pt-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Góc phát tia laser:</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {manualAngle}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={manualAngle}
                onChange={e => setManualAngle(Number(e.target.value))}
                className="h-1.5 w-full accent-amber-600"
              />
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>0°</span>
                <span>180°</span>
                <span>360°</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-slate-200/80" />

      {/* 5. Chú Giải Khoa Học Tinh Gọn */}
      <div className="flex flex-col gap-2 text-xs font-mono text-slate-600">
        <span className="font-bold uppercase tracking-wider text-slate-500">Ký hiệu quang học</span>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-white px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full border border-amber-600 bg-amber-400 shrink-0" />
            <span className="truncate">
              Nguồn A ({source.x.toFixed(2)}, {source.y.toFixed(2)})
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-white px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full border border-cyan-600 bg-cyan-400 shrink-0" />
            <span className="truncate">
              Đích B ({target.x.toFixed(2)}, {target.y.toFixed(2)})
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-white px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full border border-emerald-600 bg-emerald-500 shrink-0" />
            <span className="truncate">Vệ sĩ G (≤ 16)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200/70 bg-white px-2 py-1">
            <span className="h-2.5 w-2.5 rounded-full border border-red-500 bg-red-400 shrink-0" />
            <span className="truncate">Tia bị triệt tiêu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
