'use client';

import * as React from 'react';
import { History, RotateCcw, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimulationRunItem } from '@/lib/telemetry';
import { useTranslation } from '@/i18n';

interface SimulationHistoryTableProps {
  runs: SimulationRunItem[];
  isLoading?: boolean;
  onReloadParams?: (params: Record<string, unknown>) => void;
}

export function SimulationHistoryTable({
  runs,
  isLoading = false,
  onReloadParams,
}: SimulationHistoryTableProps) {
  const { locale, dict } = useTranslation();
  const hist = dict.simulations.history;

  if (runs.length === 0 && !isLoading) {
    return (
      <div className="rounded-xl border border-slate-300/85 bg-white p-6 text-center shadow-xs">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <History className="h-5 w-5" />
        </div>
        <h4 className="mt-3 font-heading text-sm font-bold text-slate-900">{hist.title}</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">{hist.empty_state}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-300/85 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-blue-700" />
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
            {hist.title}
          </h3>
          <Badge variant="outline" className="font-mono text-xs text-slate-600 bg-white">
            {runs.length} {hist.records}
          </Badge>
        </div>
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {hist.auto_synced}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/50 text-xs font-mono uppercase tracking-wider text-slate-600">
              <th className="px-4 py-2.5">{hist.timestamp}</th>
              <th className="px-4 py-2.5">{hist.parameters}</th>
              <th className="px-4 py-2.5 text-right">{hist.trials}</th>
              <th className="px-4 py-2.5 text-right">{hist.empirical_rate}</th>
              <th className="px-4 py-2.5 text-right">{hist.theory_error}</th>
              {onReloadParams && <th className="px-4 py-2.5 text-center">{hist.action}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs">
            {runs.map(run => {
              const date = new Date(run.createdAt);
              const timeString = isNaN(date.getTime())
                ? dict.simulations.comments.time_just_now
                : date.toLocaleTimeString(locale === 'en' ? 'en-US' : 'vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

              // Format parameters
              const params = run.parameters as Record<string, unknown>;
              const groupSize = params?.groupSize ?? params?.n;
              const doors = params?.doorsCount;

              // Format results
              const results = run.results as Record<string, unknown>;
              const empRate =
                typeof results?.empiricalProbability === 'number'
                  ? results.empiricalProbability
                  : typeof results?.winRate === 'number'
                    ? results.winRate
                    : null;

              const theoRate =
                typeof results?.theoreticalProbability === 'number'
                  ? results.theoreticalProbability
                  : null;

              const delta =
                empRate !== null && theoRate !== null ? Math.abs(empRate - theoRate) : null;

              return (
                <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{timeString}</td>

                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {groupSize !== undefined && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                        <span className="text-slate-400 font-normal">n =</span> {String(groupSize)}
                      </span>
                    )}
                    {doors !== undefined && (
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                        <span className="text-slate-400 font-normal">{hist.doors}</span>{' '}
                        {String(doors)}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-900 font-bold whitespace-nowrap">
                    {run.trialsCount.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {empRate !== null ? (
                      <span className="font-bold text-blue-700">{(empRate * 100).toFixed(2)}%</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                    {theoRate !== null && delta !== null ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-slate-600">{(theoRate * 100).toFixed(2)}%</span>
                        <span
                          className={`text-xs font-semibold ${
                            delta < 0.01
                              ? 'text-emerald-700'
                              : delta < 0.03
                                ? 'text-blue-600'
                                : 'text-amber-700'
                          }`}
                        >
                          (Δ {(delta * 100).toFixed(2)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {onReloadParams && (
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReloadParams(params)}
                        className="h-6 px-2 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 font-sans gap-1"
                        title={hist.reload_tooltip}
                      >
                        <RotateCcw className="h-3 w-3" />
                        {hist.reload}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/40 px-4 py-2 text-xs text-slate-500 font-sans">
        <span>{hist.showing_max}</span>
        <span className="font-mono text-slate-400 flex items-center gap-1">
          {hist.persistent_storage}
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}
