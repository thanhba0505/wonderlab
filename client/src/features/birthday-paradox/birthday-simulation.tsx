'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  calculateComparisonPairs,
  calculateTheoreticalProbability,
  MonteCarloBatchResult,
  RoomSimulationResult,
  simulateRoom,
} from './birthday-math';
import { useBirthdayWorker } from '@/features/simulations/hooks';
import { ChamberRadar } from './components/chamber-radar';
import { CalendarHeatmap } from './components/calendar-heatmap';
import { ProbabilityChart } from './components/probability-chart';
import { ControlsPanel } from './components/controls-panel';
import { IntuitionExplainer } from './components/intuition-explainer';
import {
  CheckCircle2,
  Sparkles,
  XCircle,
  FileSpreadsheet,
  FileJson,
  Copy,
  Share2,
  Check,
  Activity,
  Database,
  Sliders,
  Radar,
} from 'lucide-react';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import {
  SimulationSection,
  SimulationExplainerCard,
  SimulationHistoryTable,
  IntuitionChallengeCard,
} from '@/features/simulations/components';
import { useSimulationMeta } from '@/features/simulations/hooks';
import { useTranslation } from '@/i18n';
import { HypothesisOption } from '@/features/simulations/types';
import { exportToCsv, exportToJson, copyToClipboard } from '../simulations/utils/export-data';

