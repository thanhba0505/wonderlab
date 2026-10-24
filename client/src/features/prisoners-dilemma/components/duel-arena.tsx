'use client';

import * as React from 'react';
import { Swords, RotateCcw, FastForward, User, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  StrategyId,
  STRATEGIES_LIST,
  getStrategyInfo,
  decideMove,
  calculatePayoffs,
  Move,
  RoundRecord,
} from '../game-theory-math';

interface DuelArenaProps {
  onRoundPlayed?: (record: RoundRecord) => void;
  onMatchFinished?: (p1Score: number, p2Score: number, rounds: RoundRecord[]) => void;
  onMovesChanged?: (move1: Move | null, move2: Move | null) => void;
}

export function DuelArena({ onRoundPlayed, onMatchFinished, onMovesChanged }: DuelArenaProps) {
  const [opponentId, setOpponentId] = React.useState<StrategyId>('tit_for_tat');
  const [totalRounds, setTotalRounds] = React.useState<number>(20);
  const [noiseRate, setNoiseRate] = React.useState<number>(0);

  // Match State
  const [history1, setHistory1] = React.useState<Move[]>([]);
  const [history2, setHistory2] = React.useState<Move[]>([]);
  const [records, setRecords] = React.useState<RoundRecord[]>([]);
  const [score1, setScore1] = React.useState<number>(0);
  const [score2, setScore2] = React.useState<number>(0);

  const opponentInfo = getStrategyInfo(opponentId);
  const currentRound = history1.length;
  const isMatchOver = currentRound >= totalRounds;

  // Reset Duel
  const resetDuel = React.useCallback(() => {
    setHistory1([]);
    setHistory2([]);
    setRecords([]);
    setScore1(0);
    setScore2(0);
    onMovesChanged?.(null, null);
  }, [onMovesChanged]);

  // Execute one round with human move
  const playHumanTurn = (move1: Move) => {
    if (isMatchOver) return;

    // Bot decides its move based on history
    const move2 = decideMove(opponentId, history2, history1, noiseRate);

    const [roundScore1, roundScore2] = calculatePayoffs(move1, move2);
    const newScore1 = score1 + roundScore1;
    const newScore2 = score2 + roundScore2;

    const newRecord: RoundRecord = {
      round: currentRound + 1,
      move1,
      move2,
      score1: roundScore1,
      score2: roundScore2,
      cumulativeScore1: newScore1,
      cumulativeScore2: newScore2,
    };

    const nextH1 = [...history1, move1];
    const nextH2 = [...history2, move2];
    const nextRecords = [...records, newRecord];

    setHistory1(nextH1);
    setHistory2(nextH2);
    setRecords(nextRecords);
    setScore1(newScore1);
    setScore2(newScore2);

    onMovesChanged?.(move1, move2);
    onRoundPlayed?.(newRecord);

    if (nextH1.length >= totalRounds) {
      onMatchFinished?.(newScore1, newScore2, nextRecords);
    }
  };

  // Fast finish remaining rounds using Tit-for-Tat as default player policy or auto-simulation
  const fastFinishMatch = () => {
    const curH1 = [...history1];
    const curH2 = [...history2];
    const curRecords = [...records];
    let curScore1 = score1;
    let curScore2 = score2;

    while (curH1.length < totalRounds) {
      // Default to cooperative/responsive move for human in auto-finish
      const move1 = curH1.length === 0 ? 'C' : curH2[curH2.length - 1];
      const move2 = decideMove(opponentId, curH2, curH1, noiseRate);

      const [r1, r2] = calculatePayoffs(move1, move2);
      curScore1 += r1;
      curScore2 += r2;

      const record: RoundRecord = {
        round: curH1.length + 1,
        move1,
        move2,
        score1: r1,
        score2: r2,
        cumulativeScore1: curScore1,
        cumulativeScore2: curScore2,
      };

      curH1.push(move1);
      curH2.push(move2);
      curRecords.push(record);
    }

    setHistory1(curH1);
    setHistory2(curH2);
    setRecords(curRecords);
    setScore1(curScore1);
    setScore2(curScore2);

    const last = curRecords[curRecords.length - 1];
    if (last) {
      onMovesChanged?.(last.move1, last.move2);
    }
    onMatchFinished?.(curScore1, curScore2, curRecords);
  };

  const coopRate1 = currentRound > 0 ? history1.filter(m => m === 'C').length / currentRound : 0;
  const coopRate2 = currentRound > 0 ? history2.filter(m => m === 'C').length / currentRound : 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-300/85 bg-white p-5 shadow-xs">
      {/* 1. Header: Opponent Selector & Config */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <Swords className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Đấu trường 1-on-1: Thử thách Trí tuệ Nhân tạo
            </h3>
            <p className="text-xs text-slate-500">
              Bạn đối đầu trực tiếp với một trong 7 chiến lược lý thuyết trò chơi kinh điển
            </p>
          </div>
        </div>

        {/* Opponent Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Đối thủ:</span>
          <select
            value={opponentId}
            onChange={e => {
              setOpponentId(e.target.value as StrategyId);
              resetDuel();
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none shadow-2xs"
          >
            {STRATEGIES_LIST.map(strat => (
              <option key={strat.id} value={strat.id}>
                {strat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Opponent Tagline Banner */}
      <div
        className="rounded-xl border p-3 flex items-start gap-3 text-xs leading-relaxed"
        style={{
          borderColor: `${opponentInfo.color}40`,
          backgroundColor: `${opponentInfo.color}10`,
        }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono font-bold text-white text-xs mt-0.5"
          style={{ backgroundColor: opponentInfo.color }}
        >
          {opponentInfo.avatarChar}
        </div>
        <div>
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <span>{opponentInfo.name}</span>
            <Badge variant="outline" className="text-xs font-mono">
              {opponentInfo.tagline}
            </Badge>
          </div>
          <p className="text-slate-600 mt-0.5">{opponentInfo.description}</p>
        </div>
      </div>

      {/* 2. Scoreboard & Round Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center rounded-xl bg-slate-50/80 border border-slate-200/80 p-4">
        {/* Player 1 (You) */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600">
            <User className="h-3.5 w-3.5 text-blue-600" />
            <span>Bạn (Nhà nghiên cứu)</span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-blue-700 tabular-nums">
            {score1}
          </div>
          <div className="text-xs font-mono text-slate-500">
            Tỷ lệ hợp tác: {(coopRate1 * 100).toFixed(0)}%
          </div>
        </div>

        {/* Center Round Status */}
        <div className="space-y-1.5 border-y md:border-y-0 md:border-x border-slate-200 py-3 md:py-0">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            HIỆP ĐẤU
          </span>
          <div className="font-mono text-xl font-bold text-slate-800 tabular-nums">
            {currentRound} / {totalRounds}
          </div>
          {isMatchOver ? (
            <Badge className="bg-emerald-600 text-white font-mono text-xs">VÁN ĐẤU KẾT THÚC</Badge>
          ) : (
            <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
              ĐANG DIỄN RA
            </Badge>
          )}
        </div>

        {/* Player 2 (Bot) */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600">
            <Bot className="h-3.5 w-3.5" style={{ color: opponentInfo.color }} />
            <span>{opponentInfo.shortName}</span>
          </div>
          <div
            className="font-mono text-3xl font-extrabold tabular-nums"
            style={{ color: opponentInfo.color }}
          >
            {score2}
          </div>
          <div className="text-xs font-mono text-slate-500">
            Tỷ lệ hợp tác: {(coopRate2 * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* 3. Action Controls for Human */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Lựa chọn của bạn trong hiệp này:</span>
          {isMatchOver && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              {score1 > score2
                ? 'Bạn chiến thắng!'
                : score1 === score2
                  ? 'Hòa điểm đôi bên!'
                  : 'Đối thủ dẫn điểm!'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Cooperate Button */}
          <button
            type="button"
            disabled={isMatchOver}
            onClick={() => playHumanTurn('C')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              isMatchOver
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100/80 active:scale-[0.98] text-emerald-900 shadow-xs'
            }`}
          >
            <span className="text-xl mb-1">🤝</span>
            <span className="font-heading font-bold text-sm">HỢP TÁC (Cooperate)</span>
            <span className="text-xs font-mono text-emerald-700 mt-0.5">
              Mong muốn đôi bên cùng có lợi (+3)
            </span>
          </button>

          {/* Defect Button */}
          <button
            type="button"
            disabled={isMatchOver}
            onClick={() => playHumanTurn('D')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              isMatchOver
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-rose-500 bg-rose-50 hover:bg-rose-100/80 active:scale-[0.98] text-rose-900 shadow-xs'
            }`}
          >
            <span className="text-xl mb-1">🗡️</span>
            <span className="font-heading font-bold text-sm">PHẢN BỘI (Defect)</span>
            <span className="text-xs font-mono text-rose-700 mt-0.5">
              Cám dỗ ăn trọn điểm (+5) hoặc phòng thủ (+1)
            </span>
          </button>
        </div>
      </div>

      {/* Auxiliary Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fastFinishMatch}
            disabled={isMatchOver}
            className="text-xs font-semibold border-slate-300 text-slate-700"
          >
            <FastForward className="h-3.5 w-3.5 mr-1 text-blue-600" />
            Tự động chơi hết
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetDuel}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Làm lại ván mới
          </Button>
        </div>

        {/* Settings: Rounds & Noise */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Số hiệp:</span>
            {[10, 20, 50].map(r => (
              <button
                key={r}
                onClick={() => {
                  setTotalRounds(r);
                  resetDuel();
                }}
                className={`px-2 py-0.5 rounded border text-xs ${
                  totalRounds === r
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span>Nhiễu:</span>
            {[0, 0.05, 0.1].map(n => (
              <button
                key={n}
                onClick={() => {
                  setNoiseRate(n);
                  resetDuel();
                }}
                className={`px-2 py-0.5 rounded border text-xs ${
                  noiseRate === n
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {(n * 100).toFixed(0)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. History Reel (Băng cuộn lịch sử các hiệp đấu) */}
      {records.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">
            Diễn biến từng hiệp đấu ({records.length} hiệp):
          </span>
          <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
            {records.map((rec, i) => (
              <div
                key={i}
                className="flex flex-col items-center shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-2 text-center min-w-[58px] shadow-2xs font-mono text-xs"
              >
                <span className="text-xs text-slate-400 mb-1">#{rec.round}</span>
                <div className="flex items-center gap-1 font-bold">
                  <span className={rec.move1 === 'C' ? 'text-emerald-600' : 'text-rose-600'}>
                    {rec.move1}
                  </span>
                  <span className="text-slate-300">:</span>
                  <span className={rec.move2 === 'C' ? 'text-emerald-600' : 'text-rose-600'}>
                    {rec.move2}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  +{rec.score1} / +{rec.score2}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
