'use client';

import * as React from 'react';
import { Play, Pause, RotateCcw, ZoomIn, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZenoParameters,
  ZenoStep,
  calculateOvertakePoint,
  calculateContinuousPosition,
} from '../zeno-math';

export type ViewPerspective = 'zeno' | 'continuous';

interface RaceTrackProps {
  params: ZenoParameters;
  steps: ZenoStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  perspective: ViewPerspective;
  onPerspectiveChange: (p: ViewPerspective) => void;
}

export function RaceTrack({
  params,
  steps,
  currentStepIndex,
  onStepChange,
  perspective,
  onPerspectiveChange,
}: RaceTrackProps) {
  const analytical = calculateOvertakePoint(params);

  // Real-time animation states for continuous mode
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = React.useState<number>(1);

  const maxTime = analytical.isOvertakePossible ? analytical.overtakeTime * 1.35 : 20;

  // Real-time continuous animation loop
  React.useEffect(() => {
    if (!isPlaying || perspective !== 'continuous') return;

    let lastTimestamp = performance.now();
    let animationFrameId: number;

    const tick = (now: number) => {
      const deltaSec = ((now - lastTimestamp) / 1000) * playbackSpeed;
      lastTimestamp = now;

      setCurrentTime(prevTime => {
        const nextTime = prevTime + deltaSec;
        if (nextTime >= maxTime) {
          setIsPlaying(false);
          return maxTime;
        }
        return nextTime;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, perspective, playbackSpeed, maxTime]);

  const currentContinuous = calculateContinuousPosition(currentTime, params);
  const currentStep = steps[currentStepIndex] || steps[0];

  // Reset continuous runner
  const handleResetContinuous = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Track coordinate mapper for continuous perspective (0m to maxDistance)
  const maxDistance = analytical.isOvertakePossible ? analytical.overtakeDistance * 1.3 : 150;
  const getContinuousXPercent = (posMeters: number) => {
    return Math.min(96, Math.max(4, (posMeters / maxDistance) * 100));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Header & Perspective Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Đường Chạy Tương Tác: Achilles vs Rùa
            </h3>
            <p className="text-xs text-slate-500">
              Đối chiếu trực quan giữa góc nhìn phân chia vô hạn của Zeno và vật lý chuyển động thực
              tế
            </p>
          </div>
        </div>

        {/* Perspective Mode Switcher */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-300/85 bg-slate-100/80 p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onPerspectiveChange('zeno');
              setIsPlaying(false);
            }}
            className={`h-7 px-3 text-xs font-medium transition-all ${
              perspective === 'zeno'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ZoomIn className="h-3.5 w-3.5 mr-1 text-violet-600" />
            1. Góc nhìn Zeno (Thu phóng vô hạn)
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPerspectiveChange('continuous')}
            className={`h-7 px-3 text-xs font-medium transition-all ${
              perspective === 'continuous'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-blue-600" />
            2. Vật lý Thực tế (Thời gian liên tục)
          </Button>
        </div>
      </div>

      {/* 2. PERSPECTIVE A: ZENO STEP-BY-STEP (EXPONENTIAL ZOOM) */}
      {perspective === 'zeno' && currentStep && (
        <div className="space-y-4">
          {/* Step Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-violet-50/70 border border-violet-200/80 p-3 text-xs">
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-700 text-white font-mono text-xs">
                CHẶNG PHÂN CHIA #{currentStep.step}
              </Badge>
              <span className="font-semibold text-violet-950 font-sans">
                Achilles đuổi tới vị trí cũ của Rùa ({currentStep.achillesEnd.toFixed(2)}m)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-violet-800 text-xs">
              <span>
                Khoảng cách còn lại: <strong>{currentStep.remainingGap.toFixed(4)}m</strong>
              </span>
              <span>
                Thời gian chặng: <strong>+{currentStep.deltaTime.toFixed(4)}s</strong>
              </span>
            </div>
          </div>

          {/* Visual Track Bench */}
          <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-6 text-white overflow-hidden shadow-inner">
            {/* Background grid lines */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex flex-col gap-6">
              {/* Distance Ruler Visual */}
              <div className="relative h-14 w-full border-b border-slate-700 pb-2">
                {/* Segment Start Label */}
                <div className="absolute left-2 -bottom-2 text-xs font-mono text-slate-400">
                  {currentStep.achillesStart.toFixed(2)}m
                </div>

                {/* Midpoint / Achilles Reach point */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 text-xs font-mono text-amber-400">
                  {currentStep.achillesEnd.toFixed(2)}m
                </div>

                {/* Tortoise Advanced Point */}
                <div className="absolute right-4 -bottom-2 text-xs font-mono text-emerald-400">
                  {currentStep.tortoiseEnd.toFixed(2)}m
                </div>

                {/* Achilles Avatar Runner */}
                <div
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ease-out"
                  style={{ left: '50%' }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 text-xs">
                    🏃
                  </div>
                  <span className="mt-1 font-mono text-xs font-bold text-amber-300">Achilles</span>
                </div>

                {/* Tortoise Avatar Runner */}
                <div
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ease-out"
                  style={{ left: '92%' }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/30 text-xs">
                    🐢
                  </div>
                  <span className="mt-1 font-mono text-xs font-bold text-emerald-300">Rùa</span>
                </div>

                {/* Arrow from Achilles old pos to new pos */}
                <div className="absolute top-4 left-6 right-1/2 border-b-2 border-dashed border-amber-500/60" />
                {/* Arrow of Tortoise creeping forward */}
                <div className="absolute top-4 left-1/2 right-12 border-b-2 border-dashed border-emerald-500/60" />
              </div>

              {/* Step Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
                <div className="bg-slate-800/80 p-2 rounded-lg">
                  <span className="text-xs text-slate-400 block">Achilles chạy được</span>
                  <span className="text-xs font-bold text-amber-400 tabular-nums">
                    {(currentStep.achillesEnd - currentStep.achillesStart).toFixed(4)}m
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg">
                  <span className="text-xs text-slate-400 block">Rùa nhích thêm</span>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums">
                    {(currentStep.tortoiseEnd - currentStep.tortoiseStart).toFixed(4)}m
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg">
                  <span className="text-xs text-slate-400 block">Thời gian tích lũy</span>
                  <span className="text-xs font-bold text-blue-400 tabular-nums">
                    {currentStep.cumulativeTime.toFixed(4)}s
                  </span>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg">
                  <span className="text-xs text-slate-400 block">Tiến độ tới điểm bắt kịp</span>
                  <span className="text-xs font-bold text-violet-400 tabular-nums">
                    {currentStep.fractionOfTotalTime.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentStepIndex <= 0}
                onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
                className="text-xs border-slate-300"
              >
                ← Chặng trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentStepIndex >= steps.length - 1}
                onClick={() => onStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
                className="text-xs border-slate-300 bg-violet-50 text-violet-700 font-semibold hover:bg-violet-100"
              >
                Chặng tiếp theo (Thu phóng) →
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStepChange(0)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Về ban đầu
              </Button>
            </div>

            {/* Quick step index badges */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
              {steps.slice(0, 10).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onStepChange(idx)}
                  className={`h-6 w-6 rounded text-xs font-bold border transition-colors ${
                    currentStepIndex === idx
                      ? 'bg-violet-600 text-white border-violet-700'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. PERSPECTIVE B: CONTINUOUS REAL-TIME PHYSICS VIEW */}
      {perspective === 'continuous' && (
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50/70 border border-blue-200/80 p-3 text-xs">
            <div className="flex items-center gap-2">
              <Badge
                className={
                  currentContinuous.isOvertaken
                    ? 'bg-emerald-600 text-white font-mono text-xs'
                    : 'bg-blue-600 text-white font-mono text-xs'
                }
              >
                {currentContinuous.isOvertaken ? 'ĐÃ VƯỢT QUA' : 'ĐANG ĐUỔI THEO'}
              </Badge>
              <span className="font-semibold text-blue-950 font-sans">
                Thời gian thực nghiệm:{' '}
                <strong className="font-mono">{currentTime.toFixed(2)}s</strong> /{' '}
                {analytical.overtakeTime.toFixed(2)}s
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-blue-800">
              {currentContinuous.isOvertaken ? (
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Achilles đã vượt trước Rùa{' '}
                  {(currentContinuous.achillesPos - currentContinuous.tortoisePos).toFixed(2)}m!
                </span>
              ) : (
                <span>
                  Khoảng cách còn: <strong>{currentContinuous.gap.toFixed(2)}m</strong>
                </span>
              )}
            </div>
          </div>

          {/* Full Linear Race Track */}
          <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-6 text-white overflow-hidden shadow-inner min-h-[160px]">
            {/* Start line */}
            <div className="absolute top-4 bottom-4 left-6 border-l-2 border-slate-600">
              <span className="absolute -top-3 left-1 text-xs font-mono text-slate-400">
                Vạch xuất phát (0m)
              </span>
            </div>

            {/* Overtake point flag */}
            {analytical.isOvertakePossible && (
              <div
                className="absolute top-4 bottom-4 border-l-2 border-dashed border-rose-500/80"
                style={{ left: `${getContinuousXPercent(analytical.overtakeDistance)}%` }}
              >
                <span className="absolute -top-3 left-1 text-xs font-mono text-rose-400 font-bold">
                  Bắt kịp ({analytical.overtakeDistance.toFixed(1)}m)
                </span>
              </div>
            )}

            {/* Track Line 1: Achilles Lane */}
            <div className="relative mt-4 h-10 border-b border-slate-800">
              <div
                className="absolute -top-2 flex flex-col items-center transition-all duration-75"
                style={{ left: `${getContinuousXPercent(currentContinuous.achillesPos)}%` }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/40 text-xs">
                  🏃
                </div>
                <span className="font-mono text-xs text-amber-300 mt-0.5">
                  {currentContinuous.achillesPos.toFixed(1)}m
                </span>
              </div>
            </div>

            {/* Track Line 2: Tortoise Lane */}
            <div className="relative mt-3 h-10">
              <div
                className="absolute -top-2 flex flex-col items-center transition-all duration-75"
                style={{ left: `${getContinuousXPercent(currentContinuous.tortoisePos)}%` }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/40 text-xs">
                  🐢
                </div>
                <span className="font-mono text-xs text-emerald-300 mt-0.5">
                  {currentContinuous.tortoisePos.toFixed(1)}m
                </span>
              </div>
            </div>
          </div>

          {/* Continuous Controls: Play, Pause, Speed, Scrubber */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsPlaying(p => !p)}
                className="h-8 gap-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? 'Tạm dừng' : 'Chạy thử nghiệm'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetContinuous}
                className="h-8 text-xs border-slate-300"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Làm lại
              </Button>
            </div>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
              <span>Tốc độ:</span>
              {[0.5, 1, 2, 4].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded border text-xs ${
                    playbackSpeed === spd
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Time Scrubber Slider */}
          <div className="flex items-center gap-3 pt-1">
            <span className="font-mono text-xs text-slate-400">0s</span>
            <input
              type="range"
              min={0}
              max={maxTime}
              step={0.05}
              value={currentTime}
              onChange={e => {
                setIsPlaying(false);
                setCurrentTime(parseFloat(e.target.value));
              }}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="font-mono text-xs text-slate-400">{maxTime.toFixed(1)}s</span>
          </div>
        </div>
      )}
    </div>
  );
}