function createDeterministicRng(seed = 2026) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const BirthdaySimulation: React.FC = () => {
  const { locale } = useTranslation();
  const isEn = locale === 'en';
  const meta = useSimulationMeta('birthday-paradox');
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

  // Export clipboard feedback
  const [copiedType, setCopiedType] = useState<'report' | 'url' | null>(null);

  // Background Telemetry Hook
  const { history, globalStats, recordRun } = useSimulationTelemetry('birthday-paradox');

  // Thống kê phiên người dùng hiện tại
  const [sessionRoomsCount, setSessionRoomsCount] = useState<number>(1);
  const [sessionCollisionCount, setSessionCollisionCount] = useState<number>(
    room.hasCollision ? 1 : 0,
  );

  const startTimeRef = useRef<number>(0);
  const [targetTrials, setTargetTrials] = useState<number>(0);

  const theoreticalP = calculateTheoreticalProbability(n);
  const totalPairs = calculateComparisonPairs(n);

  const {
    isRunning: isSimulatingBatch,
    progress: batchProgress,
    partialResult: workerPartial,
    run: runWorkerBirthday,
    abort: abortWorkerBirthday,
  } = useBirthdayWorker({
    onProgress: (_prog, partial) => {
      if (partial && typeof partial.empiricalRate === 'number') {
        const completed = partial.completedTrials ?? 0;
        setMonteCarloResult({
          trials: completed,
          collisions: partial.collisions ?? 0,
          empiricalRate: partial.empiricalRate,
          theoreticalRate: partial.theoreticalRate ?? theoreticalP,
        });
      }
    },
    onComplete: finalRes => {
      const duration = Math.round(performance.now() - startTimeRef.current);
      const result: MonteCarloBatchResult = {
        trials: finalRes.trials,
        collisions: finalRes.collisions,
        empiricalRate: finalRes.empiricalRate,
        theoreticalRate: finalRes.theoreticalRate,
      };
      setMonteCarloResult(result);

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
        finalRes.trials,
        duration,
      );
    },
    onAborted: partial => {
      if (partial && (partial.completedTrials ?? 0) > 0) {
        const completed = partial.completedTrials ?? 0;
        const collisions = partial.collisions ?? 0;
        const duration = Math.round(performance.now() - startTimeRef.current);
        const result: MonteCarloBatchResult = {
          trials: completed,
          collisions,
          empiricalRate: collisions / completed,
          theoreticalRate: partial.theoreticalRate ?? theoreticalP,
        };
        setMonteCarloResult(result);

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
          completed,
          duration,
        );
      }
    },
  });

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
    if (isSimulatingBatch) {
      abortWorkerBirthday();
    }
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

  // Chạy mô phỏng hàng nghìn phòng (Monte Carlo) qua Web Worker
  const handleRunBatch = (trials: number) => {
    startTimeRef.current = performance.now();
    setTargetTrials(trials);
    runWorkerBirthday({ n, trials, daysInYear: 365 });
  };

  // Đặt lại về trạng thái mặc định ban đầu
  const handleReset = () => {
    if (isSimulatingBatch) {
      abortWorkerBirthday();
    }
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

  // Tool: Export CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Group_Size_N', 'Trials_Count', 'Empirical_P', 'Theoretical_P'];
    const rows = history.map(r => [
      r.createdAt,
      String(
        (r.parameters as Record<string, unknown>)?.groupSize ??
          (r.parameters as Record<string, unknown>)?.n ??
          n,
      ),
      r.trialsCount,
      typeof (r.results as Record<string, unknown>)?.empiricalProbability === 'number'
        ? (((r.results as Record<string, unknown>).empiricalProbability as number) * 100).toFixed(
            2,
          ) + '%'
        : 'N/A',
      typeof (r.results as Record<string, unknown>)?.theoreticalProbability === 'number'
        ? (((r.results as Record<string, unknown>).theoreticalProbability as number) * 100).toFixed(
            2,
          ) + '%'
        : 'N/A',
    ]);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    exportToCsv(`wonderlab-birthday-paradox-${timestamp}`, headers, rows);
  };

  // Tool: Export JSON
  const handleExportJson = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const exportPayload = {
      platform: 'Wonderlab Open Science Platform',
      title: 'Nghịch lý Ngày sinh (Birthday Paradox)',
      slug: 'birthday-paradox',
      exportedAt: new Date().toISOString(),
      parameters: { groupSize: n, comparisonPairs: totalPairs },
      results: {
        empiricalProbability: currentEmpiricalRate,
        theoreticalProbability: theoreticalP,
        hasCollisionCurrentRoom: room.hasCollision,
        collisionPairsCount: room.collisionPairs.length,
      },
    };
    exportToJson(`wonderlab-birthday-paradox-${timestamp}`, exportPayload);
  };

  // Tool: Copy Markdown Report
  const handleCopyReport = async () => {
    const markdown = [
      `# Báo cáo Thực nghiệm: Nghịch lý Ngày sinh (Birthday Paradox)`,
      `- **Nền tảng**: Wonderlab Interactive Science Platform`,
      `- **Thời điểm**: ${new Date().toLocaleString('vi-VN')}`,
      `- **Mã thí nghiệm**: \`birthday-paradox\``,
      '',
      `## Tham số đầu vào:`,
      `- **Số người trong phòng (n)**: \`${n}\``,
      `- **Số cặp đối sánh**: \`${totalPairs}\``,
      '',
      `## Kết quả thực nghiệm:`,
      `- **Xác suất Lý thuyết P(n)**: \`${(theoreticalP * 100).toFixed(2)}%\``,
      `- **Xác suất Thực nghiệm**: \`${(currentEmpiricalRate * 100).toFixed(2)}%\``,
      `- **Phòng hiện tại có trùng**: \`${room.hasCollision ? 'Có' : 'Không'}\``,
      '',
      `> Trích xuất từ Wonderlab (https://wonderlab.local/simulations/birthday-paradox)`,
    ].join('\n');

    const ok = await copyToClipboard(markdown);
    if (ok) {
      setCopiedType('report');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // Tool: Share URL
  const handleShareUrl = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('n', String(n));

    const ok = await copyToClipboard(url.toString());
    if (ok) {
      setCopiedType('url');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ────────────────────────── (Line phân cách sau intro/formula) ────────────────────────── */}
      <hr className="border-slate-200/80 -mt-2" />

      {/* 2. TITLE CÂU HỎI & CÂU HỎI TRỰC GIÁC */}
      <SimulationSection
        dotColor="amber"
        title={isEn ? 'Pre-experiment Intuition Survey' : 'Khảo Sát Trực Giác Trước Thực Nghiệm'}
        subtitle={
          isEn
            ? 'Make a personal prediction to measure the gap between naive intuition and probability'
            : 'Đưa ra dự đoán cá nhân để đo lường khoảng cách giữa trực giác thông thường và toán học xác suất'
        }
      >
        {meta?.hypothesis && (
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug="birthday-paradox"
            onPredictionSelected={(option, gap) => setUserPrediction({ option, gap })}
          />
        )}
      </SimulationSection>

      {/* 3. TITLE CHỖ THÍ NGHIỆM & BLOCK THÍ NGHIỆM HỢP NHẤT */}
      <SimulationSection
        dotColor="blue"
        title={isEn ? 'Laboratory & Visual Simulation' : 'Buồng Thí Nghiệm & Mô Phỏng Trực Quan'}
        subtitle={
          isEn
            ? 'Interactive parameter manipulation, spatial collision radar, and Monte Carlo engine'
            : 'Không gian thao tác tham số trực tiếp, radar va chạm không gian và mô phỏng Monte Carlo'
        }
      >
        {/* 🧪 BLOCK THÍ NGHIỆM HỢP NHẤT (Single Unified Lab Workbench - Không lồng khung) */}
        <div className="rounded-2xl border border-slate-300/85 bg-white shadow-xs p-5 sm:p-6 space-y-6">
          {/* [A] Thanh trạng thái đo lường nhỏ gọn (Không viền hộp lồng nhau) */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pb-5 border-b border-slate-200/80">
            {/* Metric 1: Group size n */}
            <div className="space-y-1">
              <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {isEn ? 'Room population (n)' : 'Số người trong phòng (n)'}
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {n}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {totalPairs} {isEn ? 'pairwise comparisons' : 'cặp đối sánh'}
              </div>
            </div>

            {/* Metric 2: Theoretical P(n) */}
            <div className="space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-4">
              <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {isEn ? 'Theoretical Probability P(n)' : 'Xác suất Lý thuyết P(n)'}
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
                {(theoreticalP * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 font-sans">
                {n >= 23
                  ? isEn
                    ? 'Exceeds 50% ★'
                    : 'Vượt ngưỡng 50% ★'
                  : isEn
                    ? 'Below 50%'
                    : 'Dưới ngưỡng 50%'}
              </div>
            </div>

            {/* Metric 3: Current room collision */}
            <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
              <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {isEn ? 'Current Room' : 'Phòng hiện tại'}
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xl sm:text-2xl font-bold pt-0.5">
                {room.hasCollision ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-700">{isEn ? 'Collision' : 'Có trùng'}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-600">{isEn ? 'No collision' : 'Không trùng'}</span>
                  </>
                )}
              </div>
              <div className="font-mono text-xs text-slate-500 tabular-nums">
                {room.collisionPairs.length} {isEn ? 'shared pairs' : 'cặp trùng nhau'}
              </div>
            </div>

            {/* Metric 4: Monte Carlo rate */}
            <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
              <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {isEn ? 'Monte Carlo Trials' : 'Thực nghiệm Monte Carlo'}
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
                {(currentEmpiricalRate * 100).toFixed(1)}%
              </div>
              <div className="font-mono text-xs text-slate-500 tabular-nums">
                {monteCarloResult
                  ? `${monteCarloResult.collisions}/${monteCarloResult.trials} ${isEn ? 'rooms' : 'phòng'}`
                  : `${sessionCollisionCount}/${sessionRoomsCount} ${isEn ? 'trials' : 'lần thử'}`}
              </div>
            </div>
          </div>

          {/* [B] Vùng thực nghiệm tương tác chính (Không đóng khung lồng, không lặp title, line phân khu vực) */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Cột trái: Bộ điều khiển & Vòng tròn radar */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              {/* Controls Section - Phẳng, không kẻ line ngay dưới title */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
                      {isEn ? 'Laboratory Parameters' : 'Tham số Buồng Thí nghiệm'}
                    </h3>
                  </div>
                  {room.hasCollision && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                      <Sparkles className="mr-1 h-3 w-3" />
                      {isEn ? 'Collision!' : 'Va chạm!'}
                    </Badge>
                  )}
                </div>

                <ControlsPanel
                  n={n}
                  onChangeN={handleNChange}
                  onRandomizeRoom={handleRandomizeRoom}
                  onRunBatch={handleRunBatch}
                  onAbortBatch={abortWorkerBirthday}
                  onReset={handleReset}
                  isSimulatingBatch={isSimulatingBatch}
                  batchProgress={batchProgress}
                  completedTrials={workerPartial?.completedTrials}
                  targetTrials={targetTrials}
                />
              </div>

              {/* Chamber Radar Section - Line phân khu vực ở trên, không kẻ line ngay dưới title */}
              <div className="space-y-3 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2 pb-1">
                  <Radar className="h-4 w-4 text-violet-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
                    {isEn ? 'Spatial Radar Chamber' : 'Buồng Radar Không gian (Chamber View)'}
                  </h3>
                </div>
                <div className="flex justify-center pt-1">
                  <ChamberRadar
                    people={room.people}
                    collisionPairs={room.collisionPairs}
                    selectedPersonId={selectedPersonId}
                    onSelectPerson={setSelectedPersonId}
                  />
                </div>
              </div>
            </div>

            {/* Cột phải: Đồ thị xác suất & Lịch phân bổ - Phân cách bằng line dọc */}
            <div className="flex flex-col gap-6 lg:col-span-7 lg:border-l lg:border-slate-200/80 lg:pl-6">
              {/* Probability Chart - Title duy nhất tích hợp bên trong component */}
              <div>
                <ProbabilityChart currentN={n} monteCarloResult={monteCarloResult} />
              </div>

              {/* Calendar Heatmap - Line phân khu vực ở trên, title duy nhất tích hợp bên trong */}
              <div className="pt-6 border-t border-slate-200/80">
                <CalendarHeatmap
                  people={room.people}
                  sharedDates={room.sharedDates}
                  selectedPersonId={selectedPersonId}
                  onSelectPerson={setSelectedPersonId}
                />
              </div>
            </div>
          </div>

          {/* ─────────────────────── (Line ngăn cách công cụ & telemetry) ──────────────────────── */}
          <div className="border-t border-slate-200/80 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* [C.1] Mấy nút công cụ ở bottom block này */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={isEn ? 'Export CSV Spreadsheet' : 'Tải tệp bảng tính CSV'}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                {isEn ? 'Export CSV' : 'Xuất CSV'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={isEn ? 'Export JSON Data' : 'Tải tệp JSON dữ liệu'}
              >
                <FileJson className="h-3.5 w-3.5 text-blue-600" />
                {isEn ? 'Export JSON' : 'Xuất JSON'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={isEn ? 'Copy Markdown Report' : 'Sao chép báo cáo Markdown'}
              >
                {copiedType === 'report' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      {isEn ? 'Copied!' : 'Đã chép!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    {isEn ? 'Copy Report' : 'Chép Báo cáo'}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShareUrl}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={isEn ? 'Copy Parameter Share Link' : 'Sao chép liên kết chia sẻ tham số'}
              >
                {copiedType === 'url' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      {isEn ? 'Link Copied!' : 'Đã chép Link!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-violet-600" />
                    {isEn ? 'Share Link' : 'Chia sẻ URL'}
                  </>
                )}
              </Button>
            </div>

            {/* [C.2] Thông số Telemetry góc dưới phải */}
            <div className="flex items-center gap-2 self-end md:self-auto text-xs font-mono">
              {globalStats && globalStats.totalTrials > 0 ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-700">Telemetry:</span>
                  <div className="flex items-center gap-1 text-slate-700">
                    <Database className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-bold text-blue-700 tabular-nums">
                      {globalStats.totalTrials.toLocaleString(isEn ? 'en-US' : 'vi-VN')}
                    </span>
                    <span className="text-slate-400">{isEn ? 'trials' : 'phép thử'}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-bold text-slate-800 tabular-nums">
                      {globalStats.totalRuns.toLocaleString(isEn ? 'en-US' : 'vi-VN')}
                    </span>
                    <span className="text-slate-400">{isEn ? 'runs' : 'lượt'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                  <span>{isEn ? 'Ready for telemetry' : 'Sẵn sàng thu thập telemetry'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SimulationSection>

      {/* 4. TITLE NHẬT KÝ & NHẬT KÝ THỰC NGHIỆM */}
      <SimulationSection
        dotColor="emerald"
        title={isEn ? 'Experimental Log' : 'Nhật Ký Thực Nghiệm'}
        subtitle={
          isEn
            ? 'Detailed trial history and experiment logs recorded during this session'
            : 'Bảng lưu trữ chi tiết các lượt chạy và kết quả thực nghiệm trong phiên nghiên cứu'
        }
      >
        <SimulationHistoryTable
          runs={history}
          onReloadParams={params => {
            const reloadedN = params.groupSize ?? params.n;
            if (typeof reloadedN === 'number') {
              handleNChange(reloadedN);
            }
          }}
        />
      </SimulationSection>

      {/* 5. TITLE GIẢI THÍCH & GIẢI THÍCH KHOA HỌC */}
      <SimulationSection
        dotColor="blue"
        title={
          isEn
            ? 'Scientific Explanation & Mathematical Foundation'
            : 'Giải Thích Khoa Học & Bản Chất Toán Học'
        }
        subtitle={
          isEn
            ? 'Deconstructing the paradox root cause and the combinatorial explosion of comparison pairs'
            : 'Bóc tách nguyên nhân nghịch lý và sự bùng nổ tổ hợp của các cặp đối sánh'
        }
      >
        <SimulationExplainerCard>
          <IntuitionExplainer currentN={n} />
        </SimulationExplainerCard>
      </SimulationSection>
    </div>
  );
};
