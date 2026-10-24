'use client';

import * as React from 'react';
import { Swords, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Move, RoundRecord, StrategyId } from './game-theory-math';
import { PayoffMatrixView } from './components/payoff-matrix-view';
import { DuelArena } from './components/duel-arena';
import { AxelrodTournament } from './components/axelrod-tournament';
import { StrategyExplainer } from './components/strategy-explainer';
import { GlobalTelemetryWidget } from '@/features/simulations/components/global-telemetry-widget';
import { IntuitionChallengeCard } from '@/features/simulations/components/intuition-challenge-card';
import { ExportSuitePanel } from '@/features/simulations/components/export-suite-panel';
import { SimulationHistoryTable } from '@/features/simulations/components/simulation-history-table';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { getSimulationBySlug } from '@/features/simulations/registry';
import { HypothesisOption } from '@/features/simulations/types';

type SimulationMode = 'duel' | 'tournament';

export function PrisonersDilemmaSimulation() {
  const meta = getSimulationBySlug('prisoners-dilemma');
  const [activeMode, setActiveMode] = React.useState<SimulationMode>('duel');
  const [lastMove1, setLastMove1] = React.useState<Move | null>(null);
  const [lastMove2, setLastMove2] = React.useState<Move | null>(null);

  // Match telemetry export cache
  const [recentRounds, setRecentRounds] = React.useState<RoundRecord[]>([]);
  const [lastMatchStats, setLastMatchStats] = React.useState<{
    userScore: number;
    opponentScore: number;
    opponentId?: StrategyId;
  } | null>(null);

  // Intuition Challenge State
  const [, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);
  const [, setIsChallengeResolved] = React.useState<boolean>(false);

  // Background Telemetry Hook
  const { history, globalStats, recordRun } = useSimulationTelemetry('prisoners-dilemma');

  // Handle URL mode query if present
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam === 'tournament' || modeParam === 'duel') {
      setActiveMode(modeParam);
    }
  }, []);

  const handleModeChange = (mode: SimulationMode) => {
    setActiveMode(mode);
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
  };

  const handleRoundPlayed = React.useCallback((record: RoundRecord) => {
    setLastMove1(record.move1);
    setLastMove2(record.move2);
    setRecentRounds(prev => [...prev.slice(-99), record]);
  }, []);

  const handleMatchFinished = React.useCallback(
    (p1Score: number, p2Score: number, rounds: RoundRecord[]) => {
      setLastMatchStats({
        userScore: p1Score,
        opponentScore: p2Score,
      });

      // Record match run to telemetry
      recordRun(
        {
          mode: 'duel',
          totalRounds: rounds.length,
          userScore: p1Score,
          opponentScore: p2Score,
          cooperationRate: parseFloat(
            (
              (rounds.filter(r => r.move1 === 'C').length / Math.max(1, rounds.length)) *
              100
            ).toFixed(1),
          ),
        },
        {
          outcome: p1Score > p2Score ? 'win' : p1Score === p2Score ? 'draw' : 'lose',
          scoreDiff: p1Score - p2Score,
          averageRoundPayoff: parseFloat((p1Score / Math.max(1, rounds.length)).toFixed(2)),
        },
        rounds.length,
        Math.min(10000, rounds.length * 400),
      );
    },
    [recordRun],
  );

  const handleTournamentRecorded = React.useCallback(
    (generation: number, dominantStrategy: StrategyId) => {
      recordRun(
        {
          mode: 'tournament',
          generation,
          populationSize: 100,
        },
        {
          dominantStrategy,
          survivalEpochs: generation,
        },
        generation,
        150,
      );
    },
    [recordRun],
  );

  // Format export rows
  const exportRows = React.useMemo(() => {
    if (recentRounds.length === 0) {
      return [
        [1, 'C', 'C', 3, 3, 3, 3],
        [2, 'C', 'D', 0, 5, 3, 8],
      ];
    }
    return recentRounds.map(r => [
      r.round,
      r.move1,
      r.move2,
      r.score1,
      r.score2,
      r.cumulativeScore1,
      r.cumulativeScore2,
    ]);
  }, [recentRounds]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Global Live Telemetry Widget */}
      <GlobalTelemetryWidget stats={globalStats} />

      {/* 2. Intuition Gap & Hypothesis Challenge */}
      {meta?.hypothesis && (
        <IntuitionChallengeCard
          challenge={meta.hypothesis}
          simulationSlug="prisoners-dilemma"
          onPredictionSelected={(option: HypothesisOption, gap: number) => {
            setUserPrediction({ option, gap });
            setIsChallengeResolved(true);
          }}
          onStatusChange={setIsChallengeResolved}
        />
      )}

      {/* 3. Mode Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-300/85 bg-slate-100/80 p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleModeChange('duel')}
            className={`h-8 gap-2 px-3 text-xs font-medium transition-all ${
              activeMode === 'duel'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Swords className="h-3.5 w-3.5 text-blue-600" />
            1. Đấu tay đôi (1-on-1 Duel)
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleModeChange('tournament')}
            className={`h-8 gap-2 px-3 text-xs font-medium transition-all ${
              activeMode === 'tournament'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            2. Tiến hóa Quần thể (Axelrod Tournament)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-[11px] font-mono border-slate-300 text-slate-600"
          >
            <Sparkles className="mr-1 h-3 w-3 text-amber-500" />
            Cân bằng Nash: (Phản bội, Phản bội)
          </Badge>
        </div>
      </div>

      {/* 4. Payoff Matrix Grid (Shared Reference) */}
      <PayoffMatrixView lastMove1={lastMove1} lastMove2={lastMove2} />

      {/* 5. Main Simulation Screen based on Active Mode */}
      {activeMode === 'duel' ? (
        <DuelArena
          onRoundPlayed={handleRoundPlayed}
          onMatchFinished={handleMatchFinished}
          onMovesChanged={(m1, m2) => {
            setLastMove1(m1);
            setLastMove2(m2);
          }}
        />
      ) : (
        <AxelrodTournament onTournamentRecorded={handleTournamentRecorded} />
      )}

      {/* 6. Scientific Explainer on Cooperation Evolution */}
      <StrategyExplainer />

      {/* 7. Research Data Exporter Suite */}
      <ExportSuitePanel
        simulationTitle="Thế lưỡng nan của người tù"
        simulationSlug="prisoners-dilemma"
        parameters={{
          mode: activeMode,
          payoffs: 'T=5, R=3, P=1, S=0',
          nashEquilibrium: 'Defect-Defect',
          paretoOptimal: 'Cooperate-Cooperate',
        }}
        results={{
          totalRoundsRecorded: recentRounds.length,
          lastMatchResult: lastMatchStats
            ? `P1: ${lastMatchStats.userScore} vs P2: ${lastMatchStats.opponentScore}`
            : 'Chưa hoàn thành ván đấu',
        }}
        csvHeaders={[
          'Round',
          'Player1_Move',
          'Player2_Move',
          'Payoff1',
          'Payoff2',
          'Cumulative1',
          'Cumulative2',
        ]}
        historyRows={exportRows}
      />

      {/* 8. Local History Table */}
      <SimulationHistoryTable runs={history} isLoading={false} />
    </div>
  );
}
