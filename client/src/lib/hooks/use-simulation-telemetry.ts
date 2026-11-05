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
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [total, setTotal] = React.useState<number>(0);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  const refreshHistory = React.useCallback(
    async (targetPage = page, targetLimit = pageSize) => {
      setIsSyncing(true);
      try {
        const res = await fetchSimulationHistory(simulationSlug, targetPage, targetLimit);
        setHistory(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setPage(res.page);
        setPageSize(res.limit);
      } finally {
        setIsSyncing(false);
      }
    },
    [simulationSlug, page, pageSize],
  );

  const refreshStats = React.useCallback(async () => {
    const stats = await fetchSimulationStats(simulationSlug);
    if (stats) {
      setGlobalStats(stats);
    }
  }, [simulationSlug]);

  React.useEffect(() => {
    refreshHistory(1, pageSize);
    refreshStats();
  }, [simulationSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPageChange = React.useCallback(
    (newPage: number) => {
      setPage(newPage);
      refreshHistory(newPage, pageSize);
    },
    [refreshHistory, pageSize],
  );

  const onPageSizeChange = React.useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
      refreshHistory(1, newSize);
    },
    [refreshHistory],
  );

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

      // When recording a new run, jump to page 1 and prepend optimistically
      setPage(1);
      setTotal(prev => prev + 1);
      setHistory(prev => [optimisticItem, ...prev.slice(0, pageSize - 1)]);
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
    [simulationSlug, pageSize, refreshStats],
  );

  return {
    history,
    globalStats,
    isSyncing,
    page,
    pageSize,
    total,
    totalPages,
    onPageChange,
    onPageSizeChange,
    recordRun,
    refreshHistory,
    refreshStats,
  };
}
