'use client';

import * as React from 'react';
import {
  generateRandomHats,
  getInitialHats,
  solveHatPuzzle,
  SimulationSolveResult,
  PrisonerState,
} from './hat-puzzle-math';
import {
  LineupStage,
  ParityBlackboard,
  RoleplayController,
  SimulationControls,
  MonteCarloPanel,
  ParityExplainer,
} from './components';
import {
  SimulationSection,
  SimulationWorkbenchCard,
  SimulationHistoryTable,
  IntuitionChallengeCard,
  ExportSuitePanel,
} from '@/features/simulations/components';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { getSimulationBySlug } from '@/features/simulations/registry';
import { HypothesisOption } from '@/features/simulations/types';

export function PrisonersHatsSimulation() {
  const meta = getSimulationBySlug('prisoners-hats');

  // Parameters
  const [n, setN] = React.useState<number>(10);
  const [colorCount, setColorCount] = React.useState<2 | 3>(2);
  const [playbackSpeed, setPlaybackSpeed] = React.useState<number>(1);
  const [mode, setMode] = React.useState<'auto' | 'roleplay'>('auto');

  // Simulation Data & State (deterministic initial preset avoids SSR hydration mismatch)
  const [actualHats, setActualHats] = React.useState<number[]>(() => getInitialHats(10, 2));
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number>(-1);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  // Roleplay State
  const [rolePlayPosition, setRolePlayPosition] = React.useState<number>(5);
  const [userGuessedColor, setUserGuessedColor] = React.useState<number | null>(null);

  // Intuition Challenge Prediction State
  const [userPrediction, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);

  // Telemetry Hook
  const { history, recordRun } = useSimulationTelemetry('prisoners-hats');

  // Solved Result Memo
  const solveResult: SimulationSolveResult = React.useMemo(() => {
    return solveHatPuzzle(actualHats, colorCount);
  }, [actualHats, colorCount]);

  // Current visual prisoners state according to currentStepIndex
  const visualPrisoners: PrisonerState[] = React.useMemo(() => {
    return solveResult.prisoners.map(p => {
      // Step index corresponds to turn order:
      // Turn 0 is person N (idx = n - 1)
      // Turn k is person (N - k)
      const turnOrder = n - p.id;
      if (currentStepIndex >= turnOrder) {
        return p;
      }
      return {
        ...p,
        guessedColor: null,
        isCorrect: null,
      };
    });
  }, [solveResult, currentStepIndex, n]);

  const isCompleted = currentStepIndex >= n - 1;

  // Handle Play/Pause Auto-stepper Timer
  React.useEffect(() => {
    if (!isPlaying) return;

    // Check if next step is user's turn in roleplay mode and user hasn't guessed yet
    const nextTurn = currentStepIndex + 1;
    const nextPrisonerId = n - nextTurn;

    if (mode === 'roleplay' && nextPrisonerId === rolePlayPosition && userGuessedColor === null) {
      // Pause to let user decide
      setIsPlaying(false);
      return;
    }

    if (nextTurn >= n) {
      setIsPlaying(false);
      return;
    }

    const intervalMs = Math.max(200, Math.floor(1200 / playbackSpeed));
    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= n - 1) {
          setIsPlaying(false);
          // Record telemetry run when full sequence finishes
          recordRun(
            {
              n,
              colorCount,
              mode,
              userPrediction: userPrediction?.option.value,
            },
            {
              correctCount: solveResult.correctCount,
              survivalRate: solveResult.survivalRate,
              sacrificeGuessedRight: solveResult.sacrificeGuessedRight,
            },
            n,
            Math.round(1200 * n),
          );
        }
        return next;
      });
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentStepIndex,
    n,
    playbackSpeed,
    mode,
    rolePlayPosition,
    userGuessedColor,
    recordRun,
    colorCount,
    solveResult,
    userPrediction,
  ]);

  // Parameter Change Handlers
  const handleChangeN = (newN: number) => {
    setN(newN);
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setUserGuessedColor(null);
    if (rolePlayPosition > newN) {
      setRolePlayPosition(Math.max(1, Math.floor(newN / 2)));
    }
    setActualHats(generateRandomHats(newN, colorCount));
  };

  const handleChangeColorCount = (count: 2 | 3) => {
    setColorCount(count);
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setUserGuessedColor(null);
    setActualHats(generateRandomHats(n, count));
  };

  const handleRandomize = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setUserGuessedColor(null);
    setActualHats(generateRandomHats(n, colorCount));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setUserGuessedColor(null);
  };

  const handleStepNext = () => {
    if (currentStepIndex < n - 1) {
      const nextTurn = currentStepIndex + 1;
      const nextPrisonerId = n - nextTurn;

      // In roleplay mode, if next is user's turn and not yet guessed, stop at user turn
      if (mode === 'roleplay' && nextPrisonerId === rolePlayPosition && userGuessedColor === null) {
        setCurrentStepIndex(nextTurn);
        return;
      }

      setCurrentStepIndex(nextTurn);
    }
  };

  // Manual Hat Color Cycling when clicking character in stage
  const handleSelectHatColor = (personIndex: number) => {
    if (currentStepIndex >= 0 && !isCompleted) return; // don't edit mid-run

    setActualHats(prev => {
      const next = [...prev];
      const currentColor = next[personIndex] ?? 0;
      next[personIndex] = (currentColor + 1) % colorCount;
      return next;
    });
    handleReset();
  };

  // User Role-Play Submission
  const handleUserSubmitGuess = (guessedColor: number) => {
    setUserGuessedColor(guessedColor);
  };

  // Is it currently the user's turn in roleplay?
  const currentUserTurnId = currentStepIndex >= 0 ? n - currentStepIndex : null;
  const isMyTurn =
    mode === 'roleplay' && (currentUserTurnId === rolePlayPosition || currentStepIndex === -1);

  // History table reload handler
  const handleReloadParams = (params: Record<string, unknown>) => {
    if (typeof params.n === 'number') {
      handleChangeN(params.n);
    }
    if (params.colorCount === 2 || params.colorCount === 3) {
      handleChangeColorCount(params.colorCount);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Intuition Challenge Section */}
      {meta?.hypothesis && (
        <SimulationSection
          dotColor="amber"
          title="Thử Thách Trực Giác: Trực Giác Độc Lập vs Hợp Tác"
          subtitle="Trước khi kiểm tra bằng toán học, bộ não của bạn dự đoán số người được cứu là bao nhiêu?"
        >
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug="prisoners-hats"
            onPredictionSelected={(opt: HypothesisOption, gap: number) => {
              setUserPrediction({ option: opt, gap });
            }}
          />
        </SimulationSection>
      )}

      {/* 2. Primary Workbench Section */}
      <SimulationSection
        dotColor="blue"
        title="Phòng Thí Nghiệm Hàng Ngũ &amp; Phép Giải Mã Parity"
        subtitle="Quan sát hoạt họa từng lượt đoán hoặc trực tiếp nhập vai vào hàng người để suy luận màu mũ"
      >
        <SimulationWorkbenchCard>
          <div className="space-y-5">
            {/* Control Panel */}
            <SimulationControls
              n={n}
              onChangeN={handleChangeN}
              colorCount={colorCount}
              onChangeColorCount={handleChangeColorCount}
              mode={mode}
              onChangeMode={setMode}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(prev => !prev)}
              onStepNext={handleStepNext}
              onReset={handleReset}
              onRandomize={handleRandomize}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
              isCompleted={isCompleted}
            />

            {/* Visual Stage */}
            <LineupStage
              prisoners={visualPrisoners}
              colorCount={colorCount}
              currentStepIndex={currentStepIndex}
              currentStep={
                currentStepIndex >= 0 ? (solveResult.steps[currentStepIndex] ?? null) : null
              }
              rolePlayPosition={mode === 'roleplay' ? rolePlayPosition : null}
              isRolePlayActive={mode === 'roleplay'}
              userGuessedColor={userGuessedColor}
              onSelectHatColor={handleSelectHatColor}
              canEditHats={currentStepIndex === -1 || isCompleted}
            />

            {/* Roleplay Controller if in Roleplay Mode */}
            {mode === 'roleplay' && (
              <RoleplayController
                n={n}
                colorCount={colorCount}
                actualHats={actualHats}
                rolePlayPosition={rolePlayPosition}
                onSelectPosition={pos => {
                  setRolePlayPosition(pos);
                  setUserGuessedColor(null);
                  handleReset();
                }}
                isMyTurn={isMyTurn}
                hasUserGuessed={userGuessedColor !== null}
                userGuessedColor={userGuessedColor}
                onUserSubmitGuess={handleUserSubmitGuess}
                onResetChallenge={() => {
                  setUserGuessedColor(null);
                  handleReset();
                }}
              />
            )}

            {/* Realtime Logic Blackboard */}
            <ParityBlackboard
              steps={solveResult.steps}
              currentStepIndex={currentStepIndex}
              prisoners={solveResult.prisoners}
              colorCount={colorCount}
            />
          </div>
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. Monte Carlo & Statistical Verification Section */}
      <SimulationSection
        dotColor="emerald"
        title="Kiểm Định Thực Nghiệm Monte Carlo Quy Mô Lớn"
        subtitle="Mô phỏng hàng nghìn ván ngẫu nhiên để chứng minh định lý toán học: tỷ lệ bảo đảm luôn đạt 100% cho N-1 người"
      >
        <MonteCarloPanel
          n={n}
          colorCount={colorCount}
          onRunFinished={summary => {
            recordRun(
              {
                n,
                colorCount,
                type: 'monte-carlo',
                trials: summary.trials,
              },
              {
                overallAccuracy: summary.overallAccuracy,
                guaranteedAccuracy: summary.guaranteedGroupAccuracy,
                sacrificeAccuracy: summary.sacrificeAccuracy,
              },
              summary.trials,
              80,
            );
          }}
        />
      </SimulationSection>

      {/* 4. Scientific Explainer & CS Connection */}
      <SimulationSection
        dotColor="indigo"
        title="Góc Tri Thức Khoa Học: Bản Chất Toán Học &amp; Ứng Dụng"
        subtitle="Cầu nối giữa câu đố tư duy logic, bit kiểm tra RAM ECC và cấu trúc mảng ổ đĩa RAID"
      >
        <ParityExplainer />
      </SimulationSection>

      {/* 5. Data Export Suite & History */}
      <SimulationSection
        dotColor="violet"
        title="Bộ Dữ Liệu Thực Nghiệm &amp; Lịch Sử Phiên Thử"
        subtitle="Xuất toàn bộ bảng log suy luận ra định dạng CSV/JSON và đối chiếu các lượt chạy trước"
      >
        <div className="space-y-4">
          <ExportSuitePanel
            simulationTitle="Bài toán Đội mũ & Bit Chẵn lẻ (Prisoners Hat Puzzle)"
            simulationSlug="prisoners-hats"
            parameters={{
              numberOfPrisoners: n,
              colorSpaceCount: colorCount,
              currentMode: mode,
              theoreticalSurvivalRate: `${(((n - 1 + 1 / colorCount) / n) * 100).toFixed(1)}%`,
            }}
            results={{
              correctGuesses: solveResult.correctCount,
              totalPrisoners: n,
              actualSurvivalRate: `${(solveResult.survivalRate * 100).toFixed(1)}%`,
              sacrificePersonResult: solveResult.sacrificeGuessedRight ? 'Đoán đúng' : 'Hy sinh',
            }}
            csvHeaders={[
              'Lượt_bước',
              'Người_số',
              'Mũ_thực_tế',
              'Mũ_dự_đoán',
              'Parity_kỳ_vọng',
              'Kết_quả',
            ]}
            historyRows={solveResult.steps.map(step => {
              const p = solveResult.prisoners.find(pr => pr.id === step.prisonerId);
              return [
                step.stepIndex + 1,
                `Người #${step.prisonerId}`,
                p?.actualColor ?? '--',
                step.spokenColor,
                step.runningParity,
                step.isCorrect ? 'ĐÚNG' : 'SAI',
              ];
            })}
          />

          <SimulationHistoryTable runs={history} onReloadParams={handleReloadParams} />
        </div>
      </SimulationSection>
    </div>
  );
}
