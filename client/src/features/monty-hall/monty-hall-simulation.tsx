'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Play,
  Square,
  XCircle,
  Trophy,
  Sparkles,
  Lock,
  ArrowRightLeft,
  Flame,
  FileSpreadsheet,
  FileJson,
  Copy,
  Check,
  Database,
  Activity,
} from 'lucide-react';
import { useMontyHallWorker } from '@/features/simulations/hooks';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import {
  SimulationSection,
  SimulationWorkbenchCard,
  SimulationExplainerCard,
  SimulationFormulaBox,
  SimulationHistoryTable,
  IntuitionChallengeCard,
  MathFraction,
} from '@/features/simulations/components';
import { useSimulationMeta } from '@/features/simulations/hooks';
import { useTranslation } from '@/i18n';
import { HypothesisOption } from '@/features/simulations/types';
import {
  exportToCsv,
  exportToJson,
  copyToClipboard,
} from '@/features/simulations/utils/export-data';

type Step = 'pick' | 'revealed' | 'result';

interface Stats {
  switchPlays: number;
  switchWins: number;
  stayPlays: number;
  stayWins: number;
}

export interface MontyHallSimulationProps {
  showHistory?: boolean;
}

export function MontyHallSimulation({ showHistory = true }: MontyHallSimulationProps = {}) {
  const { locale } = useTranslation();
  const isEn = locale === 'en';
  const meta = useSimulationMeta('monty-hall');
  const [userPrediction, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);
  const [copiedType, setCopiedType] = React.useState<'report' | null>(null);

  const { history, globalStats, recordRun } = useSimulationTelemetry('monty-hall');
  const [carDoor, setCarDoor] = React.useState<number>(0);
  const [selectedDoor, setSelectedDoor] = React.useState<number | null>(null);
  const [revealedGoatDoor, setRevealedGoatDoor] = React.useState<number | null>(null);
  const [finalDoor, setFinalDoor] = React.useState<number | null>(null);
  const [step, setStep] = React.useState<Step>('pick');
  const [didSwitch, setDidSwitch] = React.useState<boolean>(false);
  const [stats, setStats] = React.useState<Stats>({
    switchPlays: 0,
    switchWins: 0,
    stayPlays: 0,
    stayWins: 0,
  });

  // Khởi tạo vòng chơi mới
  const startNewRound = React.useCallback(() => {
    const randomCar = Math.floor(Math.random() * 3);
    setCarDoor(randomCar);
    setSelectedDoor(null);
    setRevealedGoatDoor(null);
    setFinalDoor(null);
    setStep('pick');
    setDidSwitch(false);
  }, []);

  React.useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  // Bước 1: Người chơi chọn 1 cánh cửa
  const handleSelectDoor = (doorIndex: number) => {
    if (step !== 'pick') return;

    setSelectedDoor(doorIndex);

    // Người dẫn chương trình mở cánh cửa có DÊ và KHÔNG PHẢI cửa người chơi đã chọn
    const possibleGoatDoors = [0, 1, 2].filter(d => d !== doorIndex && d !== carDoor);
    const hostChoice =
      possibleGoatDoors[Math.floor(Math.random() * possibleGoatDoors.length)] ??
      [0, 1, 2].find(d => d !== doorIndex) ??
      0;

    setRevealedGoatDoor(hostChoice);
    setStep('revealed');
  };

  // Bước 2: Quyết định Đổi hay Giữ
  const handleFinalDecision = (shouldSwitch: boolean) => {
    if (step !== 'revealed' || selectedDoor === null || revealedGoatDoor === null) return;

    const remainingDoor = [0, 1, 2].find(d => d !== selectedDoor && d !== revealedGoatDoor)!;
    const choice = shouldSwitch ? remainingDoor : selectedDoor;
    const won = choice === carDoor;

    setFinalDoor(choice);
    setDidSwitch(shouldSwitch);
    setStep('result');

    setStats(prev => {
      if (shouldSwitch) {
        return {
          ...prev,
          switchPlays: prev.switchPlays + 1,
          switchWins: prev.switchWins + (won ? 1 : 0),
        };
      } else {
        return {
          ...prev,
          stayPlays: prev.stayPlays + 1,
          stayWins: prev.stayWins + (won ? 1 : 0),
        };
      }
    });
  };

  const startTimeRef = React.useRef<number>(0);
  const targetBatchCountRef = React.useRef<number>(0);
  const [targetBatchCount, setTargetBatchCount] = React.useState<number>(0);
  const baselineStatsRef = React.useRef<Stats>({
    switchPlays: 0,
    switchWins: 0,
    stayPlays: 0,
    stayWins: 0,
  });

  const {
    isRunning: isSimulatingBatch,
    progress: workerProgress,
    partialResult: workerPartial,
    run: runWorkerMontyHall,
    abort: abortWorkerMontyHall,
  } = useMontyHallWorker({
    onProgress: (_prog, partial) => {
      if (partial) {
        setStats({
          switchPlays: baselineStatsRef.current.switchPlays + (partial.switchPlays ?? 0),
          switchWins: baselineStatsRef.current.switchWins + (partial.switchWins ?? 0),
          stayPlays: baselineStatsRef.current.stayPlays + (partial.stayPlays ?? 0),
          stayWins: baselineStatsRef.current.stayWins + (partial.stayWins ?? 0),
        });
      }
    },
    onComplete: finalRes => {
      const duration = Math.round(performance.now() - startTimeRef.current);
      const finalSwitchPlays = finalRes.switchPlays;
      const finalSwitchWins = finalRes.switchWins;
      const finalStayPlays = finalRes.stayPlays;
      const finalStayWins = finalRes.stayWins;

      setStats({
        switchPlays: baselineStatsRef.current.switchPlays + finalSwitchPlays,
        switchWins: baselineStatsRef.current.switchWins + finalSwitchWins,
        stayPlays: baselineStatsRef.current.stayPlays + finalStayPlays,
        stayWins: baselineStatsRef.current.stayWins + finalStayWins,
      });

      const switchWinRate = finalSwitchPlays > 0 ? finalSwitchWins / finalSwitchPlays : 0;
      recordRun(
        {
          doorsCount: 3,
          strategy: 'monte-carlo-mix',
          userPrediction: userPrediction?.option.value,
        },
        {
          switchPlays: finalSwitchPlays,
          switchWins: finalSwitchWins,
          stayPlays: finalStayPlays,
          stayWins: finalStayWins,
          empiricalProbability: switchWinRate,
          theoreticalProbability: 2 / 3,
          intuitionGap: userPrediction?.gap,
        },
        finalRes.completedTrials,
        duration,
      );
    },
    onAborted: partial => {
      if (partial && (partial.completedTrials ?? 0) > 0) {
        const completed = partial.completedTrials ?? 0;
        const duration = Math.round(performance.now() - startTimeRef.current);
        const curSwitchPlays = partial.switchPlays ?? 0;
        const curSwitchWins = partial.switchWins ?? 0;
        const curStayPlays = partial.stayPlays ?? 0;
        const curStayWins = partial.stayWins ?? 0;
        const switchWinRate = curSwitchPlays > 0 ? curSwitchWins / curSwitchPlays : 0;

        setStats({
          switchPlays: baselineStatsRef.current.switchPlays + curSwitchPlays,
          switchWins: baselineStatsRef.current.switchWins + curSwitchWins,
          stayPlays: baselineStatsRef.current.stayPlays + curStayPlays,
          stayWins: baselineStatsRef.current.stayWins + curStayWins,
        });

        recordRun(
          {
            doorsCount: 3,
            strategy: 'monte-carlo-mix',
            userPrediction: userPrediction?.option.value,
          },
          {
            switchPlays: curSwitchPlays,
            switchWins: curSwitchWins,
            stayPlays: curStayPlays,
            stayWins: curStayWins,
            empiricalProbability: switchWinRate,
            theoreticalProbability: 2 / 3,
            intuitionGap: userPrediction?.gap,
          },
          completed,
          duration,
        );
      }
    },
  });

  // Mô phỏng hàng loạt Monte Carlo qua Web Worker để kiểm chứng Luật Số Lớn
  const handleSimulateBatch = (batchCount: number) => {
    baselineStatsRef.current = { ...stats };
    targetBatchCountRef.current = batchCount;
    setTargetBatchCount(batchCount);
    startTimeRef.current = performance.now();
    runWorkerMontyHall({ trials: batchCount });
  };

  const resetStats = () => {
    if (isSimulatingBatch) {
      abortWorkerMontyHall();
    }
    setStats({
      switchPlays: 0,
      switchWins: 0,
      stayPlays: 0,
      stayWins: 0,
    });
    baselineStatsRef.current = {
      switchPlays: 0,
      switchWins: 0,
      stayPlays: 0,
      stayWins: 0,
    };
    startNewRound();
  };

  const switchRate =
    stats.switchPlays > 0 ? Math.round((stats.switchWins / stats.switchPlays) * 100) : null;

  const stayRate =
    stats.stayPlays > 0 ? Math.round((stats.stayWins / stats.stayPlays) * 100) : null;

  const remainingSwitchDoor =
    selectedDoor !== null && revealedGoatDoor !== null
      ? [0, 1, 2].find(d => d !== selectedDoor && d !== revealedGoatDoor)
      : null;

  const totalGames = stats.switchPlays + stats.stayPlays;

  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Doors_Count',
      'Trials_Count',
      'Empirical_Switch_Rate',
      'Theoretical_P',
    ];
    const rows = history.map(r => [
      r.createdAt,
      String((r.parameters as Record<string, unknown>)?.doorsCount ?? 3),
      r.trialsCount,
      typeof (r.results as Record<string, unknown>)?.empiricalProbability === 'number'
        ? (((r.results as Record<string, unknown>).empiricalProbability as number) * 100).toFixed(
            2,
          ) + '%'
        : 'N/A',
      '66.67%',
    ]);
    exportToCsv('wonderlab-monty-hall-empirical.csv', headers, rows);
  };

  const handleExportJson = () => {
    const exportData = {
      simulation: 'monty-hall',
      exportedAt: new Date().toISOString(),
      stats,
      switchRate,
      stayRate,
      runs: history,
    };
    exportToJson('wonderlab-monty-hall-data.json', exportData);
  };

  const handleCopyReport = async () => {
    const report = `# Báo Cáo Thực Nghiệm: Nghịch lý Monty Hall
- **Tổng số ván đã chơi**: ${totalGames}
- **Chiến lược Đổi cửa (Switch)**: ${stats.switchWins}/${stats.switchPlays} ván thắng (${switchRate !== null ? `${switchRate}%` : 'N/A'}) | Kỳ vọng lý thuyết: 66.7%
- **Chiến lược Giữ nguyên (Stay)**: ${stats.stayWins}/${stats.stayPlays} ván thắng (${stayRate !== null ? `${stayRate}%` : 'N/A'}) | Kỳ vọng lý thuyết: 33.3%
- **Kết luận**: Thực nghiệm xác nhận đổi cửa tăng gấp đôi cơ hội chiến thắng.`;
    const success = await copyToClipboard(report);
    if (success) {
      setCopiedType('report');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Line phân cách sau intro/formula */}
      <hr className="border-slate-200/80 my-1" />

      {/* 1. TITLE CÂU HỎI & CÂU HỎI TRỰC GIÁC */}
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
            simulationSlug="monty-hall"
            onPredictionSelected={(option, gap) => setUserPrediction({ option, gap })}
          />
        )}
      </SimulationSection>

      {/* 2. TITLE CHỖ THÍ NGHIỆM & BLOCK THÍ NGHIỆM HỢP NHẤT */}
      <SimulationSection
        dotColor="blue"
        title={isEn ? 'Laboratory & Visual Simulation' : 'Buồng Thí Nghiệm & Mô Phỏng Trực Quan'}
        subtitle={
          isEn
            ? 'Interactive 3-door Monty Hall chamber, Switch vs Stay strategy testing, and Monte Carlo engine'
            : 'Không gian tương tác 3 cánh cửa Monty Hall, thử nghiệm chiến lược Đổi vs Giữ và mô phỏng Monte Carlo'
        }
      >
        <SimulationWorkbenchCard
          metricsBar={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 pb-6 border-b border-slate-200/80">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {isEn ? 'Total games played' : 'Tổng ván đã chơi'}
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {totalGames}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {stats.switchPlays} {isEn ? 'switch' : 'đổi'} / {stats.stayPlays}{' '}
                  {isEn ? 'stay' : 'giữ'}
                </div>
              </div>

              <div className="space-y-1.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex flex-wrap items-center justify-between gap-1">
                  <span>{isEn ? 'Switch Strategy' : 'Chiến lược Đổi Cửa'}</span>
                  <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {isEn ? 'Theory 66.7%' : 'Lý thuyết 66.7%'}
                  </span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
                  {switchRate !== null ? `${switchRate}%` : '—'}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {stats.switchWins} {isEn ? 'wins' : 'thắng'} / {stats.switchPlays}{' '}
                  {isEn ? 'games' : 'ván'}
                </div>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-6">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex flex-wrap items-center justify-between gap-1">
                  <span>{isEn ? 'Stay Strategy' : 'Chiến lược Giữ Cửa'}</span>
                  <span className="font-mono text-xs text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded">
                    {isEn ? 'Theory 33.3%' : 'Lý thuyết 33.3%'}
                  </span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-violet-700 tabular-nums">
                  {stayRate !== null ? `${stayRate}%` : '—'}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {stats.stayWins} {isEn ? 'wins' : 'thắng'} / {stats.stayPlays}{' '}
                  {isEn ? 'games' : 'ván'}
                </div>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-6">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {isEn ? 'Game Progress' : 'Tiến trình lượt chơi'}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold pt-0.5 text-slate-900 truncate">
                  {step === 'pick' && (isEn ? 'Pick a door' : 'Chọn 1 cánh cửa')}
                  {step === 'revealed' && (isEn ? 'Switch or Stay?' : 'Đổi hay Giữ?')}
                  {step === 'result' &&
                    (finalDoor === carDoor
                      ? isEn
                        ? '🎉 Won Sports Car'
                        : '🎉 Thắng Xe Thể Thao'
                      : isEn
                        ? '🐐 Got a Goat'
                        : '🐐 Vào Dê Cỏ')}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {step === 'pick' && (isEn ? 'Start a new round' : 'Bắt đầu lượt chơi mới')}
                  {step === 'revealed' && (isEn ? 'Host opened a Goat door' : 'MC đã mở 1 cửa Dê')}
                  {step === 'result' &&
                    (didSwitch
                      ? isEn
                        ? 'Switch Strategy'
                        : 'Chiến lược Đổi Cửa'
                      : isEn
                        ? 'Stay Strategy'
                        : 'Chiến lược Giữ Nguyên')}
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
                    {globalStats.totalTrials.toLocaleString(isEn ? 'en-US' : 'vi-VN')}
                  </span>
                  <span className="text-slate-400">{isEn ? 'games' : 'ván'}</span>
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
            )
          }
        >
          <div className="space-y-6 sm:space-y-7">
            {/* Hướng dẫn tương tác */}
            <div className="rounded-xl bg-slate-100/80 px-5 py-4 border-l-4 border-blue-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="text-sm font-medium text-slate-800">
                {step === 'pick' && (
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
                    <span>
                      {isEn
                        ? 'Choose one of the 3 doors below to make your initial selection.'
                        : 'Hãy chọn một trong 3 cánh cửa bên dưới để đưa ra lựa chọn ban đầu.'}
                    </span>
                  </span>
                )}
                {step === 'revealed' && (
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span>
                      {isEn
                        ? `Host opened Door #${Number(revealedGoatDoor ?? 0) + 1} (Goat). Do you want to Stay with Door #${Number(selectedDoor ?? 0) + 1} or Switch to Door #${Number(remainingSwitchDoor ?? 0) + 1}?`
                        : `MC đã mở Cửa #${Number(revealedGoatDoor ?? 0) + 1} (chứa Dê). Bạn muốn Giữ Cửa #${Number(selectedDoor ?? 0) + 1} hay Đổi sang Cửa #${Number(remainingSwitchDoor ?? 0) + 1}?`}
                    </span>
                  </span>
                )}
                {step === 'result' && (
                  <span className="flex items-center gap-2">
                    {finalDoor === carDoor ? (
                      <span className="text-emerald-800 flex items-center gap-2 font-bold text-sm">
                        <Trophy className="h-4 w-4 text-emerald-600 shrink-0" />
                        {isEn ? (
                          <>
                            Victory! You won the Sports Car using{' '}
                            <span className="underline decoration-emerald-500">
                              {didSwitch ? 'Switch Strategy' : 'Stay Strategy'}
                            </span>
                            !
                          </>
                        ) : (
                          <>
                            Chiến thắng! Bạn đã nhận Ô tô thể thao với{' '}
                            <span className="underline decoration-emerald-500">
                              {didSwitch ? 'Chiến lược Đổi Cửa' : 'Chiến lược Giữ Nguyên'}
                            </span>
                            !
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-700 flex items-center gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        {isEn ? (
                          <>
                            Hard luck! Behind is a Goat (
                            {didSwitch ? 'Switch Strategy' : 'Stay Strategy'}).
                          </>
                        ) : (
                          <>
                            Rất tiếc! Đằng sau là Dê cỏ (
                            {didSwitch ? 'Chiến lược Đổi Cửa' : 'Chiến lược Giữ Nguyên'}).
                          </>
                        )}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {step === 'result' ? (
                <Button
                  size="sm"
                  onClick={startNewRound}
                  className="text-xs font-bold shrink-0 shadow-xs h-8"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  {isEn ? 'New Round' : 'Vòng mới'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewRound}
                  className="text-xs font-semibold shrink-0 border-slate-300 text-slate-700 hover:bg-slate-50 h-8"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  {isEn ? 'Reset' : 'Làm mới'}
                </Button>
              )}
            </div>

            {/* 3 Cánh cửa Vault (Giao diện tinh gọn, xúc giác, thoáng đãng) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[0, 1, 2].map(doorIndex => {
                const isSelected = selectedDoor === doorIndex;
                const isRevealedGoat = revealedGoatDoor === doorIndex;
                const isFinalChoice = finalDoor === doorIndex;
                const hasCar = carDoor === doorIndex;

                let borderColor = 'border-slate-300/85 hover:border-blue-500';
                let bgColor = 'bg-slate-50/70';
                let glowEffect = '';

                if (step === 'revealed') {
                  if (isSelected) {
                    borderColor = 'border-blue-600 ring-2 ring-blue-500/20';
                    bgColor = 'bg-blue-50/70';
                    glowEffect = 'shadow-md shadow-blue-500/10';
                  } else if (isRevealedGoat) {
                    borderColor = 'border-amber-300';
                    bgColor = 'bg-amber-50/50';
                  } else {
                    borderColor = 'border-violet-400 ring-2 ring-violet-500/15';
                    bgColor = 'bg-violet-50/50';
                  }
                } else if (step === 'result') {
                  if (hasCar) {
                    borderColor = 'border-emerald-600 ring-2 ring-emerald-500/25';
                    bgColor = 'bg-emerald-50/80';
                    glowEffect = 'shadow-md shadow-emerald-500/15';
                  } else if (isFinalChoice) {
                    borderColor = 'border-red-300';
                    bgColor = 'bg-red-50/40';
                  }
                }

                const handleDoorClick = () => {
                  if (step === 'pick') {
                    handleSelectDoor(doorIndex);
                  } else if (step === 'revealed') {
                    if (isSelected) {
                      handleFinalDecision(false);
                    } else if (!isRevealedGoat) {
                      handleFinalDecision(true);
                    }
                  }
                };

                return (
                  <div
                    key={doorIndex}
                    onClick={handleDoorClick}
                    className={`group relative flex flex-col items-center justify-between p-6 rounded-2xl border transition-all duration-200 min-h-[240px] sm:min-h-[250px] ${borderColor} ${bgColor} ${glowEffect} ${
                      step === 'pick' || (step === 'revealed' && !isRevealedGoat)
                        ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:bg-white'
                        : ''
                    }`}
                  >
                    <div className="w-full flex items-center justify-between gap-2 pb-3 border-b border-slate-200/50">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-200/70 text-slate-700">
                        {isEn ? 'DOOR' : 'CỬA'} #{doorIndex + 1}
                      </span>

                      {isSelected && step !== 'result' && (
                        <Badge variant="cyan" className="text-xs">
                          {isEn ? 'INITIAL CHOICE' : 'LỰA CHỌN BAN ĐẦU'}
                        </Badge>
                      )}

                      {isRevealedGoat && (
                        <Badge variant="amber" className="text-xs">
                          {isEn ? 'HOST OPENED (GOAT)' : 'MC ĐÃ MỞ (DÊ)'}
                        </Badge>
                      )}

                      {step === 'revealed' && !isSelected && !isRevealedGoat && (
                        <Badge variant="violet" className="text-xs font-bold">
                          {isEn ? 'AVAILABLE TO SWITCH' : 'CỬA CÓ THỂ ĐỔI'}
                        </Badge>
                      )}

                      {step === 'result' && hasCar && (
                        <Badge variant="emerald" className="text-xs font-bold">
                          {isEn ? 'WON CAR 🏎️' : 'TRÚNG Ô TÔ 🏎️'}
                        </Badge>
                      )}

                      {step === 'result' && !hasCar && isFinalChoice && (
                        <Badge variant="destructive" className="text-xs">
                          {isEn ? 'GOT GOAT 🐐' : 'VÀO DÊ 🐐'}
                        </Badge>
                      )}
                    </div>

                    <div className="my-auto flex flex-col items-center text-center py-4 space-y-3">
                      {step === 'result' ? (
                        hasCar ? (
                          <div className="space-y-1.5 animate-in zoom-in-75">
                            <div className="text-5xl filter drop-shadow-md">🏎️</div>
                            <div className="font-heading font-extrabold text-xs text-emerald-700 uppercase tracking-wider">
                              {isEn ? 'Sports Car' : 'Ô Tô Thể Thao'}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 animate-in zoom-in-75">
                            <div className="text-5xl">🐐</div>
                            <div className="font-heading font-medium text-xs text-slate-500 uppercase tracking-wider">
                              {isEn ? 'Goat' : 'Dê Cỏ'}
                            </div>
                          </div>
                        )
                      ) : isRevealedGoat ? (
                        <div className="space-y-1.5 animate-in fade-in">
                          <div className="text-5xl">🐐</div>
                          <div className="font-heading font-semibold text-xs text-amber-700 uppercase tracking-wider">
                            {isEn ? 'Behind is a Goat!' : 'Đằng sau là Dê!'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2.5">
                          <div className="w-12 h-12 rounded-full bg-slate-200/70 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                            <Lock className="h-5 w-5" />
                          </div>
                          <span className="font-mono text-3xl font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                            0{doorIndex + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hành động duy nhất ở đáy cửa */}
                    <div className="w-full pt-3">
                      {step === 'pick' && (
                        <div className="w-full text-center py-1">
                          <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-700 transition-colors">
                            {isEn ? 'Click to select door' : 'Nhấp để chọn cửa'}
                          </span>
                        </div>
                      )}

                      {step === 'revealed' &&
                        !isRevealedGoat &&
                        (isSelected ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={e => {
                              e.stopPropagation();
                              handleFinalDecision(false);
                            }}
                            className="w-full text-xs font-bold border border-blue-200 hover:bg-blue-100 text-blue-900 h-9"
                          >
                            {isEn
                              ? `Stay with door #${doorIndex + 1} (33.3%)`
                              : `Giữ cửa #${doorIndex + 1} (33.3%)`}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={e => {
                              e.stopPropagation();
                              handleFinalDecision(true);
                            }}
                            className="w-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm bg-violet-600 hover:bg-violet-700 text-white h-9"
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            {isEn
                              ? `Switch to door #${doorIndex + 1} (66.7%)`
                              : `Đổi sang cửa #${doorIndex + 1} (66.7%)`}
                          </Button>
                        ))}

                      {step === 'result' && (
                        <div className="w-full text-center py-1">
                          <span className="text-xs font-mono text-slate-500">
                            {hasCar
                              ? isEn
                                ? 'Grand Prize'
                                : 'Phần thưởng lớn nhất'
                              : isEn
                                ? 'No prize'
                                : 'Không có phần thưởng'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mô Phỏng Monte Carlo & So Sánh Phân Bổ */}
            <div className="pt-7 border-t border-slate-200/80 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    {isEn
                      ? 'Monte Carlo Batch Simulation & Empirical Verification'
                      : 'Mô Phỏng Hàng Loạt Monte Carlo & Kiểm Chứng Định Lý Xác Suất'}
                  </h4>
                  <p className="text-xs text-slate-500 font-sans">
                    {isEn
                      ? 'Simulate massive trial volumes to verify probabilistic convergence toward 66.7% and 33.3%.'
                      : 'Chạy ngẫu nhiên số lượng lớn ván chơi để kiểm chứng quy luật xác suất hội tụ về 66.7% và 33.3%'}
                  </p>
                </div>

                {/* Nút chạy mô phỏng hàng loạt */}
                <div className="flex flex-wrap items-center gap-2">
                  {isSimulatingBatch ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={abortWorkerMontyHall}
                      className="h-8 text-xs font-semibold border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 shadow-2xs active:scale-[0.98]"
                    >
                      <Square className="h-3.5 w-3.5 mr-1.5 fill-current text-red-600" />
                      {isEn ? 'Stop / Cancel' : 'Hủy / Dừng lại'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSimulateBatch(1000)}
                        className="h-8 text-xs font-semibold border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-2xs active:scale-[0.98]"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" />
                        +1,000 {isEn ? 'Games' : 'Ván'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSimulateBatch(10000)}
                        className="h-8 text-xs font-semibold border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 shadow-2xs active:scale-[0.98]"
                      >
                        <Flame className="h-3.5 w-3.5 mr-1 text-amber-600" />
                        +10,000 {isEn ? 'Games' : 'Ván'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSimulateBatch(50000)}
                        className="h-8 text-xs font-semibold border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-[0.98]"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1 text-violet-600" />
                        +50,000 {isEn ? 'Games' : 'Ván'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSimulateBatch(100000)}
                        className="h-8 text-xs font-semibold border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-2xs active:scale-[0.98]"
                      >
                        <Play className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                        +100,000 {isEn ? 'Games' : 'Ván'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSimulateBatch(200000)}
                        className="h-8 text-xs font-semibold border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 shadow-2xs active:scale-[0.98]"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-600" />
                        +200,000 {isEn ? 'Games' : 'Ván'}
                      </Button>
                    </>
                  )}
                  {totalGames > 0 && !isSimulatingBatch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetStats}
                      className="h-8 text-xs text-slate-500 hover:text-slate-900 px-2 font-mono"
                    >
                      {isEn ? 'Reset' : 'Đặt lại'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Lab Progress Bar */}
              {isSimulatingBatch && (
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Activity className="h-4 w-4 animate-pulse text-blue-600" />
                      <span>
                        {isEn ? 'Monte Carlo batch progress:' : 'Tiến độ mô phỏng Monte Carlo:'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs tabular-nums text-slate-700">
                      <span className="font-bold text-blue-700">{workerProgress}%</span>
                      <span>•</span>
                      <span>
                        {(workerPartial?.completedTrials ?? 0).toLocaleString(
                          isEn ? 'en-US' : 'vi-VN',
                        )}{' '}
                        / {targetBatchCount.toLocaleString(isEn ? 'en-US' : 'vi-VN')}{' '}
                        {isEn ? 'games' : 'ván'}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-150 ease-out"
                      style={{ width: `${workerProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Thanh Phổ Đối Sánh Phân Bổ */}
              <div className="rounded-xl bg-slate-100/70 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="font-bold text-blue-900">
                      {isEn ? 'Switch Strategy:' : 'Chiến lược Đổi Cửa:'}
                    </span>
                    <span className="font-mono font-bold text-blue-700 tabular-nums">
                      {switchRate !== null
                        ? `${switchRate}%`
                        : isEn
                          ? 'No data'
                          : 'Chưa có dữ liệu'}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {isEn ? '(Theoretical: 66.7%)' : '(Mục tiêu lý thuyết: 66.7%)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-600 shrink-0" />
                    <span className="font-bold text-violet-900">
                      {isEn ? 'Stay Strategy:' : 'Chiến lược Giữ Nguyên:'}
                    </span>
                    <span className="font-mono font-bold text-violet-700 tabular-nums">
                      {stayRate !== null ? `${stayRate}%` : isEn ? 'No data' : 'Chưa có dữ liệu'}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {isEn ? '(Theoretical: 33.3%)' : '(Mục tiêu lý thuyết: 33.3%)'}
                    </span>
                  </div>
                </div>

                {/* Progress bar so sánh trực quan */}
                <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden relative flex">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${switchRate ?? 0}%` }}
                    title={`${isEn ? 'Switch' : 'Đổi cửa'}: ${switchRate ?? 0}%`}
                  />
                  <div
                    className="bg-violet-600 h-full transition-all duration-300 ml-auto"
                    style={{ width: `${stayRate ?? 0}%` }}
                    title={`${isEn ? 'Stay' : 'Giữ cửa'}: ${stayRate ?? 0}%`}
                  />
                  {/* Vạch mốc lý thuyết 66.7% cho Đổi */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-950 z-10"
                    style={{ left: '66.7%' }}
                    title={isEn ? 'Theoretical Switch: 66.7%' : 'Mốc lý thuyết Đổi Cửa: 66.7%'}
                  />
                  {/* Vạch mốc lý thuyết 33.3% */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-violet-950 z-10"
                    style={{ left: '33.3%' }}
                    title={isEn ? 'Theoretical Stay: 33.3%' : 'Mốc lý thuyết Giữ Nguyên: 33.3%'}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-sans pt-1">
                  <span>0%</span>
                  <span className="italic">
                    {isEn
                      ? 'Theoretical targets: 33.3% (Stay) and 66.7% (Switch)'
                      : 'Đường mốc lý thuyết: 33.3% (Giữ nguyên) và 66.7% (Đổi cửa)'}
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. TITLE NHẬT KÝ & NHẬT KÝ THỰC NGHIỆM */}
      {showHistory && (
        <SimulationSection
          dotColor="emerald"
          title={isEn ? 'Experimental Log' : 'Nhật Ký Thực Nghiệm'}
          subtitle={
            isEn
              ? 'Detailed trial history and experiment logs recorded during this session'
              : 'Bảng lưu trữ chi tiết các lượt chơi và kết quả thực nghiệm trong phiên nghiên cứu'
          }
        >
          <SimulationHistoryTable runs={history} />
        </SimulationSection>
      )}

      {/* 4. TITLE GIẢI THÍCH & GIẢI THÍCH KHOA HỌC */}
      <SimulationSection
        dotColor="blue"
        title={
          isEn
            ? 'Scientific Explanation & Mathematical Foundation'
            : 'Giải Thích Khoa Học & Bản Chất Toán Học'
        }
        subtitle={
          isEn
            ? 'Deconstructing conditional probability and probability concentration on the unopened door'
            : 'Bóc tách nghịch lý xác suất điều kiện và hiệu ứng dồn xác suất về cánh cửa còn lại'
        }
      >
        <SimulationExplainerCard>
          <div className="space-y-6">
            <div className="space-y-1 border-b border-slate-200/80 pb-4">
              <h3 className="font-heading text-base font-bold text-slate-900">
                {isEn
                  ? 'Why Does Naive Intuition Mistakenly Assume 50/50?'
                  : 'Tại sao Trực giác thường ngộ nhận cơ hội là 50/50?'}
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {isEn
                  ? 'With only 2 unopened doors remaining, the brain automatically presumes symmetric 50/50 odds. However, the host door opening action contains asymmetric deliberate information.'
                  : 'Khi chỉ còn lại 2 cánh cửa đóng kín, não bộ tự động giả định tính đối xứng ngẫu nhiên giữa 2 lựa chọn. Tuy nhiên, thông tin mở cửa của người dẫn chương trình hoàn toàn không mang tính ngẫu nhiên.'}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Cột 1: Trực giác ngộ nhận */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {isEn ? 'Naive Intuition (Fallacy)' : 'Trực giác Tự nhiên (Ngộ nhận)'}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 font-semibold">
                    {isEn ? 'Assumed 2 symmetric doors' : 'Giả định 2 cửa đối xứng'}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  {isEn
                    ? 'After 1 goat door is eliminated, naive intuition considers the remaining closed door and your held door equally likely, triggering the illusion that each has a 50% probability.'
                    : 'Sau khi 1 cửa có dê bị loại bỏ, trực giác cho rằng cánh cửa bạn đang giữ và cánh cửa còn lại có vai trò ngang nhau, dẫn tới ảo tưởng xác suất mỗi bên là 50%.'}
                </p>

                <SimulationFormulaBox
                  title={
                    isEn ? 'Common intuitive misconception:' : 'Ngộ nhận trực giác thông thường:'
                  }
                >
                  <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
                    <span className="font-bold">{isEn ? 'P(Switch)' : 'P(Đổi)'}</span>
                    <span>=</span>
                    <span className="font-bold">{isEn ? 'P(Stay)' : 'P(Giữ)'}</span>
                    <span>=</span>
                    <MathFraction numerator="1" denominator="2" />
                    <span>= 50.0%</span>
                  </div>
                </SimulationFormulaBox>

                <p className="text-xs text-slate-500 italic">
                  {isEn
                    ? 'The flaw: You picked your initial door when there were 3 candidates (1/3), not after the goat door was revealed.'
                    : 'Sai lầm ở chỗ: Bạn đã chọn cửa từ lúc có 3 cánh cửa (1/3), chứ không phải lúc chỉ còn 2 cánh cửa.'}
                </p>
              </div>

              {/* Cột 2: Bản chất toán học khách quan */}
              <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
                    {isEn ? 'Objective Mathematical Truth' : 'Bản chất Toán học Khách quan'}
                  </span>
                  <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
                    {isEn ? 'Bayes Theorem (2/3)' : 'Định lý Bayes (2/3)'}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  {isEn ? (
                    <>
                      At your initial pick, the probability of selecting the car was only{' '}
                      <span className="font-mono font-bold text-blue-900">
                        <MathFraction numerator="1" denominator="3" className="text-xs" />
                      </span>
                      , which means there was a{' '}
                      <span className="font-mono font-bold text-blue-900">
                        <MathFraction numerator="2" denominator="3" className="text-xs" />
                      </span>{' '}
                      chance the car was in the other two doors. Because the host always eliminates
                      a goat, that entire 2/3 probability shifts onto the single remaining door.
                    </>
                  ) : (
                    <>
                      Tại thời điểm chọn đầu tiên, xác suất chọn trúng ô tô chỉ là{' '}
                      <span className="font-mono font-bold text-blue-900">
                        <MathFraction numerator="1" denominator="3" className="text-xs" />
                      </span>
                      , nghĩa là{' '}
                      <span className="font-mono font-bold text-blue-900">
                        <MathFraction numerator="2" denominator="3" className="text-xs" />
                      </span>{' '}
                      xe nằm ở 2 cánh cửa còn lại. Vì MC luôn mở cửa có Dê, toàn bộ 2/3 xác suất dồn
                      vào cánh cửa chưa mở.
                    </>
                  )}
                </p>

                <SimulationFormulaBox
                  title={
                    isEn
                      ? 'Conditional Probability & Bayes Theorem:'
                      : 'Xác suất điều kiện & Định lý Bayes:'
                  }
                >
                  <div className="space-y-2 text-xs text-slate-900">
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                      <span className="font-bold text-blue-900">
                        {isEn ? 'P(Win | Switch)' : 'P(Thắng | Đổi)'}
                      </span>
                      <span>=</span>
                      <span>1 &minus;</span>
                      <MathFraction numerator="1" denominator="3" />
                      <span>=</span>
                      <MathFraction
                        numerator="2"
                        denominator="3"
                        className="font-bold text-blue-700 text-sm"
                      />
                      <span className="text-slate-400">&asymp;</span>
                      <span className="font-bold text-blue-700">66.7%</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 text-slate-600">
                      <span>{isEn ? 'P(Win | Stay)' : 'P(Thắng | Giữ)'}</span>
                      <span>=</span>
                      <MathFraction numerator="1" denominator="3" />
                      <span className="text-slate-400">&asymp;</span>
                      <span>33.3%</span>
                    </div>
                  </div>
                </SimulationFormulaBox>

                <p className="text-xs text-slate-600">
                  {isEn
                    ? 'Consequently, switching doors doubles your chances of winning from 33.3% to 66.7%!'
                    : 'Do đó, đổi cửa nhân đôi cơ hội chiến thắng của bạn từ 33.3% lên 66.7%!'}
                </p>
              </div>
            </div>
          </div>
        </SimulationExplainerCard>
      </SimulationSection>
    </div>
  );
}
