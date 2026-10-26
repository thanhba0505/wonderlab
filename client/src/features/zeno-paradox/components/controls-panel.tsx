'use client';

import * as React from 'react';
import { Sliders, RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n';
import { ZenoParameters, calculateOvertakePoint, findPlanckStep } from '../zeno-math';

interface ControlsPanelProps {
  params: ZenoParameters;
  onParamsChange: (updater: (prev: ZenoParameters) => ZenoParameters) => void;
  onReset: () => void;
}

export function ControlsPanel({ params, onParamsChange, onReset }: ControlsPanelProps) {
  const { dict } = useTranslation();
  const analytical = calculateOvertakePoint(params);
  const planckStep = findPlanckStep(params);

  // Apply a preset
  const applyPreset = (preset: Partial<ZenoParameters>) => {
    onParamsChange(prev => ({
      ...prev,
      ...preset,
    }));
  };

  return (
    <div className="flex flex-col gap-4 pt-6 border-t border-slate-200/80">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-violet-600" />
          <h4 className="font-heading text-sm font-bold text-slate-900">
            {dict.sim_zeno.controls_title}
          </h4>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 text-xs text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          {dict.sim_zeno.reset_btn}
        </Button>
      </div>

      {/* 2. Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Achilles Speed */}
        <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              {dict.sim_zeno.achilles_speed_label}:
            </span>
            <span className="font-mono font-bold text-amber-600 tabular-nums">
              {params.achillesSpeed} m/s
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={30}
            step={1}
            value={params.achillesSpeed}
            onChange={e =>
              onParamsChange(p => ({ ...p, achillesSpeed: parseFloat(e.target.value) }))
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>4 m/s</span>
            <span>30 m/s</span>
          </div>
        </div>

        {/* Tortoise Speed */}
        <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              {dict.sim_zeno.tortoise_speed_label}:
            </span>
            <span className="font-mono font-bold text-emerald-600 tabular-nums">
              {params.tortoiseSpeed} m/s
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={15}
            step={0.5}
            value={params.tortoiseSpeed}
            onChange={e =>
              onParamsChange(p => ({ ...p, tortoiseSpeed: parseFloat(e.target.value) }))
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>0.5 m/s</span>
            <span>15 m/s</span>
          </div>
        </div>

        {/* Head Start */}
        <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">{dict.sim_zeno.headstart_label}:</span>
            <span className="font-mono font-bold text-blue-600 tabular-nums">
              {params.headStart} m
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            step={10}
            value={params.headStart}
            onChange={e => onParamsChange(p => ({ ...p, headStart: parseFloat(e.target.value) }))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>10 m</span>
            <span>200 m</span>
          </div>
        </div>
      </div>

      {/* 3. Analytical Outcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          {analytical.isOvertakePossible ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">{dict.sim_zeno.overtake_time_colon}</span>
                <span className="font-bold text-slate-900">
                  {analytical.overtakeTime.toFixed(3)}s
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">{dict.sim_zeno.overtake_position_label}</span>
                <span className="font-bold text-slate-900">
                  {analytical.overtakeDistance.toFixed(2)}m
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">{dict.sim_zeno.common_ratio_label}:</span>
                <span className="font-bold text-violet-700">
                  {analytical.speedRatio.toFixed(3)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 text-rose-600 font-bold">
              <AlertTriangle className="h-4 w-4" />
              {dict.sim_zeno.never_overtakes}
            </div>
          )}
        </div>

        {analytical.isOvertakePossible && Number.isFinite(planckStep) && (
          <Badge variant="outline" className="text-xs font-mono text-violet-700 border-violet-200">
            <Sparkles className="mr-1 h-3 w-3" />
            {dict.sim_zeno.planck_limit_label.replace('{step}', String(planckStep))}
          </Badge>
        )}
      </div>

      {/* 4. Scenario Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="font-semibold text-slate-500">{dict.sim_zeno.preset_scenarios}</span>
        <button
          type="button"
          onClick={() =>
            applyPreset({
              achillesSpeed: 10,
              tortoiseSpeed: 1,
              headStart: 100,
            })
          }
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          {dict.sim_zeno.preset_greek}
        </button>

        <button
          type="button"
          onClick={() =>
            applyPreset({
              achillesSpeed: 12,
              tortoiseSpeed: 10,
              headStart: 20,
            })
          }
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          {dict.sim_zeno.preset_chase}
        </button>

        <button
          type="button"
          onClick={() =>
            applyPreset({
              achillesSpeed: 15,
              tortoiseSpeed: 2,
              headStart: 150,
            })
          }
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          {dict.sim_zeno.preset_long}
        </button>
      </div>
    </div>
  );
}
