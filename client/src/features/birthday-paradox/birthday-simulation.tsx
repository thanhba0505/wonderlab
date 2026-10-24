'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  calculateComparisonPairs,
  calculateTheoreticalProbability,
  MonteCarloBatchResult,
  RoomSimulationResult,
  runMonteCarloBatch,
  simulateRoom,
} from './birthday-math';
import { ChamberRadar } from './components/chamber-radar';
import { CalendarHeatmap } from './components/calendar-heatmap';
import { ProbabilityChart } from './components/probability-chart';
import { ControlsPanel } from './components/controls-panel';
import { IntuitionExplainer } from './components/intuition-explainer';
import { CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { SimulationHistoryTable } from '@/features/simulations/components/simulation-history-table';
import { ExportSuitePanel } from '@/features/simulations/components/export-suite-panel';
import { GlobalTelemetryWidget } from '@/features/simulations/components/global-telemetry-widget';
import { IntuitionChallengeCard } from '@/features/simulations/components/intuition-challenge-card';
import { getSimulationBySlug } from '@/features/simulations/registry';
import { HypothesisOption } from '@/features/simulations/types';

function createDeterministicRng(seed = 2026) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const BirthdaySimulation: React.FC = () => {
  const meta = getSimulationBySlug('birthday-paradox');
  const [userPrediction, setUserPrediction] = useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);

  const [n, setN] = useState<number>(23);
  const [room, setRoom] = useState<RoomSimulationResult>(() =>
    simulateRoom(23, 365, createDeterministicRng(2026)),
  );
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Background Telemetry Hook
  const { history, globalStats, recordRun } = useSimulationTelemetry('birthday-paradox');

  // Thống kê phiên người dùng hiện tại
  const [sessionRoomsCount, setSessionRoomsCount] = useState<number>(1);
  const [sessionCollisionCount, setSessionCollisionCount] = useState<number>(
    room.hasCollision ? 1 : 0,
  );

  // Synchronize initial n from URL query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const nParam = urlParams.get('n');
    if (nParam && !isNaN(Number(nParam))) {
      const parsedN = Math.min(100, Math.max(2, Math.round(Number(nParam))));
      if (parsedN !== 23) {
        setN(parsedN);
        setRoom(simulateRoom(parsedN));
      }
    }
  }, []);

  // Update URL search params when n changes
  const updateUrlParam = (newN: number) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('n', String(newN));
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore URL manipulation failures
    }
  };

  // Đổi số người trong phòng
  const handleNChange = (newN: number) => {
    setN(newN);
    updateUrlParam(newN);
    const newRoom = simulateRoom(newN);
    setRoom(newRoom);
    setSelectedPersonId(null);
    setMonteCarloResult(null);

    setSessionRoomsCount(prev => prev + 1);
    if (newRoom.hasCollision) {
      setSessionCollisionCount(prev => prev + 1);
    }
  };

  // Sinh phòng ngẫu nhiên mới với n hiện tại
  const handleRandomizeRoom = () => {
    const newRoom = simulateRoom(n);
    setRoom(newRoom);
    setSelectedPersonId(null);

    setSessionRoomsCount(prev => prev + 1);
    if (newRoom.hasCollision) {
      setSessionCollisionCount(prev => prev + 1);
    }
  };

  const theoreticalP = calculateTheoreticalProbability(n);
  const totalPairs = calculateComparisonPairs(n);

  // Chạy mô phỏng hàng nghìn phòng (Monte Carlo)
  const handleRunBatch = (trials: number) => {
    const startTime = performance.now();
    startTransition(() => {
      const result = runMonteCarloBatch(n, trials);
      const duration = Math.round(performance.now() - startTime);
      setMonteCarloResult(result);

      // Lưu trữ lượt chạy lên telemetry API
      recordRun(
        {
          groupSize: n,
          userPrediction: userPrediction?.option.value,
        },
        {
          collisions: result.collisions,
          empiricalProbability: result.empiricalRate,
          theoreticalProbability: theoreticalP,
          intuitionGap: userPrediction?.gap,
        },
        trials,
        duration,
      );
    });
  };

  // Đặt lại về trạng thái mặc định ban đầu
  const handleReset = () => {
    setN(23);
    updateUrlParam(23);
    const newRoom = simulateRoom(23);
    setRoom(newRoom);
    setSelectedPersonId(null);
    setMonteCarloResult(null);
    setSessionRoomsCount(1);
    setSessionCollisionCount(newRoom.hasCollision ? 1 : 0);
  };

  const currentEmpiricalRate = monteCarloResult
    ? monteCarloResult.empiricalRate
    : sessionCollisionCount / sessionRoomsCount;

  return (
    <div className="flex flex-col gap-6">
      {/* Telemetry toàn cầu */}
      <GlobalTelemetryWidget stats={globalStats} className="w-full justify-between" />

      {/* Thử thách dự đoán trực giác */}
      {meta?.hypothesis && (
        <IntuitionChallengeCard
          challenge={meta.hypothesis}
          simulationSlug="birthday-paradox"
          onPredictionSelected={(option, gap) => setUserPrediction({ option, gap })}
        />
      )}

      {/* Thanh đo lường Telemetry chính */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="lab-card rounded-lg p-3">
          <div className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Số người trong phòng (n)
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">{n}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">{totalPairs} cặp đối sánh</div>
        </div>

        <div className="lab-card rounded-lg p-3">
          <div className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Xác suất Lý thuyết P(n)
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-blue-600 tabular-nums">
            {(theoreticalP * 100).toFixed(1)}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            {n >= 23 ? 'Vượt ngưỡng 50% ★' : 'Dưới ngưỡng 50%'}
          </div>
        </div>

        <div className="lab-card rounded-lg p-3">
          <div className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Phòng hiện tại
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-lg font-bold">
            {room.hasCollision ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-amber-600" />
                <span className="text-amber-700">Có trùng</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-slate-400" />
                <span className="text-slate-600">Không trùng</span>
              </>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
            {room.collisionPairs.length} cặp trùng nhau
          </div>
        </div>

        <div className="lab-card rounded-lg p-3">
          <div className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            Thực nghiệm Monte Carlo
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 tabular-nums">
            {(currentEmpiricalRate * 100).toFixed(1)}%
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
            {monteCarloResult
              ? `${monteCarloResult.collisions}/${monteCarloResult.trials} phòng`
              : `${sessionCollisionCount}/${sessionRoomsCount} lần thử`}
          </div>
        </div>
      </div>

      {/* Bento Grid 2 cột chính */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Cột trái: Bộ điều khiển & Vòng tròn radar */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card className="lab-card rounded-xl border-slate-300">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Tham số Buồng Thí nghiệm</span>
                {room.hasCollision && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Phát hiện va chạm!
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ControlsPanel
                n={n}
                onChangeN={handleNChange}
                onRandomizeRoom={handleRandomizeRoom}
                onRunBatch={handleRunBatch}
                onReset={handleReset}
                isSimulatingBatch={isPending}
              />
            </CardContent>
          </Card>

          <Card className="lab-card rounded-xl border-slate-300">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Buồng Radar Không gian (Chamber View)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 flex justify-center">
              <ChamberRadar
                people={room.people}
                collisionPairs={room.collisionPairs}
                selectedPersonId={selectedPersonId}
                onSelectPerson={setSelectedPersonId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Đồ thị xác suất & Lịch phân bổ */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Card className="lab-card rounded-xl border-slate-300">
            <CardContent className="pt-4">
              <ProbabilityChart currentN={n} monteCarloResult={monteCarloResult} />
            </CardContent>
          </Card>

          <Card className="lab-card rounded-xl border-slate-300">
            <CardContent className="pt-4">
              <CalendarHeatmap
                people={room.people}
                sharedDates={room.sharedDates}
                selectedPersonId={selectedPersonId}
                onSelectPerson={setSelectedPersonId}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bộ công cụ xuất dữ liệu & Chia sẻ cấu hình */}
      <ExportSuitePanel
        simulationTitle="Nghịch lý Ngày sinh (Birthday Paradox)"
        simulationSlug="birthday-paradox"
        parameters={{ groupSize: n, comparisonPairs: totalPairs }}
        results={{
          empiricalProbability: currentEmpiricalRate,
          theoreticalProbability: theoreticalP,
          hasCollisionCurrentRoom: room.hasCollision,
          collisionPairsCount: room.collisionPairs.length,
        }}
        csvHeaders={['Timestamp', 'Group_Size_N', 'Trials_Count', 'Empirical_P', 'Theoretical_P']}
        historyRows={history.map(r => [
          r.createdAt,
          String(
            (r.parameters as Record<string, unknown>)?.groupSize ??
              (r.parameters as Record<string, unknown>)?.n ??
              n,
          ),
          r.trialsCount,
          typeof (r.results as Record<string, unknown>)?.empiricalProbability === 'number'
            ? (
                ((r.results as Record<string, unknown>).empiricalProbability as number) * 100
              ).toFixed(2) + '%'
            : 'N/A',
          typeof (r.results as Record<string, unknown>)?.theoreticalProbability === 'number'
            ? (
                ((r.results as Record<string, unknown>).theoreticalProbability as number) * 100
              ).toFixed(2) + '%'
            : 'N/A',
        ])}
      />

      {/* Lịch sử lượt chạy thực nghiệm của phiên */}
      <SimulationHistoryTable
        runs={history}
        onReloadParams={params => {
          const reloadedN = params.groupSize ?? params.n;
          if (typeof reloadedN === 'number') {
            handleNChange(reloadedN);
          }
        }}
      />

      {/* Khối giải thích trực giác toán học */}
      <Card className="lab-card rounded-xl border-slate-300">
        <CardContent className="pt-5">
          <IntuitionExplainer currentN={n} />
        </CardContent>
      </Card>
    </div>
  );
};
