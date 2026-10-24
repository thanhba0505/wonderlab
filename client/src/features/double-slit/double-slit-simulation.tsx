'use client';

import * as React from 'react';
import {
  QuantumParameters,
  DEFAULT_QUANTUM_PARAMS,
  sampleHitPosition,
  sampleBatchHits,
  calculateIntensity,
} from './quantum-math';
import { SlitVisualizer } from './components/slit-visualizer';
import { ControlsPanel } from './components/controls-panel';
import { IntensityChart } from './components/intensity-chart';
import { QuantumExplainer } from './components/quantum-explainer';
import { GlobalTelemetryWidget } from '@/features/simulations/components/global-telemetry-widget';
import { IntuitionChallengeCard } from '@/features/simulations/components/intuition-challenge-card';
import { ExportSuitePanel } from '@/features/simulations/components/export-suite-panel';
import { SimulationHistoryTable } from '@/features/simulations/components/simulation-history-table';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { getSimulationBySlug } from '@/features/simulations/registry';
import { HypothesisOption } from '@/features/simulations/types';

export function DoubleSlitSimulation() {
  const meta = getSimulationBySlug('double-slit');
  const [params, setParams] = React.useState<QuantumParameters>(DEFAULT_QUANTUM_PARAMS);
  const [hits, setHits] = React.useState<number[]>([]);
  const [lastHitY, setLastHitY] = React.useState<number | null>(null);
  const [isStreaming, setIsStreaming] = React.useState<boolean>(false);

  // Intuition Challenge State
  const [, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);
  const [, setIsChallengeResolved] = React.useState<boolean>(false);

  // Background Telemetry Hook
  const { history, globalStats, recordRun } = useSimulationTelemetry('double-slit');

  // Sync parameters with URL if present
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const obsParam = urlParams.get('observer');
    if (obsParam === '1' || obsParam === 'true') {
      setParams(p => ({ ...p, isObserverActive: true }));
    }
  }, []);

  // Update URL search params
  const updateUrlParam = (isObs: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (isObs) {
        url.searchParams.set('observer', '1');
      } else {
        url.searchParams.delete('observer');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
  };

  const handleParamsChange = (updater: (prev: QuantumParameters) => QuantumParameters) => {
    setParams(prev => {
      const next = updater(prev);
      if (next.isObserverActive !== prev.isObserverActive) {
        updateUrlParam(next.isObserverActive);
      }
      return next;
    });
  };

  // Fire 1 Single Photon
  const handleFireSingle = React.useCallback(() => {
    const y = sampleHitPosition(params, 0.05);
    setHits(prev => [...prev, y]);
    setLastHitY(y);
  }, [params]);

  // Fire Fast Burst
  const handleFireBurst = React.useCallback(
    (count: number) => {
      const batch = sampleBatchHits(count, params, 0.05);
      const newHitsArray = Array.from(batch);

      setHits(prev => [...prev, ...newHitsArray]);
      setLastHitY(newHitsArray[newHitsArray.length - 1]);

      // Record telemetry run in background
      recordRun(
        {
          wavelengthNm: Math.round(params.wavelength * 1e9),
          slitDistanceUm: Math.round(params.slitDistance * 1e6),
          screenDistanceM: params.screenDistance,
          isObserverActive: params.isObserverActive,
          fringeSpacingMm: parseFloat(
            ((params.wavelength * params.screenDistance * 1000) / params.slitDistance).toFixed(2),
          ),
        },
        {
          patternType: params.isObserverActive ? 'classical_two_stripes' : 'quantum_interference',
          totalAccumulatedHits: hits.length + count,
        },
        count,
        45,
      );
    },
    [params, hits.length, recordRun],
  );

  // Streaming Interval
  React.useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Stream 15 particles every 80ms
      const batch = sampleBatchHits(15, params, 0.05);
      const newHits = Array.from(batch);
      setHits(prev => [...prev, ...newHits]);
      setLastHitY(newHits[newHits.length - 1]);
    }, 80);

    return () => clearInterval(interval);
  }, [isStreaming, params]);

  // Reset Screen
  const handleReset = React.useCallback(() => {
    setIsStreaming(false);
    setHits([]);
    setLastHitY(null);
  }, []);

  // Format export rows
  const exportRows = React.useMemo(() => {
    return hits
      .slice(-500)
      .map((y, idx) => [
        idx + 1,
        (y * 1000).toFixed(2),
        calculateIntensity(y, params).toFixed(4),
        Math.round(params.wavelength * 1e9),
        params.isObserverActive ? 'BẬT (Cổ điển)' : 'TẮT (Giao thoa)',
      ]);
  }, [hits, params]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Global Live Telemetry Widget */}
      <GlobalTelemetryWidget stats={globalStats} />

      {/* 2. Intuition Gap & Hypothesis Challenge */}
      {meta?.hypothesis && (
        <IntuitionChallengeCard
          challenge={meta.hypothesis}
          simulationSlug="double-slit"
          onPredictionSelected={(option: HypothesisOption, gap: number) => {
            setUserPrediction({ option, gap });
            setIsChallengeResolved(true);
          }}
          onStatusChange={setIsChallengeResolved}
        />
      )}

      {/* 3. Main Slit Visualizer Screen */}
      <SlitVisualizer
        params={params}
        hits={hits}
        lastHitY={lastHitY}
        isStreaming={isStreaming}
        totalHits={hits.length}
      />

      {/* 4. Interactive Controls & Parameters */}
      <ControlsPanel
        params={params}
        onParamsChange={handleParamsChange}
        onFireSingle={handleFireSingle}
        onFireBurst={handleFireBurst}
        onReset={handleReset}
        isStreaming={isStreaming}
        onToggleStream={() => setIsStreaming(s => !s)}
        totalHits={hits.length}
      />

      {/* 5. Optical Intensity Chart (Theory vs Empirical Histogram) */}
      <IntensityChart params={params} hits={hits} />

      {/* 6. Scientific Explainer */}
      <QuantumExplainer />

      {/* 7. Research Data Exporter Suite */}
      <ExportSuitePanel
        simulationTitle="Thí nghiệm Hai khe Young"
        simulationSlug="double-slit"
        parameters={{
          wavelengthNm: Math.round(params.wavelength * 1e9),
          slitDistanceUm: Math.round(params.slitDistance * 1e6),
          screenDistanceM: params.screenDistance,
          isObserverActive: params.isObserverActive,
        }}
        results={{
          totalHits: hits.length,
          state: params.isObserverActive ? 'Hạt cổ điển (Đo lường)' : 'Sóng giao thoa (Chồng chập)',
        }}
        csvHeaders={['Trial_ID', 'Hit_Position_mm', 'Intensity', 'Wavelength_nm', 'Observer_Mode']}
        historyRows={exportRows}
      />

      {/* 8. Local History Table */}
      <SimulationHistoryTable runs={history} isLoading={false} />
    </div>
  );
}
