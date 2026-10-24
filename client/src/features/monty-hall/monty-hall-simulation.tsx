'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  RotateCcw,
  Play,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  Lock,
  ArrowRightLeft,
  Flame,
  Info,
} from 'lucide-react';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { ExportSuitePanel } from '@/features/simulations/components/export-suite-panel';
import { SimulationHistoryTable } from '@/features/simulations/components/simulation-history-table';
import { GlobalTelemetryWidget } from '@/features/simulations/components/global-telemetry-widget';
import { IntuitionChallengeCard } from '@/features/simulations/components/intuition-challenge-card';
import { getSimulationBySlug } from '@/features/simulations/registry';
import { HypothesisOption } from '@/features/simulations/types';

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

  // Initialize a new game round
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

  // Step 1: User picks a door
  const handleSelectDoor = (doorIndex: number) => {
    if (step !== 'pick') return;

    setSelectedDoor(doorIndex);

    // Host opens a door that has a goat and is NOT the user's selected door
    const possibleGoatDoors = [0, 1, 2].filter(d => d !== doorIndex && d !== carDoor);
    const hostChoice =
      possibleGoatDoors[Math.floor(Math.random() * possibleGoatDoors.length)] ??
      [0, 1, 2].find(d => d !== doorIndex) ??
      0;

    setRevealedGoatDoor(hostChoice);
    setStep('revealed');
  };

  // Step 2: User decides to Stay or Switch
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

  // Batch simulation for empirical Law of Large Numbers
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

    // Record simulation run in background telemetry
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

  return (
    <div className="space-y-6">
      {/* Global Telemetry Banner */}
      <GlobalTelemetryWidget stats={globalStats} className="w-full justify-between" />

      {/* Thử thách dự đoán trực giác */}
      {meta?.hypothesis && (
        <IntuitionChallengeCard
          challenge={meta.hypothesis}
          simulationSlug="monty-hall"
          onPredictionSelected={(option, gap) => setUserPrediction({ option, gap })}
          onStatusChange={resolved => setIsChallengeResolved(resolved)}
        />
      )}

      <Card className="border-slate-300/85 bg-white shadow-md shadow-slate-300/30">
        <CardHeader className="border-b border-slate-200/80 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="cyan">THÍ NGHIỆM TƯƠNG TÁC SỐ 01</Badge>
                <Badge variant="outline">Xác suất & Nghịch lý</Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                Nghịch lý Monty Hall: Bạn có nên đổi cửa?
              </CardTitle>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSimulateBatch(50)}
                className="text-xs font-semibold border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                +50 Ván
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSimulateBatch(500)}
                className="hidden sm:inline-flex text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Flame className="h-3.5 w-3.5 mr-1 text-amber-600" />
                +500 Ván
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={startNewRound}
                className="text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Vòng mới
              </Button>
            </div>
          </div>

          <CardDescription className="text-slate-600 text-sm pt-2 max-w-4xl font-sans">
            Đằng sau 3 cánh cửa chỉ có 1 chiếc ô tô thể thao và 2 con dê cỏ. Sau khi bạn chọn 1 cửa,
            MC mở một cửa có dê để tiết lộ. Liệu việc thay đổi quyết định có thực sự tăng gấp đôi cơ
            hội chiến thắng của bạn?
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* State / Instructions Banner - Clean Left Accent without 4-sided enclosure */}
          <div className="rounded-xl bg-slate-100/80 px-4 py-3.5 border-l-4 border-blue-600 flex items-center justify-between">
            <div className="text-sm font-medium">
              {step === 'pick' && (
                <span className="text-slate-800 flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <strong className="text-blue-700">Bước 1:</strong> Nhấp vào bất kỳ cánh cửa nào
                  bên dưới để đưa ra lựa chọn đầu tiên của bạn.
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
                      {didSwitch ? 'Chiến lược ĐỔI' : 'Chiến lược GIỮ'}
                      ). Thử thêm các lượt khác nhé!
                    </span>
                  )}
                </span>
              )}
            </div>

            {step === 'result' && (
              <Button
                size="sm"
                onClick={startNewRound}
                className="text-xs font-bold shrink-0 ml-4 shadow-sm"
              >
                Chơi ván mới
              </Button>
            )}
          </div>

          {/* 3 Physical Vault Doors */}
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
                  {/* Door Header Tag */}
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

                  {/* Vault Door Art / Content - Direct rendering without redundant inner nested box */}
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

                  {/* In-door Action Button */}
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

          {/* Dedicated Decision Bar when revealed - Clean borderless callout with left accent */}
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
                  className="flex-1 sm:flex-initial text-xs font-bold shadow-sm"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                  Đổi Cửa #{Number(remainingSwitchDoor ?? 0) + 1}{' '}
                  {isChallengeResolved ? '(67%)' : ''}
                </Button>
              </div>
            </div>
          )}

          {/* Live Empirical Statistics Dashboard - Direct 2-column cards without redundant outer box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Switch strategy card */}
            <div className="space-y-3 p-4 rounded-xl border border-blue-200 border-t-4 border-t-blue-600 bg-blue-50/20 shadow-2xs">
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

            {/* Stay strategy card */}
            <div className="space-y-3 p-4 rounded-xl border border-violet-200 border-t-4 border-t-violet-600 bg-violet-50/20 shadow-2xs">
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

          {/* Footer controls & mathematical explanation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                Mỗi lượt mô phỏng được tính toán trực tiếp trong trình duyệt qua thuật toán Monte
                Carlo ngẫu nhiên.
              </span>
            </div>

            {(stats.switchPlays > 0 || stats.stayPlays > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetStats}
                className="text-xs text-slate-500 hover:text-slate-900 h-7 px-2"
              >
                Đặt lại bảng thống kê
              </Button>
            )}
          </div>

          {/* Mathematical Insight Deep Dive - Left Accent Panel, zero 4-sided nested box */}
          {isChallengeResolved ? (
            <div className="rounded-xl bg-blue-50/50 border-l-4 border-blue-600 p-4 text-xs leading-relaxed text-slate-700 space-y-2.5">
              <div className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Bản chất toán học của Nghịch lý Monty Hall:
              </div>
              <p className="font-sans">
                Tại thời điểm chọn đầu tiên, xác suất bạn chọn đúng ô tô là{' '}
                <strong className="text-blue-700 font-mono">1/3</strong> và xác suất ô tô nằm ở một
                trong hai cánh cửa còn lại là{' '}
                <strong className="text-violet-700 font-mono">2/3</strong>. Vì MC luôn bắt buộc phải
                mở một cánh cửa có dê, toàn bộ xác suất 2/3 này dồn về cánh cửa còn lại chưa mở.
              </p>
              <div className="font-mono text-xs text-blue-950 bg-white p-3 rounded-lg shadow-2xs">
                P(Thắng | Đổi) = P(Chọn ban đầu là Dê) = 2/3 ≈ 66.67%
                <br />
                P(Thắng | Giữ) = P(Chọn ban đầu là Xe) = 1/3 ≈ 33.33%
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50/50 border-l-4 border-amber-500 p-4 text-xs leading-relaxed text-amber-900 space-y-1.5">
              <div className="font-heading font-bold text-sm text-amber-950 flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600" />
                Giải thích toán học đang tạm khóa
              </div>
              <p className="font-sans text-amber-800">
                Hãy đưa ra dự đoán trực giác ở phần thử thách phía trên (hoặc bấm bỏ qua) để mở khóa
                lời giải toán học và công thức xác suất chính xác.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bộ công cụ xuất dữ liệu & Chia sẻ cấu hình */}
      <ExportSuitePanel
        simulationTitle="Nghịch lý Monty Hall (Monty Hall Paradox)"
        simulationSlug="monty-hall"
        parameters={{ doorsCount: 3, strategy: 'monte-carlo-mix' }}
        results={{
          switchPlays: stats.switchPlays,
          switchWins: stats.switchWins,
          switchRate: switchRate !== null ? `${switchRate}%` : 'N/A',
          stayPlays: stats.stayPlays,
          stayWins: stats.stayWins,
          stayRate: stayRate !== null ? `${stayRate}%` : 'N/A',
        }}
        csvHeaders={[
          'Timestamp',
          'Doors_Count',
          'Trials_Count',
          'Empirical_Switch_Rate',
          'Theoretical_P',
        ]}
        historyRows={history.map(r => [
          r.createdAt,
          String((r.parameters as Record<string, unknown>)?.doorsCount ?? 3),
          r.trialsCount,
          typeof (r.results as Record<string, unknown>)?.empiricalProbability === 'number'
            ? (
                ((r.results as Record<string, unknown>).empiricalProbability as number) * 100
              ).toFixed(2) + '%'
            : 'N/A',
          '66.67%',
        ])}
      />

      {/* Lịch sử lượt chạy thực nghiệm của phiên */}
      <SimulationHistoryTable runs={history} />
    </div>
  );
}
