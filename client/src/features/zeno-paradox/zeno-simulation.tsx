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
import { GlobalTelemetryWidget } from '@/features/simulations/components/global-telemetry-widget';
import { IntuitionChallengeCard } from '@/features/simulations/components/intuition-challenge-card';
import { ExportSuitePanel } from '@/features/simulations/components/export-suite-panel';
import { SimulationHistoryTable } from '@/features/simulations/components/simulation-history-table';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { getSimulationBySlug } from '@/features/simulations/registry';
import { HypothesisOption } from '@/features/simulations/types';

export function ZenoSimulation() {
  const meta = getSimulationBySlug('zeno-paradox');
  const [params, setParams] = React.useState<ZenoParameters>(DEFAULT_ZENO_PARAMS);
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(0);
  const [perspective, setPerspective] = React.useState<ViewPerspective>('zeno');

  // Intuition Challenge State
  const [, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);
  const [, setIsChallengeResolved] = React.useState<boolean>(false);

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

  // Export rows for CSV
  const exportRows = React.useMemo(() => {
    return steps.map(s => [
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
  }, [steps]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Global Live Telemetry Widget */}
      <GlobalTelemetryWidget stats={globalStats} />

      {/* 2. Intuition Gap & Hypothesis Challenge */}
      {meta?.hypothesis && (
        <IntuitionChallengeCard
          challenge={meta.hypothesis}
          simulationSlug="zeno-paradox"
          onPredictionSelected={(option: HypothesisOption, gap: number) => {
            setUserPrediction({ option, gap });
            setIsChallengeResolved(true);
          }}
          onStatusChange={setIsChallengeResolved}
        />
      )}

      {/* 3. Main Interactive Race Track (Zeno Zoom vs Real-Time Physics) */}
      <RaceTrack
        params={params}
        steps={steps}
        currentStepIndex={currentStepIndex}
        onStepChange={handleStepChange}
        perspective={perspective}
        onPerspectiveChange={handlePerspectiveChange}
      />

      {/* 4. Asymptotic Geometric Series Convergence Chart */}
      <GeometricSeriesChart
        params={params}
        steps={steps}
        currentStepIndex={currentStepIndex}
        onStepSelect={handleStepChange}
      />

      {/* 5. Parameters Control Panel */}
      <ControlsPanel
        params={params}
        onParamsChange={updater => {
          setParams(updater);
          setCurrentStepIndex(0);
        }}
        onReset={handleReset}
      />

      {/* 6. Scientific & Historical Explainer */}
      <ZenoExplainer />

      {/* 7. Research Data Exporter Suite */}
      <ExportSuitePanel
        simulationTitle="Nghịch lý Zeno: Achilles và Rùa"
        simulationSlug="zeno-paradox"
        parameters={{
          achillesSpeed: `${params.achillesSpeed} m/s`,
          tortoiseSpeed: `${params.tortoiseSpeed} m/s`,
          headStart: `${params.headStart} m`,
          speedRatio: analytical.speedRatio.toFixed(3),
        }}
        results={{
          overtakeTime: analytical.isOvertakePossible
            ? `${analytical.overtakeTime.toFixed(3)}s`
            : 'Bất khả thi',
          overtakeDistance: analytical.isOvertakePossible
            ? `${analytical.overtakeDistance.toFixed(2)}m`
            : 'Bất khả thi',
          convergenceFormula: 'T* = d0 / (vA - vT)',
        }}
        csvHeaders={[
          'Step',
          'Achilles_Start_m',
          'Achilles_End_m',
          'Tortoise_Start_m',
          'Tortoise_End_m',
          'Delta_Time_s',
          'Cumulative_Time_s',
          'Remaining_Gap_m',
          'Convergence_Percent',
        ]}
        historyRows={exportRows}
      />

      {/* 8. Local History Table */}
      <SimulationHistoryTable runs={history} isLoading={false} />
    </div>
  );
}
