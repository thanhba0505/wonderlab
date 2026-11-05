'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileJson, Copy, Check, Database, Activity, Sparkles } from 'lucide-react';
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
import { DoorsStage, ControlsDeck, MontyStep } from './components';
import { useMontyHallAudio } from './utils/monty-hall-audio';

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
  const { locale, dict } = useTranslation();
  const mDict = dict.sim_monty_hall;
  const exp = dict.simulations.export;
  const tel = dict.simulations.telemetry;
  const meta = useSimulationMeta('monty-hall');
  const audio = useMontyHallAudio();

  const [userPrediction, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);
  const [copiedType, setCopiedType] = React.useState<'report' | null>(null);

  const { history, globalStats, recordRun, page, pageSize, total, onPageChange, onPageSizeChange } =
    useSimulationTelemetry('monty-hall');

  const [carDoor, setCarDoor] = React.useState<number>(0);
  const [selectedDoor, setSelectedDoor] = React.useState<number | null>(null);
  const [revealedGoatDoor, setRevealedGoatDoor] = React.useState<number | null>(null);
  const [finalDoor, setFinalDoor] = React.useState<number | null>(null);
  const [step, setStep] = React.useState<MontyStep>('pick');
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
    audio.playReset();
  }, [audio]);

  React.useEffect(() => {
    const randomCar = Math.floor(Math.random() * 3);
    setCarDoor(randomCar);
    setSelectedDoor(null);
    setRevealedGoatDoor(null);
    setFinalDoor(null);
    setStep('pick');
    setDidSwitch(false);
  }, []);

  // Bước 1: Người chơi chọn 1 cánh cửa
  const handleSelectDoor = (doorIndex: number) => {
    if (step !== 'pick') return;

    setSelectedDoor(doorIndex);
    audio.playDoorPick();

    // Người dẫn chương trình mở cánh cửa có DÊ và KHÔNG PHẢI cửa người chơi đã chọn
    const possibleGoatDoors = [0, 1, 2].filter(d => d !== doorIndex && d !== carDoor);
    const hostChoice =
      possibleGoatDoors[Math.floor(Math.random() * possibleGoatDoors.length)] ??
      [0, 1, 2].find(d => d !== doorIndex) ??
      0;

    setTimeout(() => {
      setRevealedGoatDoor(hostChoice);
      setStep('revealed');
      audio.playHostReveal();
    }, 280);
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

    if (won) {
      audio.playWinCar();
    } else {
      audio.playGoat();
    }

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
      audio.playBatchTick();
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
      audio.playWinCar();
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
      {/* 1. Khảo Sát Trực Giác Trước Thực Nghiệm */}
      <SimulationSection dotColor="amber" title={mDict.survey_title} subtitle={mDict.survey_desc}>
        {meta?.hypothesis && (
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug="monty-hall"
            onPredictionSelected={(option, gap) => setUserPrediction({ option, gap })}
          />
        )}
      </SimulationSection>

      {/* 2. Buồng Thí Nghiệm & Mô Phỏng Trực Quan Chuẩn Split Layout */}
      <SimulationSection dotColor="blue" title={mDict.sim_title} subtitle={mDict.sim_desc}>
        <SimulationWorkbenchCard
          title={mDict.sim_title}
          normalLayout="split"
          controls={
            <ControlsDeck
              isSimulatingBatch={isSimulatingBatch}
              workerProgress={workerProgress}
              completedTrials={workerPartial?.completedTrials ?? 0}
              targetBatchCount={targetBatchCount}
              totalGames={totalGames}
              onSimulateBatch={handleSimulateBatch}
              onAbortBatch={abortWorkerMontyHall}
              onResetStats={resetStats}
            />
          }
          stage={
            <DoorsStage
              step={step}
              carDoor={carDoor}
              selectedDoor={selectedDoor}
              revealedGoatDoor={revealedGoatDoor}
              finalDoor={finalDoor}
              didSwitch={didSwitch}
              switchRate={switchRate}
              stayRate={stayRate}
              onSelectDoor={handleSelectDoor}
              onFinalDecision={handleFinalDecision}
              onStartNewRound={startNewRound}
            />
          }
          metricsBar={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 pb-6 border-b border-slate-200/80">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {mDict.total_games_played}
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {totalGames}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {stats.switchPlays} {mDict.switch_unit} / {stats.stayPlays} {mDict.stay_unit}
                </div>
              </div>

              <div className="space-y-1.5 sm:border-l sm:border-slate-200/80 sm:pl-6">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex flex-wrap items-center justify-between gap-1">
                  <span>{mDict.switch_strategy}</span>
                  <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {mDict.theory_switch}
                  </span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
                  {switchRate !== null ? `${switchRate}%` : '—'}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {stats.switchWins} {mDict.wins_unit} / {stats.switchPlays} {mDict.games_unit}
                </div>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-6">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase flex flex-wrap items-center justify-between gap-1">
                  <span>{mDict.stay_strategy}</span>
                  <span className="font-mono text-xs text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded">
                    {mDict.theory_stay}
                  </span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-violet-700 tabular-nums">
                  {stayRate !== null ? `${stayRate}%` : '—'}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {stats.stayWins} {mDict.wins_unit} / {stats.stayPlays} {mDict.games_unit}
                </div>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-6">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {mDict.game_progress}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold pt-0.5 text-slate-900 truncate">
                  {step === 'pick' && mDict.step_pick}
                  {step === 'revealed' && mDict.step_revealed}
                  {step === 'result' &&
                    (finalDoor === carDoor ? `🎉 ${mDict.sports_car}` : `🐐 ${mDict.goat_grass}`)}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {step === 'pick' && mDict.step_pick_sub}
                  {step === 'revealed' && mDict.step_revealed_sub}
                  {step === 'result' && (didSwitch ? mDict.switch_strategy : mDict.stay_strategy)}
                </div>
              </div>
            </div>
          }
          tools={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={exp.csv_title}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>{exp.csv}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={exp.json_title}
              >
                <FileJson className="h-3.5 w-3.5 text-blue-600" />
                <span>{exp.json}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={exp.report_title}
              >
                {copiedType === 'report' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">{exp.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>{exp.report}</span>
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
                    {globalStats.totalTrials.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </span>
                  <span className="text-slate-400">{tel.trials}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-600">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-bold text-slate-800 tabular-nums">
                    {globalStats.totalRuns.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </span>
                  <span className="text-slate-400">{tel.runs}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                <span>{tel.ready}</span>
              </div>
            )
          }
        />
      </SimulationSection>

      {/* 3. Nhật Ký Lượt Chạy Thực Nghiệm Phân Trang */}
      {showHistory && (
        <SimulationSection
          dotColor="emerald"
          title={dict.simulations.history.title}
          subtitle={dict.simulations.history.auto_synced}
        >
          <SimulationHistoryTable
            simulationSlug="monty-hall"
            runs={history}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onReloadParams={params => {
              if (params.strategy === 'monte-carlo-mix') {
                handleSimulateBatch(10000);
              } else {
                startNewRound();
              }
            }}
          />
        </SimulationSection>
      )}

      {/* 4. Giải Thích Khoa Học & Định Lý Bayes */}
      <SimulationSection
        dotColor="blue"
        title={dict.simulations.explanation}
        subtitle={mDict.sim_desc}
      >
        <SimulationExplainerCard>
          <div className="space-y-6">
            <div className="space-y-1 border-b border-slate-200/80 pb-4">
              <h3 className="font-heading text-base font-bold text-slate-900">
                {mDict.bayes_explainer_title}
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {mDict.bayes_conclusion}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Cột 1: Trực giác ngộ nhận */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {mDict.naive_fallacy}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 font-semibold">
                    50 / 50
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">{mDict.bayes_initial_prob}</p>

                <SimulationFormulaBox title={mDict.naive_fallacy}>
                  <div className="flex items-center flex-wrap gap-2 text-sm text-slate-900">
                    <span className="font-bold">{mDict.bayes_p_switch}</span>
                    <span>=</span>
                    <span className="font-bold">{mDict.bayes_p_stay}</span>
                    <span>=</span>
                    <MathFraction numerator="1" denominator="2" />
                    <span>= 50.0%</span>
                  </div>
                </SimulationFormulaBox>

                <p className="text-xs text-slate-500 italic">{mDict.bayes_initial_prob}</p>
              </div>

              {/* Cột 2: Bản chất toán học khách quan */}
              <div className="space-y-3 md:border-l md:border-slate-200/90 md:pl-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-900 uppercase tracking-wide">
                    {mDict.objective_truth}
                  </span>
                  <span className="rounded bg-blue-100/70 px-2 py-0.5 font-mono text-xs font-bold text-blue-800">
                    {mDict.bayes_theorem_badge}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  {mDict.bayes_host_filter} {mDict.bayes_conclusion}
                </p>

                <SimulationFormulaBox title={mDict.objective_truth}>
                  <div className="space-y-2 text-xs text-slate-900">
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                      <span className="font-bold text-blue-900">{mDict.bayes_p_switch}</span>
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
                      <span>{mDict.bayes_p_stay}</span>
                      <span>=</span>
                      <MathFraction numerator="1" denominator="3" />
                      <span className="text-slate-400">&asymp;</span>
                      <span>33.3%</span>
                    </div>
                  </div>
                </SimulationFormulaBox>

                <p className="text-xs text-slate-600">{mDict.bayes_conclusion}</p>
              </div>
            </div>
          </div>
        </SimulationExplainerCard>
      </SimulationSection>
    </div>
  );
}
