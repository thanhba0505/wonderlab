'use client';

import * as React from 'react';
import { MonteCarloSummary, runMonteCarloSimulations } from '../hat-puzzle-math';
import { Button } from '@/components/ui/button';
import { Activity, PlayCircle, ShieldCheck, Flame, Cpu } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface MonteCarloPanelProps {
  n: number;
  colorCount: 2 | 3;
  onRunFinished?: (summary: MonteCarloSummary) => void;
}

export function MonteCarloPanel({ n, colorCount, onRunFinished }: MonteCarloPanelProps) {
  const { dict } = useTranslation();
  const t = dict.sim_prisoners_hats;
  const [isRunning, setIsRunning] = React.useState<boolean>(false);
  // Initial state is null to ensure SSR and client hydration output 100% identical markup
  const [summary, setSummary] = React.useState<MonteCarloSummary | null>(null);

  // Run initial Monte Carlo on client mount
  React.useEffect(() => {
    const result = runMonteCarloSimulations(n, colorCount, 1000);
    setSummary(result);
  }, [n, colorCount]);

  const handleRun = (trials: number) => {
    setIsRunning(true);
    // Use requestAnimationFrame / timeout to avoid blocking main thread
    setTimeout(() => {
      const result = runMonteCarloSimulations(n, colorCount, trials);
      setSummary(result);
      setIsRunning(false);
      if (onRunFinished) {
        onRunFinished(result);
      }
    }, 50);
  };

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06),0_1px_3px_0_rgba(15,23,42,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900">{t.mc_title}</h3>
            <p className="text-xs text-slate-500 font-sans">{t.mc_desc}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={isRunning}
            onClick={() => handleRun(100)}
            className="text-xs h-7 border-slate-300 text-slate-700"
          >
            {t.rounds_100}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isRunning}
            onClick={() => handleRun(1000)}
            className="text-xs h-7 border-slate-300 text-slate-700"
          >
            {t.rounds_1000}
          </Button>
          <Button
            size="sm"
            disabled={isRunning}
            onClick={() => handleRun(5000)}
            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
          >
            <PlayCircle className="h-3 w-3" />
            {t.rounds_5000}
          </Button>
        </div>
      </div>

      {summary ? (
        <div className="space-y-4">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1: Overall Survival */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-blue-600" />
                {t.overall_survival}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                  {(summary.overallAccuracy * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({t.theory_label}
                  {(summary.expectedTheoreticalAccuracy * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${summary.overallAccuracy * 100}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Guaranteed Group (N-1) */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-1">
              <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                {t.guaranteed_group_label.replace('{count}', String(n - 1))}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-700">
                  {(summary.guaranteedGroupAccuracy * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-emerald-600 font-mono">{t.guaranteed_100}</span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${summary.guaranteedGroupAccuracy * 100}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Sacrifice Person */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-1">
              <span className="text-xs text-amber-800 font-medium flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-600" />
                {t.sacrifice_person_label.replace('{n}', String(n))}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl sm:text-2xl font-bold text-amber-800">
                  {(summary.sacrificeAccuracy * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-amber-700 font-mono">
                  ({t.luck_label}1/{colorCount} = {((1 / colorCount) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${summary.sacrificeAccuracy * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Statistical Breakdown Note */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1 font-sans leading-relaxed">
            <p>
              <strong>{t.sample_summary_title}</strong>{' '}
              {t.sample_summary_rounds
                .replace('{trials}', summary.trials.toLocaleString())
                .replace('{guesses}', summary.totalPrisoners.toLocaleString())}
            </p>
            <p className="text-slate-500">
              {t.sample_summary_consistent
                .replace('{count}', String(n - 1))
                .replace('{mod}', String(colorCount))}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-6 text-center text-xs text-slate-500 font-sans">
          {t.initializing_mc}
        </div>
      )}
    </div>
  );
}
