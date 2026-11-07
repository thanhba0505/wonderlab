'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Compass } from 'lucide-react';

export interface SimulationColumnConfig {
  paramHeader: string;
  metricHeader: string;
  theoryHeader: string;
}

export interface SimulationHistoryFormatter<
  TParams = Record<string, unknown>,
  TResults = Record<string, unknown>,
> {
  columns: SimulationColumnConfig;
  renderParameters: (params: TParams) => React.ReactNode;
  renderEmpiricalResult: (results: TResults, trials: number) => React.ReactNode;
  renderTheoreticalComparison: (params: TParams, results: TResults) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BIRTHDAY PARADOX FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const BirthdayParadoxFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Quy mô nhóm người',
    metricHeader: 'Xác suất trùng thực nghiệm',
    theoryHeader: 'Lý thuyết & Sai lệch Δ',
  },
  renderParameters: params => {
    const groupSize = params?.groupSize ?? params?.n ?? '—';
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-900 font-mono">
          n = {String(groupSize)} người
        </span>
        {params?.userPrediction ? (
          <span className="text-xs text-slate-400">Dự đoán: {String(params.userPrediction)}</span>
        ) : null}
      </div>
    );
  },
  renderEmpiricalResult: (results, trials) => {
    const empRate =
      typeof results?.empiricalProbability === 'number'
        ? results.empiricalProbability
        : typeof results?.empiricalRate === 'number'
          ? results.empiricalRate
          : null;

    if (empRate === null) return <span className="text-slate-400">—</span>;

    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-bold text-blue-700 font-mono">{(empRate * 100).toFixed(2)}%</span>
        <span className="text-xs text-slate-400">
          {trials > 1 ? `${trials.toLocaleString()} nhóm` : '1 mẫu'}
        </span>
      </div>
    );
  },
  renderTheoreticalComparison: (_params, results) => {
    const empRate =
      typeof results?.empiricalProbability === 'number'
        ? results.empiricalProbability
        : typeof results?.empiricalRate === 'number'
          ? results.empiricalRate
          : null;
    const theoRate =
      typeof results?.theoreticalProbability === 'number'
        ? results.theoreticalProbability
        : typeof results?.theoreticalRate === 'number'
          ? results.theoreticalRate
          : null;

    if (theoRate === null) return <span className="text-slate-400">—</span>;

    const delta = empRate !== null ? Math.abs(empRate - theoRate) : null;

    return (
      <div className="flex items-center justify-end gap-1.5 font-mono">
        <span className="text-slate-600">{(theoRate * 100).toFixed(2)}%</span>
        {delta !== null ? (
          <span
            className={`text-xs font-semibold ${
              delta < 0.01 ? 'text-emerald-700' : delta < 0.03 ? 'text-blue-600' : 'text-amber-700'
            }`}
          >
            (Δ {(delta * 100).toFixed(2)}%)
          </span>
        ) : null}
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MONTY HALL FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const MontyHallFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Số cửa & Chiến lược',
    metricHeader: 'Tỷ lệ thắng thực nghiệm',
    theoryHeader: 'Lý thuyết (Đổi 2/3 vs Giữ 1/3)',
  },
  renderParameters: params => {
    const doors = params?.doorsCount ?? 3;
    const strategy = String(params?.strategy ?? '');
    const strategyVi =
      strategy === 'switch'
        ? 'Luôn đổi cửa'
        : strategy === 'stay'
          ? 'Giữ nguyên cửa'
          : 'Monte Carlo hỗn hợp';

    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-900 font-mono">{String(doors)} Cửa</span>
        <span className="text-xs text-slate-500 font-sans">{strategyVi}</span>
      </div>
    );
  },
  renderEmpiricalResult: results => {
    const winRate =
      typeof results?.winRate === 'number'
        ? results.winRate
        : typeof results?.switchWinRate === 'number'
          ? results.switchWinRate
          : null;

    if (winRate === null) return <span className="text-slate-400">—</span>;

    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-bold text-blue-700 font-mono">{(winRate * 100).toFixed(2)}%</span>
        {typeof results?.switchWinRate === 'number' && typeof results?.stayWinRate === 'number' ? (
          <span className="text-xs text-slate-400">
            Đổi: {(results.switchWinRate * 100).toFixed(1)}% | Giữ:{' '}
            {(results.stayWinRate * 100).toFixed(1)}%
          </span>
        ) : null}
      </div>
    );
  },
  renderTheoreticalComparison: (_params, results) => {
    const theo =
      typeof results?.theoreticalProbability === 'number' ? results.theoreticalProbability : 2 / 3;
    const winRate =
      typeof results?.winRate === 'number'
        ? results.winRate
        : typeof results?.switchWinRate === 'number'
          ? results.switchWinRate
          : null;
    const delta = winRate !== null ? Math.abs(winRate - theo) : null;

    return (
      <div className="flex items-center justify-end gap-1.5 font-mono">
        <span className="text-slate-700 font-semibold">{(theo * 100).toFixed(2)}%</span>
        {delta !== null ? (
          <span className="text-xs text-emerald-700 font-semibold">
            (Δ {(delta * 100).toFixed(2)}%)
          </span>
        ) : null}
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. DOUBLE SLIT (LƯỠNG TÍNH SÓNG HẠT) FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const DoubleSlitFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Cấu hình quang học',
    metricHeader: 'Khoảng vân & Dạng quan sát',
    theoryHeader: 'Trạng thái lượng tử',
  },
  renderParameters: params => {
    const lambda = params?.wavelengthNm ?? '—';
    const slitDist = params?.slitDistanceUm ?? '—';
    const isObs = Boolean(params?.isObserverActive);

    return (
      <div className="flex flex-col gap-0.5 font-mono">
        <span className="font-semibold text-slate-900">
          λ = {String(lambda)} nm • d = {String(slitDist)} μm
        </span>
        <span className="text-xs font-sans text-slate-500">
          Người quan sát: {isObs ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
        </span>
      </div>
    );
  },
  renderEmpiricalResult: (results, trials) => {
    const pattern = results?.patternType;
    const isWave = pattern === 'quantum_interference';

    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className={`font-mono font-bold ${isWave ? 'text-blue-700' : 'text-amber-700'}`}>
          {isWave ? 'Giao thoa sóng' : '2 dải sáng cổ điển'}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          {trials.toLocaleString()} hạt tích lũy
        </span>
      </div>
    );
  },
  renderTheoreticalComparison: (params, results) => {
    const isWave = results?.patternType === 'quantum_interference';
    const fringe = params?.fringeSpacingMm;

    return (
      <div className="flex items-center justify-end gap-1.5">
        {isWave ? (
          <Badge
            variant="outline"
            className="border-blue-300 bg-blue-50 text-blue-700 font-mono text-xs"
          >
            <Sparkles className="mr-1 h-3 w-3" />i = {String(fringe)} mm
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 text-amber-700 font-mono text-xs"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Sụp đổ hàm sóng
          </Badge>
        )}
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PRISONERS DILEMMA FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const PrisonersDilemmaFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Chế độ đối kháng',
    metricHeader: 'Điểm số & Tỷ lệ hợp tác',
    theoryHeader: 'Chiến lược / Đánh giá',
  },
  renderParameters: params => {
    const mode = params?.mode === 'tournament' ? 'Giải đấu tiến hóa' : 'Đấu tay đôi 1v1';
    const rounds = params?.totalRounds ?? params?.generation;

    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-900 font-sans">{mode}</span>
        <span className="text-xs font-mono text-slate-500">
          {params?.mode === 'tournament' ? `Thế hệ ${rounds}` : `${rounds} hiệp`}
        </span>
      </div>
    );
  },
  renderEmpiricalResult: results => {
    if (results?.dominantStrategy) {
      const isCoop = Boolean(results.isCooperative);
      return (
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono font-bold text-slate-800">
            {String(results.dominantStrategy).toUpperCase()}
          </span>
          <span className={`text-xs ${isCoop ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isCoop ? 'Xu hướng hợp tác' : 'Xu hướng phản bội'}
          </span>
        </div>
      );
    }

    const p1 = results?.userScore ?? 0;
    const p2 = results?.opponentScore ?? 0;

    return (
      <div className="flex flex-col items-end gap-0.5 font-mono">
        <span className="font-bold text-blue-700">
          Bạn: {String(p1)} • Máy: {String(p2)}
        </span>
        <span className="text-xs text-slate-400">
          {Number(p1) > Number(p2)
            ? 'Thắng điểm'
            : Number(p1) === Number(p2)
              ? 'Hòa bình đẳng'
              : 'Thua điểm'}
        </span>
      </div>
    );
  },
  renderTheoreticalComparison: (_params, results) => {
    if (results?.dominantStrategy) {
      return (
        <div className="flex justify-end">
          <Badge
            variant="outline"
            className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Cân bằng tiến hóa
          </Badge>
        </div>
      );
    }

    const ratio = results?.payoffRatio;
    return (
      <div className="flex justify-end font-mono text-xs text-slate-600">
        Tỷ số điểm: {String(ratio)}
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. ZENO PARADOX FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const ZenoParadoxFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Vận tốc Achilles & Rùa',
    metricHeader: 'Tiến trình hội tụ chuỗi',
    theoryHeader: 'Nghiệm giải tích đuổi kịp',
  },
  renderParameters: params => {
    const vA = params?.achillesSpeed ?? '—';
    const vT = params?.tortoiseSpeed ?? '—';
    const step = params?.subdivisionStep ?? 0;

    return (
      <div className="flex flex-col gap-0.5 font-mono">
        <span className="font-semibold text-slate-900">
          v_A = {String(vA)} m/s • v_T = {String(vT)} m/s
        </span>
        <span className="text-xs text-slate-500 font-sans">Bước phân đoạn thứ {String(step)}</span>
      </div>
    );
  },
  renderEmpiricalResult: results => {
    const conv = results?.cumulativeConvergencePercent;
    return (
      <div className="flex flex-col items-end gap-0.5 font-mono">
        <span className="font-bold text-blue-700">{Number(conv).toFixed(2)}%</span>
        <span className="text-xs text-slate-400">Thời gian tới đích</span>
      </div>
    );
  },
  renderTheoreticalComparison: (_params, results) => {
    const t = results?.overtakeTimeSec;
    const s = results?.overtakeDistanceMeters;

    return (
      <div className="flex flex-col items-end gap-0.5 font-mono text-xs">
        <span className="font-semibold text-emerald-700">t* = {Number(t).toFixed(2)} s</span>
        <span className="text-slate-500">S* = {Number(s).toFixed(1)} m</span>
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. ART GALLERY FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const ArtGalleryFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Hình dạng phòng đa giác',
    metricHeader: 'Người gác & Tầm nhìn',
    theoryHeader: 'Cận Chvátal ⌊n/3⌋',
  },
  renderParameters: params => {
    const n = params?.numVertices ?? '—';
    const preset = String(params?.preset ?? 'Tự do');

    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-900 font-mono">n = {String(n)} đỉnh</span>
        <span className="text-xs text-slate-500 capitalize">{preset}</span>
      </div>
    );
  },
  renderEmpiricalResult: results => {
    const cov = results?.coveragePercentage;
    const isFull = Number(cov) >= 99.5;

    return (
      <div className="flex flex-col items-end gap-0.5 font-mono">
        <span className={`font-bold ${isFull ? 'text-emerald-700' : 'text-amber-700'}`}>
          {Number(cov).toFixed(1)}% diện tích
        </span>
        <span className="text-xs text-slate-400">
          {isFull ? 'Bao phủ toàn bộ' : 'Còn góc khuất'}
        </span>
      </div>
    );
  },
  renderTheoreticalComparison: params => {
    const bound = params?.chvatalBound;
    const used = params?.guardsUsed;
    const isOptimal = Number(used) <= Number(bound);

    return (
      <div className="flex justify-end">
        <Badge
          variant="outline"
          className={`text-xs font-mono ${
            isOptimal
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-slate-300 bg-slate-50 text-slate-700'
          }`}
        >
          <ShieldCheck className="mr-1 h-3 w-3" />
          {String(used)}/{String(bound)} lính ({isOptimal ? 'Tối ưu' : 'Vượt cận'})
        </Badge>
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. PRISONERS HATS FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const PrisonersHatsFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Quy mô tù nhân & Màu mũ',
    metricHeader: 'Tỷ lệ sống sót thực tế',
    theoryHeader: 'Cận lý thuyết (n-1)/n',
  },
  renderParameters: params => {
    const n = params?.n ?? '—';
    const c = params?.colorCount ?? 2;

    return (
      <div className="flex flex-col gap-0.5 font-mono">
        <span className="font-semibold text-slate-900">n = {String(n)} tù nhân</span>
        <span className="text-xs font-sans text-slate-500">{String(c)} màu mũ</span>
      </div>
    );
  },
  renderEmpiricalResult: results => {
    const correct = results?.correctCount;
    const rate = results?.survivalRate;

    return (
      <div className="flex flex-col items-end gap-0.5 font-mono">
        <span className="font-bold text-emerald-700">
          {(Number(rate) * 100).toFixed(1)}% sống sót
        </span>
        <span className="text-xs text-slate-400">{String(correct)} người đoán đúng</span>
      </div>
    );
  },
  renderTheoreticalComparison: params => {
    const n = Number(params?.n) || 10;
    const bound = ((n - 1) / n) * 100;

    return (
      <div className="flex justify-end font-mono text-xs">
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
          ≥ {bound.toFixed(1)}% (Chiến lược Parity)
        </Badge>
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. BODYGUARD PROBLEM FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const BodyguardProblemFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Tọa độ Nguồn A & Đích B',
    metricHeader: 'Vệ sĩ G & Tỷ lệ chặn tia',
    theoryHeader: 'Định lý Eugene Gutkin',
  },
  renderParameters: params => {
    const srcX = typeof params?.sourceX === 'number' ? params.sourceX.toFixed(2) : '—';
    const srcY = typeof params?.sourceY === 'number' ? params.sourceY.toFixed(2) : '—';
    const tgtX = typeof params?.targetX === 'number' ? params.targetX.toFixed(2) : '—';
    const tgtY = typeof params?.targetY === 'number' ? params.targetY.toFixed(2) : '—';

    return (
      <div className="flex flex-col gap-0.5 font-mono">
        <span className="font-semibold text-slate-900">
          A({srcX}, {srcY}) → B({tgtX}, {tgtY})
        </span>
        <span className="text-xs font-sans text-slate-500 capitalize">
          {String(params?.preset ?? 'generic')}
        </span>
      </div>
    );
  },
  renderEmpiricalResult: results => {
    const rate = results?.protectionRate ?? 100;
    const blocked = results?.blockedRays ?? 0;
    const total = results?.totalRays ?? 0;

    return (
      <div className="flex flex-col items-end gap-0.5 font-mono">
        <span className="font-bold text-emerald-700">{Number(rate).toFixed(1)}% chặn</span>
        <span className="text-xs text-slate-400">
          {String(blocked)}/{String(total)} tia triệt tiêu
        </span>
      </div>
    );
  },
  renderTheoreticalComparison: params => {
    const guards = params?.guardsCount ?? 16;
    return (
      <div className="flex justify-end">
        <Badge
          variant="outline"
          className="border-emerald-300 bg-emerald-50 text-emerald-800 font-mono text-xs"
        >
          <Compass className="mr-1 h-3 w-3" />
          |G| = {String(guards)} ≤ 16
        </Badge>
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. ANTS ON A STICK FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const AntsOnAStickFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Quy mô đàn kiến & Kịch bản',
    metricHeader: 'Thời gian kết thúc & Va chạm',
    theoryHeader: 'Cận lý thuyết T_max',
  },
  renderParameters: params => {
    const antCount = params?.antCount ?? 10;
    const preset = typeof params?.preset === 'string' ? params.preset : 'default-10';
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-900 font-mono">
          N = {String(antCount)} con kiến
        </span>
        <span className="text-xs text-slate-500 font-mono">Kịch bản: {preset}</span>
      </div>
    );
  },
  renderEmpiricalResult: (results, trials) => {
    const duration = typeof results?.duration === 'number' ? results.duration : null;
    const collisions =
      typeof results?.totalCollisions === 'number' ? results.totalCollisions : null;

    if (duration === null) return <span className="text-slate-400">—</span>;

    return (
      <div className="flex flex-col items-end gap-0.5 font-mono">
        <span className="font-bold text-amber-700 font-mono">{duration.toFixed(2)}s</span>
        <span className="text-xs text-slate-500">
          {collisions !== null ? `${collisions} va chạm` : `${trials} lượt`}
        </span>
      </div>
    );
  },
  renderTheoreticalComparison: (_params, results) => {
    const duration = typeof results?.duration === 'number' ? results.duration : null;

    if (duration === null) return <span className="text-slate-400">—</span>;

    const satisfiesTheorem = duration <= 100.01;

    return (
      <div className="flex justify-end">
        {satisfiesTheorem ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 font-mono text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1 inline" />T ≤ 100s (Hợp lệ)
          </Badge>
        ) : (
          <Badge className="bg-red-50 text-red-700 border-red-300 font-mono text-xs">
            <AlertTriangle className="h-3 w-3 mr-1 inline" />
            Vượt cận T_max
          </Badge>
        )}
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC FALLBACK FORMATTER
// ─────────────────────────────────────────────────────────────────────────────
const GenericFallbackFormatter: SimulationHistoryFormatter = {
  columns: {
    paramHeader: 'Tham số đầu vào',
    metricHeader: 'Kết quả đo lường',
    theoryHeader: 'Đánh giá trạng thái',
  },
  renderParameters: params => {
    const entries = Object.entries(params || {}).slice(0, 2);
    return (
      <div className="flex flex-col gap-0.5 font-mono text-xs text-slate-700">
        {entries.map(([k, v]) => (
          <span key={k}>
            {k}: {String(v)}
          </span>
        ))}
      </div>
    );
  },
  renderEmpiricalResult: (results, trials) => {
    return (
      <div className="flex flex-col items-end gap-0.5 font-mono text-xs">
        <span className="font-bold text-blue-700">Hoàn tất</span>
        <span className="text-slate-400">{trials.toLocaleString()} lượt</span>
      </div>
    );
  },
  renderTheoreticalComparison: () => {
    return (
      <div className="flex justify-end">
        <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700 text-xs">
          Ghi nhận thành công
        </Badge>
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY MAPPER
// ─────────────────────────────────────────────────────────────────────────────
export function getSimulationHistoryFormatter(simulationSlug: string): SimulationHistoryFormatter {
  switch (simulationSlug) {
    case 'birthday-paradox':
      return BirthdayParadoxFormatter;
    case 'monty-hall':
      return MontyHallFormatter;
    case 'double-slit':
      return DoubleSlitFormatter;
    case 'prisoners-dilemma':
      return PrisonersDilemmaFormatter;
    case 'zeno-paradox':
      return ZenoParadoxFormatter;
    case 'art-gallery':
      return ArtGalleryFormatter;
    case 'prisoners-hats':
      return PrisonersHatsFormatter;
    case 'bodyguard-problem':
      return BodyguardProblemFormatter;
    case 'ants-on-a-stick':
      return AntsOnAStickFormatter;
    default:
      return GenericFallbackFormatter;
  }
}
