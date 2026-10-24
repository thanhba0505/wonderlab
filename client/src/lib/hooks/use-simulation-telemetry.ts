'use client';

import * as React from 'react';
import {
  fetchSimulationHistory,
  fetchSimulationStats,
  getClientSessionId,
  recordSimulationRun,
  SimulationGlobalStats,
  SimulationRunItem,
} from '../telemetry';

export function useSimulationTelemetry(simulationSlug: string) {
  const [history, setHistory] = React.useState<SimulationRunItem[]>([]);
  const [globalStats, setGlobalStats] = React.useState<SimulationGlobalStats | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const refreshHistory = React.useCallback(async () => {
    const runs = await fetchSimulationHistory(simulationSlug, 25);
    if (runs && runs.length > 0) {
      setHistory(runs);
    }
  }, [simulationSlug]);

  const refreshStats = React.useCallback(async () => {
    const stats = await fetchSimulationStats(simulationSlug);
    if (stats) {
      setGlobalStats(stats);
    }
  }, [simulationSlug]);

  React.useEffect(() => {
    refreshHistory();
    refreshStats();
  }, [refreshHistory, refreshStats]);

  const recordRun = React.useCallback(
    async (
      parameters: Record<string, unknown>,
      results: Record<string, unknown>,
      trialsCount: number,
      durationMs?: number,
    ) => {
      // Optimistic local entry
      const optimisticItem: SimulationRunItem = {
        id: `local_${Date.now()}`,
        simulationSlug,
        parameters,
        results,
        trialsCount,
        durationMs: durationMs ?? null,
        clientSession: getClientSessionId(),
        createdAt: new Date().toISOString(),
      };

      setHistory(prev => [optimisticItem, ...prev.slice(0, 24)]);
      setIsSyncing(true);

      try {
        const response = await recordSimulationRun({
          simulationSlug,
          parameters,
          results,
          trialsCount,
          durationMs,
        });

        if (response?.runId) {
          setHistory(prev =>
            prev.map(item =>
              item.id === optimisticItem.id ? { ...item, id: response.runId! } : item,
            ),
          );
        }

        // Refresh live stats after save
        await refreshStats();
      } finally {
        setIsSyncing(false);
      }
    },
    [simulationSlug, refreshStats],
  );

  return {
    history,
    globalStats,
    isSyncing,
    recordRun,
    refreshHistory,
    refreshStats,
  };
}
