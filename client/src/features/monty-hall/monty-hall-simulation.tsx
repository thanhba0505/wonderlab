'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RotateCcw, Play, CheckCircle2, XCircle, Trophy, HelpCircle, Sparkles } from 'lucide-react';

type Step = 'pick' | 'revealed' | 'result';

interface Stats {
  switchPlays: number;
  switchWins: number;
  stayPlays: number;
  stayWins: number;
}

export function MontyHallSimulation() {
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

  // Fast forward 50 simulated games to observe Law of Large Numbers
  const handleSimulateBatch = () => {
    let newSwitchPlays = 0;
    let newSwitchWins = 0;
    let newStayPlays = 0;
    let newStayWins = 0;

    for (let i = 0; i < 50; i++) {
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

    setStats(prev => ({
      switchPlays: prev.switchPlays + newSwitchPlays,
      switchWins: prev.switchWins + newSwitchWins,
      stayPlays: prev.stayPlays + newStayPlays,
      stayWins: prev.stayWins + newStayWins,
    }));
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
    <Card className="border-cyan-500/30 bg-slate-900/80 shadow-2xl shadow-cyan-950/20">
      <CardHeader className="border-b border-slate-800/80 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="cyan">THÍ NGHIỆM TƯƠNG TÁC SỐ 01</Badge>
              <Badge variant="outline" className="text-slate-400">
                Xác suất & Nghịch lý
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 pt-1">
              Nghịch lý Monty Hall: Bạn có nên đổi cửa?
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateBatch}
              className="text-xs border-cyan-800 text-cyan-300 hover:bg-cyan-950/40"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              Mô phỏng +50 lượt
            </Button>
            <Button variant="secondary" size="sm" onClick={startNewRound} className="text-xs">
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Vòng mới
            </Button>
          </div>
        </div>
        <CardDescription className="text-slate-300 text-sm pt-2">
          Đằng sau 3 cánh cửa có 1 chiếc xe ô tô thể thao và 2 con dê. Sau khi bạn chọn 1 cửa, MC mở
          một cửa có dê. Bạn có nên thay đổi quyết định để nhận xe hơi?
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Instructions banner */}
        <div className="rounded-lg bg-slate-950/60 p-4 border border-slate-800 flex items-center justify-between">
          <div className="text-sm">
            {step === 'pick' && (
              <span className="text-cyan-300 font-medium flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Bước 1: Nhấp vào 1 trong 3 cánh cửa bên dưới để đưa ra lựa chọn đầu tiên.
              </span>
            )}
            {step === 'revealed' && (
              <span className="text-amber-300 font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Bước 2: MC đã mở Cửa số {(revealedGoatDoor ?? 0) + 1} (chứa Dê). Bạn muốn Giữ nguyên
                hay Đổi sang Cửa số {(remainingSwitchDoor ?? 0) + 1}?
              </span>
            )}
            {step === 'result' && (
              <span className="text-slate-200 font-medium flex items-center gap-2">
                {finalDoor === carDoor ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <Trophy className="h-4 w-4" /> Chúc mừng! Bạn đã thắng được Ô tô thể thao (
                    {didSwitch ? 'Chiến lược ĐỔI' : 'Chiến lược GIỮ'})!
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-400" /> Rất tiếc, đằng sau là chú Dê cỏ (
                    {didSwitch ? 'Chiến lược ĐỔI' : 'Chiến lược GIỮ'}).
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* 3 Doors Graphic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map(doorIndex => {
            const isSelected = selectedDoor === doorIndex;
            const isRevealedGoat = revealedGoatDoor === doorIndex;
            const isFinalChoice = finalDoor === doorIndex;
            const hasCar = carDoor === doorIndex;

            let borderColor = 'border-slate-800 hover:border-slate-600';
            let bgColor = 'bg-slate-950/40';

            if (step === 'revealed') {
              if (isSelected) {
                borderColor = 'border-cyan-400 ring-2 ring-cyan-500/20';
                bgColor = 'bg-cyan-950/20';
              } else if (isRevealedGoat) {
                borderColor = 'border-amber-700/60';
                bgColor = 'bg-amber-950/20';
              }
            } else if (step === 'result') {
              if (hasCar) {
                borderColor = 'border-emerald-500 ring-2 ring-emerald-500/30';
                bgColor = 'bg-emerald-950/20';
              } else if (isFinalChoice) {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-950/20';
              }
            }

            return (
              <div
                key={doorIndex}
                onClick={() => step === 'pick' && handleSelectDoor(doorIndex)}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-200 min-h-[220px] ${borderColor} ${bgColor} ${
                  step === 'pick' ? 'cursor-pointer hover:scale-[1.02]' : ''
                }`}
              >
                {/* Door header tag */}
                <span className="absolute top-3 left-3 text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  CỬA #{doorIndex + 1}
                </span>

                {isSelected && step !== 'result' && (
                  <Badge variant="cyan" className="absolute top-3 right-3 text-[10px]">
                    Bạn đang chọn
                  </Badge>
                )}

                {/* Door Content Representation */}
                <div className="my-4 flex flex-col items-center text-center">
                  {step === 'result' ? (
                    hasCar ? (
                      <div className="space-y-2 animate-in zoom-in-75">
                        <div className="text-4xl">🏎️</div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Ô tô thể thao
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 animate-in zoom-in-75">
                        <div className="text-4xl">🐐</div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Dê cỏ
                        </span>
                      </div>
                    )
                  ) : isRevealedGoat ? (
                    <div className="space-y-2 animate-in fade-in">
                      <div className="text-4xl">🐐</div>
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                        MC mở: Dê
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-16 h-24 rounded border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-mono text-2xl font-bold">
                        ?
                      </div>
                      <span className="text-xs text-slate-400">Đang đóng</span>
                    </div>
                  )}
                </div>

                {/* Action button inside door when revealed */}
                {step === 'revealed' && !isRevealedGoat && (
                  <div className="w-full mt-2">
                    {isSelected ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleFinalDecision(false)}
                        className="w-full text-xs font-semibold text-slate-200"
                      >
                        Giữ nguyên lựa chọn
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleFinalDecision(true)}
                        className="w-full text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
                      >
                        Đổi sang cửa này
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Empirical Statistics Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="space-y-1.5 p-3 rounded-lg border border-cyan-500/20 bg-cyan-950/10">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-cyan-300 uppercase tracking-wide">
                Chiến lược ĐỔI CỬA (Switch)
              </span>
              <span className="font-mono text-cyan-400 text-sm">Lý thuyết: ~66.7% (2/3)</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold font-mono text-white">
                {switchRate !== null ? `${switchRate}%` : 'Chưa có lượt'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {stats.switchWins} thắng / {stats.switchPlays} lượt
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${switchRate ?? 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg border border-slate-800 bg-slate-900/20">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 uppercase tracking-wide">
                Chiến lược GIỮ NGUYÊN (Stay)
              </span>
              <span className="font-mono text-slate-400 text-sm">Lý thuyết: ~33.3% (1/3)</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold font-mono text-white">
                {stayRate !== null ? `${stayRate}%` : 'Chưa có lượt'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {stats.stayWins} thắng / {stats.stayPlays} lượt
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
              <div
                className="bg-violet-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stayRate ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Insight Explanation */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4 text-xs leading-relaxed text-slate-300 space-y-1">
          <p className="font-semibold text-slate-100 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            Giải thích toán học:
          </p>
          <p>
            Lúc đầu bạn có 1/3 cơ hội chọn trúng xe và 2/3 cơ hội chọn trúng dê. Khi MC loại bỏ một
            con dê, việc chuyển đổi giúp bạn nhận toàn bộ xác suất 2/3 còn lại. Vì vậy,{' '}
            <strong>luôn đổi cửa</strong> nhân đôi tỷ lệ thắng của bạn từ 33.3% lên 66.7%!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
