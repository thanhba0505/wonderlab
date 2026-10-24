'use client';

import * as React from 'react';
import { Users, Play, Pause, RotateCcw, StepForward, Sliders, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Population,
  StrategyId,
  DEFAULT_POPULATION,
  STRATEGIES_LIST,
  getStrategyInfo,
  runEvolutionGeneration,
} from '../game-theory-math';

interface AxelrodTournamentProps {
  onTournamentRecorded?: (generation: number, dominantStrategy: StrategyId) => void;
}

export function AxelrodTournament({ onTournamentRecorded }: AxelrodTournamentProps) {
  const [population, setPopulation] = React.useState<Population>(DEFAULT_POPULATION);
  const [generation, setGeneration] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [noiseRate, setNoiseRate] = React.useState<number>(0);

  // Run 1 evolution step
  const stepEvolution = React.useCallback(() => {
    setPopulation(current => {
      const { nextPop } = runEvolutionGeneration(current, 10, noiseRate);
      const nextGen = generation + 1;
      setGeneration(nextGen);

      // Find dominant strategy
      let maxStrat: StrategyId = 'tit_for_tat';
      let maxCount = -1;
      for (const [k, v] of Object.entries(nextPop)) {
        if (v > maxCount) {
          maxCount = v;
          maxStrat = k as StrategyId;
        }
      }

      if (nextGen % 5 === 0) {
        onTournamentRecorded?.(nextGen, maxStrat);
      }

      return nextPop;
    });
  }, [generation, noiseRate, onTournamentRecorded]);

  // Auto evolution interval
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      stepEvolution();
    }, 600);
    return () => clearInterval(interval);
  }, [isPlaying, stepEvolution]);

  // Reset to initial preset
  const resetToPreset = (preset: Population) => {
    setIsPlaying(false);
    setPopulation(preset);
    setGeneration(0);
  };

  // Identify dominant strategy
  const dominantStrategy = React.useMemo(() => {
    let max = -1;
    let dominant: StrategyId = 'tit_for_tat';
    for (const [s, count] of Object.entries(population)) {
      if (count > max) {
        max = count;
        dominant = s as StrategyId;
      }
    }
    return getStrategyInfo(dominant);
  }, [population]);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-300/85 bg-white p-5 shadow-xs">
      {/* 1. Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Giải đấu Tiến hóa Quần thể Axelrod (Replicator Dynamics)
            </h3>
            <p className="text-xs text-slate-500">
              Quần thể 100 cá thể đấu vòng tròn. Chiến lược điểm cao sinh sản, điểm thấp bị tuyệt
              chủng.
            </p>
          </div>
        </div>

        {/* Play / Step Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`text-xs font-semibold shadow-2xs ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-1.5" /> Tạm dừng
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1.5" /> Tự động tiến hóa
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={stepEvolution}
            disabled={isPlaying}
            className="text-xs font-semibold border-slate-300 text-slate-700 shadow-2xs"
          >
            <StepForward className="h-3.5 w-3.5 mr-1 text-blue-600" />
            +1 Thế hệ
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetToPreset(DEFAULT_POPULATION)}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Population Distribution Stacked Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-700">PHÂN BỔ QUẦN THỂ — THẾ HỆ #{generation}:</span>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-slate-500">Áp đảo:</span>
            <span className="font-bold text-slate-900">{dominantStrategy.name}</span>
          </div>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="flex h-5 w-full overflow-hidden rounded-lg bg-slate-100 p-0.5 border border-slate-200">
          {STRATEGIES_LIST.map(strat => {
            const count = population[strat.id] || 0;
            if (count === 0) return null;
            return (
              <div
                key={strat.id}
                style={{ width: `${count}%`, backgroundColor: strat.color }}
                className="h-full transition-all duration-300 first:rounded-l last:rounded-r relative group"
                title={`${strat.name}: ${count}%`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Strategy Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {STRATEGIES_LIST.filter(s => DEFAULT_POPULATION[s.id] !== undefined).map(strat => {
          const count = population[strat.id] || 0;
          const isExtinct = count === 0;

          return (
            <div
              key={strat.id}
              className={`rounded-xl border p-3 transition-all ${
                isExtinct
                  ? 'border-slate-200 bg-slate-50/50 opacity-50'
                  : 'border-slate-200/90 bg-white shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: strat.color }}
                />
                <span className="font-mono text-xs font-bold text-slate-500">{count} cá thể</span>
              </div>

              <h4 className="font-heading text-xs font-bold text-slate-900 truncate">
                {strat.shortName}
              </h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">{strat.tagline}</p>

              <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100 text-xs font-mono">
                <span className="text-slate-400">Thị phần:</span>
                <span className="font-bold text-slate-800">{count}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Presets and Scenarios */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Kịch bản thử nghiệm:</span>
          <button
            onClick={() => resetToPreset(DEFAULT_POPULATION)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700"
          >
            Cân bằng Đa dạng
          </button>
          <button
            onClick={() =>
              resetToPreset({
                tit_for_tat: 5,
                always_defect: 70,
                always_cooperate: 25,
                grudger: 0,
                pavlov: 0,
                tit_for_two_tats: 0,
                random: 0,
              })
            }
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700"
          >
            Thế giới Tàn khốc (Đa số Phản bội)
          </button>
        </div>

        {/* Noise Setting */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
          <Sliders className="h-3.5 w-3.5 text-slate-400" />
          <span>Nhiễu / Hiểu lầm:</span>
          <select
            value={noiseRate}
            onChange={e => setNoiseRate(parseFloat(e.target.value))}
            className="rounded border border-slate-200 bg-white px-2 py-0.5 font-bold text-blue-700"
          >
            <option value={0}>0% (Hoàn hảo)</option>
            <option value={0.02}>2% (Thực tế nhẹ)</option>
            <option value={0.05}>5% (Nhiều hiểu lầm)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
