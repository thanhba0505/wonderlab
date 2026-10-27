'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Swords,
  Users,
  Sparkles,
  FileSpreadsheet,
  FileJson,
  Copy,
  Check,
  Database,
  Activity,
} from 'lucide-react';
import { PayoffMatrixView } from './components/payoff-matrix-view';
import { DuelArena } from './components/duel-arena';
import { AxelrodTournament } from './components/axelrod-tournament';
import { StrategyExplainer } from './components/strategy-explainer';
import {
  SimulationSection,
  SimulationWorkbenchCard,
  SimulationExplainerCard,
  SimulationHistoryTable,
  IntuitionChallengeCard,
} from '@/features/simulations/components';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { useSimulationMeta } from '@/features/simulations/hooks';
import { useTranslation } from '@/i18n';
import { HypothesisOption } from '@/features/simulations/types';
import { Move, RoundRecord, StrategyId } from './game-theory-math';
import {
  exportToCsv,
  exportToJson,
  copyToClipboard,
} from '@/features/simulations/utils/export-data';

type GameMode = 'duel' | 'tournament';

export function PrisonersDilemmaSimulation() {
  const { locale, dict } = useTranslation();
  const meta = useSimulationMeta('prisoners-dilemma');
  const [activeMode, setActiveMode] = React.useState<GameMode>('duel');
  const [lastMove1, setLastMove1] = React.useState<Move | null>(null);
  const [lastMove2, setLastMove2] = React.useState<Move | null>(null);
  const [recentRounds, setRecentRounds] = React.useState<RoundRecord[]>([]);
  const [lastMatchStats, setLastMatchStats] = React.useState<{
    userScore: number;
    opponentScore: number;
    opponentId?: StrategyId;
  } | null>(null);
  const [copiedType, setCopiedType] = React.useState<'report' | null>(null);

  // Intuition Challenge State
  const [userPrediction, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);

  // Background Telemetry Hook
  const { history, globalStats, recordRun } = useSimulationTelemetry('prisoners-dilemma');

  // Sync mode with URL param
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam === 'tournament' || modeParam === 'duel') {
      setActiveMode(modeParam);
    }
  }, []);

  const handleModeChange = (mode: GameMode) => {
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
    (p1Score: number, p2Score: number, matchRecords: RoundRecord[]) => {
      setLastMatchStats({
        userScore: p1Score,
        opponentScore: p2Score,
      });

      recordRun(
        {
          mode: 'duel',
          totalRounds: matchRecords.length,
          userPrediction: userPrediction?.option.value,
        },
        {
          userScore: p1Score,
          opponentScore: p2Score,
          isUserWinner: p1Score > p2Score,
          payoffRatio: p2Score > 0 ? (p1Score / p2Score).toFixed(2) : 'N/A',
          intuitionGap: userPrediction?.gap,
        },
        matchRecords.length,
        120,
      );
    },
    [userPrediction, recordRun],
  );

  const handleTournamentRecorded = React.useCallback(
    (generation: number, dominantStrategy: StrategyId) => {
      recordRun(
        {
          mode: 'tournament',
          generation,
          userPrediction: userPrediction?.option.value,
        },
        {
          dominantStrategy,
          isCooperative:
            dominantStrategy === 'tit_for_tat' || dominantStrategy === 'tit_for_two_tats',
          intuitionGap: userPrediction?.gap,
        },
        100,
        180,
      );
    },
    [userPrediction, recordRun],
  );

  const handleExportCsv = () => {
    const headers = [
      'Round',
      'Player1_Move',
      'Player2_Move',
      'Score1',
      'Score2',
      'Cumulative1',
      'Cumulative2',
    ];
    const rows = recentRounds.map(r => [
      r.round,
      r.move1,
      r.move2,
      r.score1,
      r.score2,
      r.cumulativeScore1,
      r.cumulativeScore2,
    ]);
    exportToCsv('wonderlab-prisoners-dilemma.csv', headers, rows);
  };

  const handleExportJson = () => {
    const data = {
      simulation: 'prisoners-dilemma',
      exportedAt: new Date().toISOString(),
      activeMode,
      recentRounds,
      lastMatchStats,
      runs: history,
    };
    exportToJson('wonderlab-prisoners-dilemma.json', data);
  };

  const handleCopyReport = async () => {
    const report = `# Báo Cáo Thực Nghiệm: Thế lưỡng nan của người tù
- **Chế độ**: ${activeMode === 'duel' ? 'Đấu tay đôi 1-on-1' : 'Tiến hóa quần thể Axelrod'}
- **Tổng số hiệp ghi nhận**: ${recentRounds.length}
- **Kết quả ván gần nhất**: ${lastMatchStats ? `P1: ${lastMatchStats.userScore} vs P2: ${lastMatchStats.opponentScore}` : 'Chưa đấu ván nào'}
- **Cân bằng Nash**: (Phản bội, Phản bội) -> 1 điểm mỗi bên
- **Pareto Tối ưu**: (Hợp tác, Hợp tác) -> 3 điểm mỗi bên`;
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
        title={dict.sim_prisoners_dilemma.survey_title}
        subtitle={dict.sim_prisoners_dilemma.survey_desc}
      >
        {meta?.hypothesis && (
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug="prisoners-dilemma"
            onPredictionSelected={(option: HypothesisOption, gap: number) => {
              setUserPrediction({ option, gap });
            }}
          />
        )}
      </SimulationSection>

      {/* 2. TITLE CHỖ THÍ NGHIỆM & BLOCK THÍ NGHIỆM HỢP NHẤT */}
      <SimulationSection
        dotColor="blue"
        title={dict.sim_prisoners_dilemma.sim_title}
        subtitle={dict.sim_prisoners_dilemma.sim_desc}
      >
        <SimulationWorkbenchCard
          metricsBar={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pb-5 border-b border-slate-200/80">
              <div className="space-y-1">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {dict.sim_prisoners_dilemma.game_mode}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                  {activeMode === 'duel' ? '1-on-1 Duel' : 'Tournament'}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {activeMode === 'duel'
                    ? dict.sim_prisoners_dilemma.duel_desc
                    : dict.sim_prisoners_dilemma.tournament_desc}
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {dict.sim_prisoners_dilemma.nash_equilibrium}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold pt-0.5 text-rose-600">
                  {dict.sim_prisoners_dilemma.defect_defect}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {dict.sim_prisoners_dilemma.dominant_strategy}
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {dict.sim_prisoners_dilemma.pareto_optimum}
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold pt-0.5 text-emerald-600">
                  {dict.sim_prisoners_dilemma.cooperate_cooperate}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {dict.sim_prisoners_dilemma.max_collective_payoff}
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  {dict.sim_prisoners_dilemma.rounds_played}
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {recentRounds.length}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {lastMatchStats
                    ? `P1: ${lastMatchStats.userScore} | P2: ${lastMatchStats.opponentScore}`
                    : dict.sim_prisoners_dilemma.ready_for_round}
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
                title={dict.simulations.export.csv}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                {dict.simulations.export.csv}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={dict.simulations.export.json}
              >
                <FileJson className="h-3.5 w-3.5 text-blue-600" />
                {dict.simulations.export.json}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                title={dict.simulations.export.copy_report}
              >
                {copiedType === 'report' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">
                      {dict.simulations.export.copied}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    {dict.simulations.export.copy_report}
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
                  <span className="text-slate-400">{dict.simulations.telemetry.trials}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1 text-slate-600">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-bold text-slate-800 tabular-nums">
                    {globalStats.totalRuns.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </span>
                  <span className="text-slate-400">{dict.simulations.telemetry.runs}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                <span>{dict.simulations.telemetry.ready}</span>
              </div>
            )
          }
        >
          <div className="space-y-6">
            {/* Thanh chuyển đổi chế độ */}
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
                  {dict.sim_prisoners_dilemma.mode_duel}
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
                  {dict.sim_prisoners_dilemma.mode_tournament}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs font-mono border-slate-300 text-slate-600"
                >
                  <Sparkles className="mr-1 h-3 w-3 text-amber-500" />
                  {dict.sim_prisoners_dilemma.nash_badge}
                </Badge>
              </div>
            </div>

            {/* Ma trận lợi ích Payoff Matrix */}
            <PayoffMatrixView lastMove1={lastMove1} lastMove2={lastMove2} />

            {/* Đấu trường theo chế độ */}
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
          </div>
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. TITLE NHẬT KÝ & NHẬT KÝ THỰC NGHIỆM */}
      <SimulationSection
        dotColor="emerald"
        title={dict.simulations.history.title}
        subtitle={dict.simulations.history.subtitle}
      >
        <SimulationHistoryTable runs={history} isLoading={false} />
      </SimulationSection>

      {/* 4. TITLE GIẢI THÍCH & GIẢI THÍCH KHOA HỌC */}
      <SimulationSection
        dotColor="blue"
        title={dict.simulations.explainer.title}
        subtitle={dict.simulations.explainer.subtitle}
      >
        <SimulationExplainerCard>
          <StrategyExplainer />
        </SimulationExplainerCard>
      </SimulationSection>
    </div>
  );
}
