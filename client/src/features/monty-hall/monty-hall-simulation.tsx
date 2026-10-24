'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Play,
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
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import {
  SimulationSection,
  SimulationWorkbenchCard,
  SimulationExplainerCard,
  SimulationFormulaBox,
  SimulationHistoryTable,
  IntuitionChallengeCard,
} from '@/features/simulations/components';
import { getSimulationBySlug } from '@/features/simulations/registry';
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

export function MontyHallSimulation() {
  const meta = getSimulationBySlug('monty-hall');
  const [userPrediction, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);
  const [isChallengeResolved, setIsChallengeResolved] = React.useState<boolean>(false);
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
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('wonderlab_guess_monty-hall');
      if (saved) setIsChallengeResolved(true);
    } catch {
      // Ignore storage errors
    }
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

  // Mô phỏng hàng loạt Monte Carlo để kiểm chứng Luật Số Lớn
  const handleSimulateBatch = (batchCount: number) => {
    const startTime = performance.now();
    let newSwitchPlays = 0;
    let newSwitchWins = 0;
    let newStayPlays = 0;
    let newStayWins = 0;

    for (let i = 0; i < batchCount; i++) {
      const simCar = Math.floor(Math.random() * 3);
      const simPick = Math.floor(Math.random() * 3);
      const simSwitch = Math.random() < 0.5;

      const simPossibleGoats = [0, 1, 2].filter(d => d !== simPick && d !== simCar);
      const simHost = simPossibleGoats[Math.floor(Math.random() * simPossibleGoats.length)] ?? 0;
      const simOther = [0, 1, 2].find(d => d !== simPick && d !== simHost)!;

      const simFinal = simSwitch ? simOther : simPick;
      const won = simFinal === simCar;

      if (simSwitch) {
        newSwitchPlays++;
        if (won) newSwitchWins++;
      } else {
        newStayPlays++;
        if (won) newStayWins++;
      }
    }

    const duration = Math.round(performance.now() - startTime);

    setStats(prev => ({
      switchPlays: prev.switchPlays + newSwitchPlays,
      switchWins: prev.switchWins + newSwitchWins,
      stayPlays: prev.stayPlays + newStayPlays,
      stayWins: prev.stayWins + newStayWins,
    }));

    const switchWinRate = newSwitchPlays > 0 ? newSwitchWins / newSwitchPlays : 0;
    recordRun(
      {
        doorsCount: 3,
        strategy: 'monte-carlo-mix',
        userPrediction: userPrediction?.option.value,
      },
      {
        switchPlays: newSwitchPlays,
        switchWins: newSwitchWins,
        stayPlays: newStayPlays,
        stayWins: newStayWins,
        empiricalProbability: switchWinRate,
        theoreticalProbability: 2 / 3,
        intuitionGap: userPrediction?.gap,
      },
      batchCount,
      duration,
    );
  };

  const resetStats = () => {
    setStats({
      switchPlays: 0,
      switchWins: 0,
      stayPlays: 0,
      stayWins: 0,
    });
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
    <div className="flex flex-col gap-8">
      {/* Line phân cách sau intro/formula */}
      <hr className="border-slate-200/80 -mt-2" />

      {/* 1. TITLE CÂU HỎI & CÂU HỎI TRỰC GIÁC */}
      <SimulationSection
        dotColor="amber"
        title="Khảo Sát Trực Giác Trước Thực Nghiệm"
        subtitle="Đưa ra dự đoán cá nhân để đo lường khoảng cách giữa trực giác thông thường và toán học xác suất"
      >
        {meta?.hypothesis && (
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug="monty-hall"
            onPredictionSelected={(option, gap) => setUserPrediction({ option, gap })}
            onStatusChange={resolved => setIsChallengeResolved(resolved)}
          />
        )}
      </SimulationSection>

      {/* 2. TITLE CHỖ THÍ NGHIỆM & BLOCK THÍ NGHIỆM HỢP NHẤT */}
      <SimulationSection
        dotColor="blue"
        title="Buồng Thí Nghiệm & Mô Phỏng Trực Quan"
        subtitle="Không gian tương tác 3 cánh cửa Monty Hall, thử nghiệm chiến lược Đổi vs Giữ và mô phỏng Monte Carlo"
      >
        <SimulationWorkbenchCard
          metricsBar={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pb-5 border-b border-slate-200/80">
              <div className="space-y-1">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Tổng ván đã chơi
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {totalGames}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {stats.switchPlays} đổi / {stats.stayPlays} giữ
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
                  <span>Chiến lược Đổi Cửa</span>
                  <span className="font-mono text-xs text-blue-700">Lý thuyết 66.7%</span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
                  {switchRate !== null ? `${switchRate}%` : '—'}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {stats.switchWins} thắng / {stats.switchPlays} lượt
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex items-center justify-between">
                  <span>Chiến lược Giữ Cửa</span>
                  <span className="font-mono text-xs text-violet-700">Lý thuyết 33.3%</span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-violet-700 tabular-nums">
                  {stayRate !== null ? `${stayRate}%` : '—'}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {stats.stayWins} thắng / {stats.stayPlays} lượt
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Trạng thái hiện tại
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold pt-0.5 text-slate-900">
                  {step === 'pick' && 'Bước 1: Chọn cửa'}
                  {step === 'revealed' && 'Bước 2: Đổi hay Giữ?'}
                  {step === 'result' && (finalDoor === carDoor ? '🎉 Thắng Xe' : '🐐 Vào Dê')}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {step === 'result'
                    ? didSwitch
                      ? 'Đã đổi cửa'
                      : 'Đã giữ nguyên'
                    : 'Đang trong lượt chơi'}
                </div>
              </div>
            </div>
          }
          tools={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSimulateBatch(50)}
                className="h-7 text-xs font-semibold border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                +50 Ván
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSimulateBatch(500)}
                className="hidden sm:inline-flex h-7 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Flame className="h-3.5 w-3.5 mr-1 text-amber-600" />
                +500 Ván
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={startNewRound}
                className="h-7 text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Vòng mới
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title="Tải tệp bảng tính CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                Xuất CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title="Tải tệp JSON dữ liệu"
              >
                <FileJson className="h-3.5 w-3.5 text-blue-600" />
                Xuất JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title="Sao chép báo cáo Markdown"
              >
                {copiedType === 'report' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    Chép Báo cáo
                  </>
                )}
              </Button>
              {totalGames > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetStats}
                  className="h-7 text-xs text-slate-500 hover:text-slate-900 px-2"
                >
                  Đặt lại ván
                </Button>
              )}
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
                    {globalStats.totalTrials.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-slate-400">ván</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-600">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-bold text-slate-800 tabular-nums">
                    {globalStats.totalRuns.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-slate-400">lượt</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                <span>Sẵn sàng thu thập telemetry</span>
              </div>
            )
          }
        >
          {/* Hướng dẫn theo từng bước */}
          <div className="rounded-xl bg-slate-100/80 px-4 py-3.5 border-l-4 border-blue-600 flex items-center justify-between">
            <div className="text-sm font-medium">
              {step === 'pick' && (
                <span className="text-slate-800 flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <strong className="text-blue-700">Bước 1:</strong> Nhấp vào bất kỳ cánh cửa nào
                  bên dưới để đưa ra lựa chọn đầu tiên.
                </span>
              )}
              {step === 'revealed' && (
                <span className="text-slate-800 flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <strong className="text-amber-700">Bước 2:</strong> MC đã mở Cửa #
                  {Number(revealedGoatDoor ?? 0) + 1} (chứa Dê). Bạn muốn Giữ nguyên hay Đổi sang
                  Cửa #{Number(remainingSwitchDoor ?? 0) + 1}?
                </span>
              )}
              {step === 'result' && (
                <span className="flex items-center gap-2">
                  {finalDoor === carDoor ? (
                    <span className="text-emerald-800 flex items-center gap-2 font-bold text-base">
                      <Trophy className="h-5 w-5 text-emerald-600" />
                      Chiến thắng rực rỡ! Bạn đã nhận Ô tô thể thao với{' '}
                      <span className="underline decoration-emerald-500">
                        {didSwitch ? 'Chiến lược ĐỔI CỬA' : 'Chiến lược GIỮ NGUYÊN'}
                      </span>
                      !
                    </span>
                  ) : (
                    <span className="text-slate-700 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Rất tiếc! Đằng sau là chú Dê cỏ (
                      {didSwitch ? 'Chiến lược ĐỔI' : 'Chiến lược GIỮ'}).
                    </span>
                  )}
                </span>
              )}
            </div>

            {step === 'result' && (
              <Button
                size="sm"
                onClick={startNewRound}
                className="text-xs font-bold shrink-0 ml-4 shadow-xs"
              >
                Chơi ván mới
              </Button>
            )}
          </div>

          {/* 3 Cánh cửa Vault */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[0, 1, 2].map(doorIndex => {
              const isSelected = selectedDoor === doorIndex;
              const isRevealedGoat = revealedGoatDoor === doorIndex;
              const isFinalChoice = finalDoor === doorIndex;
              const hasCar = carDoor === doorIndex;

              let borderColor = 'border-slate-300/90 hover:border-blue-500';
              let bgColor = 'bg-slate-100/70';
              let glowEffect = '';

              if (step === 'revealed') {
                if (isSelected) {
                  borderColor = 'border-blue-600 ring-2 ring-blue-500/20';
                  bgColor = 'bg-blue-50/70';
                  glowEffect = 'shadow-md shadow-blue-500/10';
                } else if (isRevealedGoat) {
                  borderColor = 'border-amber-400';
                  bgColor = 'bg-amber-50/60';
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
                  borderColor = 'border-red-400';
                  bgColor = 'bg-red-50/50';
                }
              }

              return (
                <div
                  key={doorIndex}
                  onClick={() => step === 'pick' && handleSelectDoor(doorIndex)}
                  className={`group relative flex flex-col items-center justify-between p-6 rounded-2xl border transition-all duration-200 min-h-[250px] ${borderColor} ${bgColor} ${glowEffect} ${
                    step === 'pick'
                      ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:bg-white'
                      : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                      CỬA #{doorIndex + 1}
                    </span>

                    {isSelected && step !== 'result' && (
                      <Badge variant="cyan" className="text-xs">
                        LỰA CHỌN CỦA BẠN
                      </Badge>
                    )}

                    {isRevealedGoat && (
                      <Badge variant="amber" className="text-xs">
                        MC ĐÃ MỞ (DÊ)
                      </Badge>
                    )}

                    {step === 'result' && hasCar && (
                      <Badge variant="emerald" className="text-xs font-bold">
                        TRÚNG Ô TÔ 🏎️
                      </Badge>
                    )}
                  </div>

                  <div className="my-6 flex flex-col items-center text-center">
                    {step === 'result' ? (
                      hasCar ? (
                        <div className="space-y-2 animate-in zoom-in-75">
                          <div className="text-5xl filter drop-shadow-md">🏎️</div>
                          <div className="font-heading font-extrabold text-sm text-emerald-700 uppercase tracking-wider">
                            Ô Tô Thể Thao
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 animate-in zoom-in-75">
                          <div className="text-5xl">🐐</div>
                          <div className="font-heading font-medium text-xs text-slate-500 uppercase tracking-wider">
                            Dê Cỏ
                          </div>
                        </div>
                      )
                    ) : isRevealedGoat ? (
                      <div className="space-y-2 animate-in fade-in">
                        <div className="text-5xl">🐐</div>
                        <div className="font-heading font-semibold text-xs text-amber-700 uppercase tracking-wider">
                          Đằng sau là Dê!
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
                        <span className="text-xs font-mono text-slate-500 group-hover:text-blue-600 transition-colors">
                          {step === 'pick' ? 'Nhấp để chọn' : 'Cửa đang đóng'}
                        </span>
                      </div>
                    )}
                  </div>

                  {step === 'revealed' && !isRevealedGoat && (
                    <div className="w-full mt-2">
                      {isSelected ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleFinalDecision(false)}
                          className="w-full text-xs font-bold"
                        >
                          Giữ cửa #{doorIndex + 1} {isChallengeResolved ? '(33.3%)' : ''}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleFinalDecision(true)}
                          className="w-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          Đổi sang cửa #{doorIndex + 1} {isChallengeResolved ? '(66.7%)' : ''}
                        </Button>
                      )}
                    </div>
                  )}

                  {step === 'pick' && (
                    <div className="w-full text-center">
                      <span className="text-xs font-mono text-slate-500 group-hover:text-blue-700 transition-colors">
                        {isChallengeResolved
                          ? 'Xác suất ban đầu: 1/3 (33.3%)'
                          : 'Nhấp vào cánh cửa để chọn'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Banner ra quyết định */}
          {step === 'revealed' && remainingSwitchDoor !== null && selectedDoor !== null && (
            <div className="rounded-xl bg-blue-50/80 border-l-4 border-blue-600 px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Khoảnh khắc quyết định: Bạn sẽ Đổi hay Giữ?
                </div>
                <p className="text-xs text-slate-600 font-sans">
                  {isChallengeResolved
                    ? 'Toán học chứng minh: Đổi cửa giúp xác suất thắng tăng từ 1/3 lên 2/3!'
                    : 'Hãy quyết định dựa trên trực giác của bạn: Liệu việc đổi cửa có tạo ra khác biệt?'}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFinalDecision(false)}
                  className="flex-1 sm:flex-initial text-xs font-semibold bg-white/90 hover:bg-white text-slate-700"
                >
                  Giữ Cửa #{selectedDoor + 1} {isChallengeResolved ? '(33%)' : ''}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleFinalDecision(true)}
                  className="flex-1 sm:flex-initial text-xs font-bold shadow-xs"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                  Đổi Cửa #{Number(remainingSwitchDoor ?? 0) + 1}{' '}
                  {isChallengeResolved ? '(67%)' : ''}
                </Button>
              </div>
            </div>
          )}

          {/* 2 Card thống kê tiến trình thực nghiệm Đổi vs Giữ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 rounded-xl border-l-4 border-l-blue-600 bg-blue-50/30">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-blue-700 uppercase tracking-wide flex items-center gap-1.5 font-bold">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Chiến lược ĐỔI CỬA (Switch)
                </span>
                <span className="font-mono text-xs font-bold">
                  {isChallengeResolved ? (
                    <span className="text-blue-700">Lý thuyết: 66.7%</span>
                  ) : (
                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Lý thuyết: ??.?%
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-mono font-black text-slate-900 tabular-nums">
                    {switchRate !== null ? `${switchRate}%` : '—'}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">tỷ lệ thắng thực nghiệm</span>
                </div>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {stats.switchWins} thắng / {stats.switchPlays} lượt
                </span>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${switchRate ?? 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span>0%</span>
                  <span className="text-blue-700 font-semibold">
                    {isChallengeResolved ? 'Kỳ vọng lý thuyết: 66.7%' : 'Kỳ vọng: [Đang khóa]'}
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl border-l-4 border-l-violet-600 bg-violet-50/30">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-violet-700 uppercase tracking-wide flex items-center gap-1.5 font-bold">
                  <span className="h-2 w-2 rounded-full bg-violet-600" />
                  Chiến lược GIỮ NGUYÊN (Stay)
                </span>
                <span className="font-mono text-xs font-bold">
                  {isChallengeResolved ? (
                    <span className="text-violet-700">Lý thuyết: 33.3%</span>
                  ) : (
                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Lý thuyết: ??.?%
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-mono font-black text-slate-900 tabular-nums">
                    {stayRate !== null ? `${stayRate}%` : '—'}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">tỷ lệ thắng thực nghiệm</span>
                </div>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {stats.stayWins} thắng / {stats.stayPlays} lượt
                </span>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-violet-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${stayRate ?? 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span>0%</span>
                  <span className="text-violet-700 font-semibold">
                    {isChallengeResolved ? 'Kỳ vọng lý thuyết: 33.3%' : 'Kỳ vọng: [Đang khóa]'}
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. TITLE NHẬT KÝ & NHẬT KÝ THỰC NGHIỆM */}
      <SimulationSection
        dotColor="emerald"
        title="Nhật Ký Thực Nghiệm"
        subtitle="Bảng lưu trữ chi tiết các lượt chơi và kết quả thực nghiệm trong phiên nghiên cứu"
      >
        <SimulationHistoryTable runs={history} />
      </SimulationSection>

      {/* 4. TITLE GIẢI THÍCH & GIẢI THÍCH KHOA HỌC */}
      <SimulationSection
        dotColor="blue"
        title="Giải Thích Khoa Học & Bản Chất Toán Học"
        subtitle="Bóc tách nghịch lý xác suất điều kiện và hiệu ứng dồn xác suất về cánh cửa còn lại"
      >
        <SimulationExplainerCard>
          <div className="space-y-6">
            <div className="space-y-1 border-b border-slate-200/80 pb-4">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Tại sao trực giác thường ngộ nhận cơ hội là 50/50?
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                Khi chỉ còn lại 2 cánh cửa đóng kín, não bộ tự động giả định tính đối xứng ngẫu
                nhiên giữa 2 lựa chọn. Tuy nhiên, thông tin mở cửa của người dẫn chương trình hoàn
                toàn không mang tính ngẫu nhiên.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Cột 1: Trực giác ngộ nhận */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Trực giác Tự nhiên (Ngộ nhận)
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 font-semibold">
                    Giả định 2 cửa
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  Sau khi 1 cửa có dê bị loại bỏ, trực giác cho rằng cánh cửa bạn đang giữ và cánh
                  cửa còn lại có vai trò ngang nhau, dẫn tới xác suất giả định mỗi bên là 50%.
                </p>

                <SimulationFormulaBox title="Ngộ nhận trực giác thông thường:">
                  <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
                    <span className="font-bold">P(Đổi)</span>
                    <span>=</span>
                    <span className="font-bold">P(Giữ)</span>
                    <span>=</span>
                    <span>1/2 = 50.0%</span>
                  </div>
                </SimulationFormulaBox>

                <p className="text-xs text-slate-500 italic">
                  Sai lầm ở chỗ: Bạn đã chọn cửa từ lúc có 3 cánh cửa (1/3), chứ không phải lúc chỉ
                  còn 2 cánh cửa.
                </p>
              </div>

              {/* Cột 2: Bản chất toán học khách quan */}
              <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
                    Bản chất Toán học Khách quan
                  </span>
                  <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
                    Định lý Bayes (2/3)
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  Tại thời điểm chọn đầu tiên, xác suất chọn trúng ô tô là{' '}
                  <span className="font-mono font-bold text-blue-900">1/3</span>, nghĩa là{' '}
                  <span className="font-mono font-bold text-blue-900">2/3</span> xe nằm ở 2 cánh cửa
                  còn lại. Vì MC luôn luôn mở cửa có Dê, toàn bộ 2/3 xác suất dồn vào cánh cửa còn
                  lại chưa mở.
                </p>

                <SimulationFormulaBox title="Xác suất điều kiện & Chiến lược tối ưu:">
                  <div className="space-y-1.5 text-xs text-slate-900">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-bold text-blue-900">P(Thắng | Đổi)</span>
                      <span>=</span>
                      <span>P(Chọn ban đầu là Dê)</span>
                      <span>=</span>
                      <span className="font-bold text-blue-700 text-sm">2/3 ≈ 66.7%</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 text-slate-600">
                      <span>P(Thắng | Giữ)</span>
                      <span>=</span>
                      <span>P(Chọn ban đầu là Xe)</span>
                      <span>=</span>
                      <span className="font-bold">1/3 ≈ 33.3%</span>
                    </div>
                  </div>
                </SimulationFormulaBox>

                <p className="text-xs text-slate-600">
                  Do đó, đổi cửa nhân đôi cơ hội chiến thắng của bạn từ 33.3% lên 66.7%!
                </p>
              </div>
            </div>
          </div>
        </SimulationExplainerCard>
      </SimulationSection>
    </div>
  );
}
