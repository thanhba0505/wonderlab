'use client';

import * as React from 'react';
import {
  QuantumParameters,
  DEFAULT_QUANTUM_PARAMS,
  sampleHitPosition,
  sampleBatchHits,
  calculateIntensity,
} from './quantum-math';
import { SlitVisualizer } from './components/slit-visualizer';
import { ControlsPanel } from './components/controls-panel';
import { IntensityChart } from './components/intensity-chart';
import { QuantumExplainer } from './components/quantum-explainer';
import {
  SimulationSection,
  SimulationWorkbenchCard,
  SimulationExplainerCard,
  SimulationHistoryTable,
  IntuitionChallengeCard,
} from '@/features/simulations/components';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { getSimulationBySlug } from '@/features/simulations/registry';
import { HypothesisOption } from '@/features/simulations/types';
import {
  exportToCsv,
  exportToJson,
  copyToClipboard,
} from '@/features/simulations/utils/export-data';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileJson, Copy, Check, Database, Sparkles, Activity } from 'lucide-react';

export function DoubleSlitSimulation() {
  const meta = getSimulationBySlug('double-slit');
  const [params, setParams] = React.useState<QuantumParameters>(DEFAULT_QUANTUM_PARAMS);
  const [hits, setHits] = React.useState<number[]>([]);
  const [lastHitY, setLastHitY] = React.useState<number | null>(null);
  const [isStreaming, setIsStreaming] = React.useState<boolean>(false);
  const [copiedType, setCopiedType] = React.useState<'report' | null>(null);

  // Intuition Challenge State
  const [, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);

  // Background Telemetry Hook
  const { history, globalStats, recordRun } = useSimulationTelemetry('double-slit');

  // Sync parameters with URL if present
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const obsParam = urlParams.get('observer');
    if (obsParam === '1' || obsParam === 'true') {
      setParams(p => ({ ...p, isObserverActive: true }));
    }
  }, []);

  // Update URL search params
  const updateUrlParam = (isObs: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (isObs) {
        url.searchParams.set('observer', '1');
      } else {
        url.searchParams.delete('observer');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore
    }
  };

  const handleParamsChange = (updater: (prev: QuantumParameters) => QuantumParameters) => {
    setParams(prev => {
      const next = updater(prev);
      if (next.isObserverActive !== prev.isObserverActive) {
        updateUrlParam(next.isObserverActive);
      }
      return next;
    });
  };

  // Fire 1 Single Photon
  const handleFireSingle = React.useCallback(() => {
    const y = sampleHitPosition(params, 0.05);
    setHits(prev => [...prev, y]);
    setLastHitY(y);
  }, [params]);

  // Fire Fast Burst
  const handleFireBurst = React.useCallback(
    (count: number) => {
      const batch = sampleBatchHits(count, params, 0.05);
      const newHitsArray = Array.from(batch);

      setHits(prev => [...prev, ...newHitsArray]);
      setLastHitY(newHitsArray[newHitsArray.length - 1]);

      recordRun(
        {
          wavelengthNm: Math.round(params.wavelength * 1e9),
          slitDistanceUm: Math.round(params.slitDistance * 1e6),
          screenDistanceM: params.screenDistance,
          isObserverActive: params.isObserverActive,
          fringeSpacingMm: parseFloat(
            ((params.wavelength * params.screenDistance * 1000) / params.slitDistance).toFixed(2),
          ),
        },
        {
          patternType: params.isObserverActive ? 'classical_two_stripes' : 'quantum_interference',
          totalAccumulatedHits: hits.length + count,
        },
        count,
        45,
      );
    },
    [params, hits.length, recordRun],
  );

  // Streaming Interval
  React.useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const batch = sampleBatchHits(15, params, 0.05);
      const newHits = Array.from(batch);
      setHits(prev => [...prev, ...newHits]);
      setLastHitY(newHits[newHits.length - 1]);
    }, 80);

    return () => clearInterval(interval);
  }, [isStreaming, params]);

  // Reset Screen
  const handleReset = React.useCallback(() => {
    setIsStreaming(false);
    setHits([]);
    setLastHitY(null);
  }, []);

  const handleExportCsv = () => {
    const headers = ['Trial_ID', 'Hit_Position_mm', 'Intensity', 'Wavelength_nm', 'Observer_Mode'];
    const rows = hits
      .slice(-500)
      .map((y, idx) => [
        idx + 1,
        (y * 1000).toFixed(2),
        calculateIntensity(y, params).toFixed(4),
        Math.round(params.wavelength * 1e9),
        params.isObserverActive ? 'BẬT (Cổ điển)' : 'TẮT (Giao thoa)',
      ]);
    exportToCsv('wonderlab-double-slit-hits.csv', headers, rows);
  };

  const handleExportJson = () => {
    const data = {
      simulation: 'double-slit',
      exportedAt: new Date().toISOString(),
      parameters: {
        wavelengthNm: Math.round(params.wavelength * 1e9),
        slitDistanceUm: Math.round(params.slitDistance * 1e6),
        screenDistanceM: params.screenDistance,
        isObserverActive: params.isObserverActive,
      },
      results: {
        totalHits: hits.length,
        state: params.isObserverActive ? 'Hạt cổ điển (Đo lường)' : 'Sóng giao thoa (Chồng chập)',
      },
      recentHits: hits.slice(-200),
      runs: history,
    };
    exportToJson('wonderlab-double-slit-data.json', data);
  };

  const handleCopyReport = async () => {
    const report = `# Báo Cáo Thực Nghiệm: Thí nghiệm Hai khe Young
- **Tổng số hạt đã bắn**: ${hits.length}
- **Trạng thái quan sát (Observer)**: ${params.isObserverActive ? 'BẬT (Cổ điển, mất vân giao thoa)' : 'TẮT (Chồng chập lượng tử, xuất hiện vân sáng tối)'}
- **Bước sóng quang học**: ${Math.round(params.wavelength * 1e9)} nm
- **Khoảng cách 2 khe**: ${Math.round(params.slitDistance * 1e6)} µm
- **Khoảng cách tới màn**: ${params.screenDistance} m
- **Khoảng vân lý thuyết**: ${((params.wavelength * params.screenDistance * 1000) / params.slitDistance).toFixed(2)} mm`;
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
            simulationSlug="double-slit"
            onPredictionSelected={(option: HypothesisOption, gap: number) => {
              setUserPrediction({ option, gap });
            }}
          />
        )}
      </SimulationSection>

      {/* 2. TITLE CHỖ THÍ NGHIỆM & BLOCK THÍ NGHIỆM HỢP NHẤT */}
      <SimulationSection
        dotColor="blue"
        title="Buồng Thí Nghiệm & Mô Phỏng Trực Quan"
        subtitle="Màn hứng giao thoa photon, máy đo quan sát khe hẹp và biểu đồ mật độ quang học"
      >
        <SimulationWorkbenchCard
          metricsBar={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pb-5 border-b border-slate-200/80">
              <div className="space-y-1">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Tổng hạt đã bắn
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {hits.length.toLocaleString('vi-VN')}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {isStreaming ? 'Đang bắn liên tục...' : 'Sẵn sàng bắn'}
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Trạng thái quan sát
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold pt-0.5 text-slate-900">
                  {params.isObserverActive ? (
                    <span className="text-rose-600">BẬT (Hạt cổ điển)</span>
                  ) : (
                    <span className="text-blue-600">TẮT (Giao thoa sóng)</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {params.isObserverActive ? 'Hàm sóng đã sụp đổ' : 'Chồng chập 2 khe'}
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Bước sóng ánh sáng (&lambda;)
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {Math.round(params.wavelength * 1e9)}{' '}
                  <span className="text-xs font-sans text-slate-400">nm</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  D = {params.screenDistance} m tới màn
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:border-l sm:border-slate-200/80 sm:pl-4">
                <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Khoảng cách 2 khe (d)
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {Math.round(params.slitDistance * 1e6)}{' '}
                  <span className="text-xs font-sans text-slate-400">&micro;m</span>
                </div>
                <div className="text-xs text-blue-700 font-mono">
                  Khoảng vân i ={' '}
                  {(
                    (params.wavelength * params.screenDistance * 1000) /
                    params.slitDistance
                  ).toFixed(2)}{' '}
                  mm
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
                  <span className="text-slate-400">hạt</span>
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
          <div className="space-y-6">
            <SlitVisualizer
              params={params}
              hits={hits}
              lastHitY={lastHitY}
              isStreaming={isStreaming}
              totalHits={hits.length}
            />

            <ControlsPanel
              params={params}
              onParamsChange={handleParamsChange}
              onFireSingle={handleFireSingle}
              onFireBurst={handleFireBurst}
              onReset={handleReset}
              isStreaming={isStreaming}
              onToggleStream={() => setIsStreaming(s => !s)}
              totalHits={hits.length}
            />

            <IntensityChart params={params} hits={hits} />
          </div>
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. TITLE NHẬT KÝ & NHẬT KÝ THỰC NGHIỆM */}
      <SimulationSection
        dotColor="emerald"
        title="Nhật Ký Thực Nghiệm"
        subtitle="Bảng lưu trữ chi tiết các lượt bắn và kết quả thực nghiệm trong phiên nghiên cứu"
      >
        <SimulationHistoryTable runs={history} isLoading={false} />
      </SimulationSection>

      {/* 4. TITLE GIẢI THÍCH & GIẢI THÍCH KHOA HỌC */}
      <SimulationSection
        dotColor="blue"
        title="Giải Thích Khoa Học & Bản Chất Toán Học"
        subtitle="Giải mã nghịch lý đo lường, tính lưỡng tính sóng - hạt và sự sụp đổ hàm sóng lượng tử"
      >
        <SimulationExplainerCard>
          <QuantumExplainer />
        </SimulationExplainerCard>
      </SimulationSection>
    </div>
  );
}
