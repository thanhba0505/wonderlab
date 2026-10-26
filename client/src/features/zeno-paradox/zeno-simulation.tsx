'use client';

import * as React from 'react';
import {
  ZenoParameters,
  DEFAULT_ZENO_PARAMS,
  generateZenoSteps,
  calculateOvertakePoint,
} from './zeno-math';
import { RaceTrack, ViewPerspective } from './components/race-track';
import { GeometricSeriesChart } from './components/geometric-series-chart';
import { ControlsPanel } from './components/controls-panel';
import { ZenoExplainer } from './components/zeno-explainer';
import {
  SimulationSection,
  SimulationWorkbenchCard,
  SimulationExplainerCard,
  SimulationHistoryTable,
  IntuitionChallengeCard,
} from '@/features/simulations/components';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { useSimulationMeta } from '@/features/simulations/hooks';
import { useTranslation } from '@/i18n';
import { HypothesisOption } from '@/features/simulations/types';
import {
  exportToCsv,
  exportToJson,
  copyToClipboard,
} from '@/features/simulations/utils/export-data';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileJson, Copy, Check, Database, Sparkles, Activity } from 'lucide-react';

export function ZenoSimulation() {
  const { locale, dict } = useTranslation();
  const meta = useSimulationMeta('zeno-paradox');
  const [params, setParams] = React.useState<ZenoParameters>(DEFAULT_ZENO_PARAMS);
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const [perspective, setPerspective] = React.useState<ViewPerspective>('zeno');
  const [copiedType, setCopiedType] = React.useState<'report' | null>(null);

  // Intuition Challenge State
  const [, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);

  // Background Telemetry Hook
  const { history, globalStats, recordRun } = useSimulationTelemetry('zeno-paradox');

  // Synchronize with URL query if present
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam === 'continuous' || viewParam === 'zeno') {
      setPerspective(viewParam);
    }
  }, []);

  const handlePerspectiveChange = (p: ViewPerspective) => {
    setPerspective(p);
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', p);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
  };

  // Precompute Zeno steps
  const steps = React.useMemo(() => {
    return generateZenoSteps(params, 15);
  }, [params]);

  const analytical = calculateOvertakePoint(params);

  // Reset to default params
  const handleReset = React.useCallback(() => {
    setParams(DEFAULT_ZENO_PARAMS);
    setCurrentStepIndex(0);
  }, []);

  // Record a run when user reaches deep steps or changes scenario
  const handleStepChange = React.useCallback(
    (index: number) => {
      setCurrentStepIndex(index);

      if (index >= 5 && index % 5 === 0) {
        recordRun(
          {
            achillesSpeed: params.achillesSpeed,
            tortoiseSpeed: params.tortoiseSpeed,
            headStart: params.headStart,
            subdivisionStep: index,
            perspective,
          },
          {
            overtakeTimeSec: parseFloat(analytical.overtakeTime.toFixed(4)),
            overtakeDistanceMeters: parseFloat(analytical.overtakeDistance.toFixed(2)),
            cumulativeConvergencePercent: parseFloat(
              (steps[index]?.fractionOfTotalTime || 0).toFixed(2),
            ),
          },
          index + 1,
          200,
        );
      }
    },
    [params, perspective, analytical, steps, recordRun],
  );

  const handleExportCsv = () => {
    const headers = [
      'Step',
      'Achilles_Start_m',
      'Achilles_End_m',
      'Tortoise_Start_m',
      'Tortoise_End_m',
      'Delta_Time_s',
      'Cumulative_Time_s',
      'Remaining_Gap_m',
      'Convergence_Percent',
    ];
    const rows = steps.map(s => [
      s.step,
      s.achillesStart.toFixed(2),
      s.achillesEnd.toFixed(2),
      s.tortoiseStart.toFixed(2),
      s.tortoiseEnd.toFixed(2),
      s.deltaTime.toFixed(4),
      s.cumulativeTime.toFixed(4),
      s.remainingGap.toFixed(4),
      s.fractionOfTotalTime.toFixed(2),
    ]);
    exportToCsv('wonderlab-zeno-paradox-steps.csv', headers, rows);
  };

  const handleExportJson = () => {
    const data = {
      simulation: 'zeno-paradox',
      exportedAt: new Date().toISOString(),
      parameters: params,
      analytical,
      steps,
      runs: history,
    };
    exportToJson('wonderlab-zeno-paradox-data.json', data);
  };

  const handleCopyReport = async () => {
    const zn = dict.sim_zeno;
    const report = [
      zn.report_title,
      zn.report_achilles_speed.replace('{val}', String(params.achillesSpeed)),
      zn.report_tortoise_speed.replace('{val}', String(params.tortoiseSpeed)),
      zn.report_head_start.replace('{val}', String(params.headStart)),
      zn.report_speed_ratio.replace('{val}', analytical.speedRatio.toFixed(3)),
      zn.report_overtake_time.replace('{val}', analytical.overtakeTime.toFixed(3)),
      zn.report_overtake_dist.replace('{val}', analytical.overtakeDistance.toFixed(2)),
      zn.report_conclusion,
    ].join('\n');
    const success = await copyToClipboard(report);
    if (success) {
      setCopiedType('report');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Line phân cách sau intro/formula */}
      <hr className="border-slate-200/80 -mt-2" />

      {/* 1. TITLE CÂU HỎI & CÂU HỎI TRỰC GIÁC */}
      <SimulationSection
        dotColor="amber"
        title={dict.sim_zeno.survey_title}
        subtitle={dict.sim_zeno.survey_desc}
      >
        {meta?.hypothesis && (
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug="zeno-paradox"
            onPredictionSelected={(option: HypothesisOption, gap: number) => {
              setUserPrediction({ option, gap });
            }}
          />
        )}
      </SimulationSection>

      {/* 2. TITLE CHỖ THÍ NGHIỆM & BLOCK THÍ NGHIỆM HỢP NHẤT */}
      <SimulationSection
        dotColor="blue"
        title={dict.sim_zeno.sim_title}
        subtitle={dict.sim_zeno.sim_desc}
      >
        <SimulationWorkbenchCard
          metricsBar={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pb-5 border-b border-slate-200/80">
              <div className="space-y-1">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {dict.sim_zeno.achilles_speed_label}
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {params.achillesSpeed}{' '}
                  <span className="text-xs font-sans text-slate-400">m/s</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {dict.sim_zeno.faster_than_tortoise.replace(
                    '{ratio}',
                    (params.achillesSpeed / Math.max(0.1, params.tortoiseSpeed)).toFixed(1),
                  )}
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {dict.sim_zeno.tortoise_speed_label}
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
                  {params.tortoiseSpeed}{' '}
                  <span className="text-xs font-sans text-slate-400">m/s</span>
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {dict.sim_zeno.headstart_desc.replace('{distance}', String(params.headStart))}
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {dict.sim_zeno.overtake_time_label}
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
                  {analytical.isOvertakePossible
                    ? `${analytical.overtakeTime.toFixed(2)} s`
                    : dict.sim_zeno.impossible}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {dict.sim_zeno.overtake_position_desc.replace(
                    '{distance}',
                    analytical.overtakeDistance.toFixed(1),
                  )}
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {dict.sim_zeno.current_step_label}
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {`${dict.sim_zeno.step_number} #${currentStepIndex + 1}`}
                </div>
                <div className="text-xs text-violet-700 font-mono">
                  {dict.sim_zeno.traversed_journey.replace(
                    '{percent}',
                    ((steps[currentStepIndex]?.fractionOfTotalTime || 0) * 100).toFixed(1),
                  )}
                </div>
              </div>
            </div>
          }
          tools={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={dict.simulations.export.csv}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                {dict.simulations.export.csv}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={dict.simulations.export.json}
              >
                <FileJson className="h-3.5 w-3.5 text-blue-600" />
                {dict.simulations.export.json}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={dict.simulations.export.copy_report}
              >
                {copiedType === 'report' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      {dict.simulations.export.copied}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    {dict.simulations.export.copy_report}
                  </>
                )}
              </Button>
            </>
          }
          telemetry={
            globalStats && globalStats.totalTrials > 0 ? (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700">Telemetry:</span>
                <div className="flex items-center gap-1 text-slate-700">
                  <Database className="h-3.5 w-3.5 text-blue-600" />
                  <span className="font-bold text-blue-700 tabular-nums">
                    {globalStats.totalTrials.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </span>
                  <span className="text-slate-400">{dict.simulations.telemetry.trials}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-600">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-bold text-slate-800 tabular-nums">
                    {globalStats.totalRuns.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </span>
                  <span className="text-slate-400">{dict.simulations.telemetry.runs}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                <span>{dict.simulations.telemetry.ready}</span>
              </div>
            )
          }
        >
          <div className="space-y-6">
            <RaceTrack
              params={params}
              steps={steps}
              currentStepIndex={currentStepIndex}
              onStepChange={handleStepChange}
              perspective={perspective}
              onPerspectiveChange={handlePerspectiveChange}
            />

            <GeometricSeriesChart
              params={params}
              steps={steps}
              currentStepIndex={currentStepIndex}
              onStepSelect={handleStepChange}
            />

            <ControlsPanel
              params={params}
              onParamsChange={updater => {
                setParams(updater);
                setCurrentStepIndex(0);
              }}
              onReset={handleReset}
            />
          </div>
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. TITLE NHẬT KÝ & NHẬT KÝ THỰC NGHIỆM */}
      <SimulationSection
        dotColor="emerald"
        title={dict.simulations.history.title}
        subtitle={dict.simulations.history.subtitle}
      >
        <SimulationHistoryTable runs={history} isLoading={false} />
      </SimulationSection>

      {/* 4. TITLE GIẢI THÍCH & GIẢI THÍCH KHOA HỌC */}
      <SimulationSection
        dotColor="blue"
        title={dict.simulations.explainer.title}
        subtitle={dict.simulations.explainer.subtitle}
      >
        <SimulationExplainerCard>
          <ZenoExplainer />
        </SimulationExplainerCard>
      </SimulationSection>
    </div>
  );
}
