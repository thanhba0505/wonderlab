'use client';

import * as React from 'react';
import {
  Point,
  BodyguardPreset,
  BODYGUARD_PRESETS,
  calculateBodyguardPoints,
  simulateTargetedRicochets,
  simulateRaySweep,
  traceRay,
} from './bodyguard-math';
import {
  RoomCanvas,
  UnfoldingCanvas,
  ControlDeck,
  TelemetryPanel,
  BodyguardExplainer,
} from './components';
import { ViewMode, RayMode } from './components/control-deck';
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
import {
  exportToCsv,
  exportToJson,
  copyToClipboard,
} from '@/features/simulations/utils/export-data';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileJson, Copy, Check } from 'lucide-react';

export function BodyguardSimulation(): React.JSX.Element {
  const { dict } = useTranslation();
  const meta = useSimulationMeta('bodyguard-problem');

  // Simulation Parameters
  const [activePresetId, setActivePresetId] = React.useState<string>('generic');
  const [source, setSource] = React.useState<Point>(BODYGUARD_PRESETS[0]!.source);
  const [target, setTarget] = React.useState<Point>(BODYGUARD_PRESETS[0]!.target);
  const [showGuards, setShowGuards] = React.useState<boolean>(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>('dual');
  const [rayMode, setRayMode] = React.useState<RayMode>('targeted');
  const [maxBounces, setMaxBounces] = React.useState<number>(25);
  const [rayCount, setRayCount] = React.useState<number>(72);
  const [manualAngle, setManualAngle] = React.useState<number>(45);
  const [copiedType, setCopiedType] = React.useState<'report' | null>(null);

  // Intuition Challenge State
  const [, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);

  // Telemetry Session Logging
  const { history, recordRun, isSyncing } = useSimulationTelemetry('bodyguard-problem');

  // Compute bodyguard positions whenever source or target moves
  const guards = React.useMemo(() => {
    return calculateBodyguardPoints(source, target);
  }, [source, target]);

  // Compute rays based on current ray mode
  const simulationResults = React.useMemo(() => {
    const activeGuards = showGuards ? guards : [];
    if (rayMode === 'targeted') {
      return simulateTargetedRicochets(source, target, activeGuards, maxBounces, 0.022);
    }

    if (rayMode === 'sweep360') {
      const sweep = simulateRaySweep(source, target, activeGuards, rayCount, maxBounces, 0.022);
      return {
        rays: sweep.rays,
        totalTargeted: sweep.raysTargetHit + sweep.raysBlocked,
        blockedCount: sweep.raysBlocked,
        hitCount: sweep.raysTargetHit,
        protectionRate: sweep.protectionRate,
      };
    }

    // Manual ray mode
    const rad = (manualAngle * Math.PI) / 180;
    const manualResult = traceRay(
      source,
      { dx: Math.cos(rad), dy: Math.sin(rad) },
      target,
      activeGuards,
      maxBounces,
      0.022,
    );
    const blocked = manualResult.blockedByGuard ? 1 : 0;
    const hit = manualResult.hitTarget ? 1 : 0;
    return {
      rays: [manualResult],
      totalTargeted: blocked + hit,
      blockedCount: blocked,
      hitCount: hit,
      protectionRate: blocked + hit > 0 ? (blocked / (blocked + hit)) * 100 : 100,
    };
  }, [source, target, guards, showGuards, rayMode, maxBounces, rayCount, manualAngle]);

  // Record session telemetry whenever 100% protection is activated
  const hasRecordedRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    if (showGuards && guards.length > 0 && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      recordRun(
        {
          preset: activePresetId,
          sourceX: source.x,
          sourceY: source.y,
          targetX: target.x,
          targetY: target.y,
          guardsCount: guards.length,
          maxBounces,
        },
        {
          protectionRate: simulationResults.protectionRate,
          blockedRays: simulationResults.blockedCount,
          totalRays: simulationResults.totalTargeted,
          status: 'fully-protected',
        },
        1,
      );
    } else if (!showGuards) {
      hasRecordedRef.current = false;
    }
  }, [
    showGuards,
    guards.length,
    activePresetId,
    source,
    target,
    maxBounces,
    simulationResults.protectionRate,
    simulationResults.blockedCount,
    simulationResults.totalTargeted,
    recordRun,
  ]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: BodyguardPreset) => {
    setActivePresetId(preset.id);
    setSource(preset.source);
    setTarget(preset.target);
  };

  // Handle Reset
  const handleReset = () => {
    const generic = BODYGUARD_PRESETS[0]!;
    setActivePresetId('generic');
    setSource(generic.source);
    setTarget(generic.target);
    setShowGuards(true);
    setViewMode('dual');
    setRayMode('targeted');
    setMaxBounces(25);
  };

  // Handle Reload from History
  const handleReloadParameters = (params: Record<string, unknown>) => {
    if (typeof params['sourceX'] === 'number' && typeof params['sourceY'] === 'number') {
      setSource({ x: params['sourceX'], y: params['sourceY'] });
    }
    if (typeof params['targetX'] === 'number' && typeof params['targetY'] === 'number') {
      setTarget({ x: params['targetX'], y: params['targetY'] });
    }
    if (typeof params['maxBounces'] === 'number') {
      setMaxBounces(params['maxBounces']);
    }
    setShowGuards(true);
  };

  // Export handlers
  const handleExportCsv = () => {
    const headers = [
      'Mã Vệ Sĩ',
      'Tọa Độ X',
      'Tọa Độ Y',
      'Nguồn X',
      'Nguồn Y',
      'Mục Tiêu X',
      'Mục Tiêu Y',
      'Trạng Thái Vệ Sĩ',
      'Tỷ Lệ Chặn',
    ];
    const rows = guards.map((g, idx) => [
      `G${idx + 1}`,
      g.x,
      g.y,
      source.x,
      source.y,
      target.x,
      target.y,
      showGuards ? 'BẬT' : 'TẮT',
      `${simulationResults.protectionRate.toFixed(1)}%`,
    ]);
    exportToCsv('bodyguard-problem-simulation.csv', headers, rows);
  };

  const handleExportJson = () => {
    const payload = {
      simulation: 'bodyguard-problem',
      preset: activePresetId,
      source,
      target,
      guardsCount: guards.length,
      guards,
      protectionRate: simulationResults.protectionRate,
      historyRunsCount: history.length,
    };
    exportToJson('bodyguard-problem-data.json', payload);
  };

  const handleCopyReport = async () => {
    const report = `# Báo Cáo Thí Nghiệm: Bài Toán Vệ Sĩ & Phòng Gương
- **Nguồn sáng A**: (${source.x.toFixed(4)}, ${source.y.toFixed(4)})
- **Mục tiêu B**: (${target.x.toFixed(4)}, ${target.y.toFixed(4)})
- **Số vệ sĩ tính toán**: ${guards.length} điểm
- **Trạng thái vệ sĩ**: ${showGuards ? 'ĐANG BẬT (Bảo vệ 100%)' : 'ĐANG TẮT'}
- **Tỷ lệ triệt tiêu tia**: ${simulationResults.protectionRate.toFixed(1)}% (${simulationResults.blockedCount}/${simulationResults.totalTargeted} tia)
- **Tọa độ các điểm vệ sĩ**:
${guards.map((g, i) => `  - G${i + 1}: (${g.x.toFixed(4)}, ${g.y.toFixed(4)})`).join('\n')}
`;
    await copyToClipboard(report);
    setCopiedType('report');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. KHẢO SÁT DỰ ĐOÁN TRỰC GIÁC */}
      {meta?.hypothesis && (
        <SimulationSection
          dotColor="amber"
          title={dict.sim_bodyguard.survey_title}
          subtitle={dict.sim_bodyguard.survey_desc}
        >
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug="bodyguard-problem"
            onPredictionSelected={(option: HypothesisOption, gap: number) => {
              setUserPrediction({ option, gap });
            }}
          />
        </SimulationSection>
      )}

      {/* 2. BÀN THỰC NGHIỆM TƯƠNG TÁC QUANG HỌC */}
      <SimulationSection
        dotColor="emerald"
        title={dict.sim_bodyguard.sim_title}
        subtitle={dict.sim_bodyguard.sim_desc}
      >
        <SimulationWorkbenchCard
          tools={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-8 border-slate-300 text-xs"
              >
                <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                {dict.simulations.export.csv}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-8 border-slate-300 text-xs"
              >
                <FileJson className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                {dict.simulations.export.json}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                className="h-8 border-slate-300 text-xs"
              >
                {copiedType === 'report' ? (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                )}
                {copiedType === 'report' ? 'Đã sao chép' : dict.simulations.export.copy_report}
              </Button>
            </div>
          }
          telemetry={
            <div className="flex items-center gap-3">
              <span>Định lý Gutkin (2005): |G| ≤ 16</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">
                {showGuards ? 'Bảo Vệ Hoàn Toàn' : 'Mục Tiêu Bị Lộ Sáng'}
              </span>
            </div>
          }
        >
          {/* Bảng điều khiển tham số */}
          <ControlDeck
            source={source}
            target={target}
            guardsCount={guards.length}
            showGuards={showGuards}
            setShowGuards={setShowGuards}
            viewMode={viewMode}
            setViewMode={setViewMode}
            rayMode={rayMode}
            setRayMode={setRayMode}
            maxBounces={maxBounces}
            setMaxBounces={setMaxBounces}
            rayCount={rayCount}
            setRayCount={setRayCount}
            manualAngle={manualAngle}
            setManualAngle={setManualAngle}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
            onReset={handleReset}
          />

          {/* Vùng hiển thị Canvas theo View Mode */}
          {viewMode === 'dual' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700">
                  Phòng Gương Thực Tế [0, 1]² (Tia Phản Xạ Gấp Khúc)
                </span>
                <RoomCanvas
                  source={source}
                  target={target}
                  guards={showGuards ? guards : []}
                  rays={simulationResults.rays}
                  showGuards={showGuards}
                  onSourceMove={setSource}
                  onTargetMove={setTarget}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700">
                  Lưới Trải Phẳng Vô Hạn 5×5 (Tia Thẳng & Trung Điểm)
                </span>
                <UnfoldingCanvas
                  source={source}
                  target={target}
                  guards={showGuards ? guards : []}
                  showGuards={showGuards}
                />
              </div>
            </div>
          )}

          {viewMode === 'room' && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700">
                Căn Phòng Gương Thực Tế [0, 1]² (Tia Phản Xạ Gấp Khúc)
              </span>
              <RoomCanvas
                source={source}
                target={target}
                guards={showGuards ? guards : []}
                rays={simulationResults.rays}
                showGuards={showGuards}
                onSourceMove={setSource}
                onTargetMove={setTarget}
                className="w-full max-w-[620px]"
              />
            </div>
          )}

          {viewMode === 'unfolded' && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700">
                Lưới Trải Phẳng Vô Hạn 5×5 (Tia Thẳng & Trung Điểm Bảo Vệ)
              </span>
              <UnfoldingCanvas
                source={source}
                target={target}
                guards={showGuards ? guards : []}
                showGuards={showGuards}
                className="w-full max-w-[620px]"
              />
            </div>
          )}

          {/* Telemetry & Bảng đo đạc */}
          <TelemetryPanel
            source={source}
            target={target}
            guards={guards}
            showGuards={showGuards}
            blockedCount={simulationResults.blockedCount}
            totalTargetedRays={simulationResults.totalTargeted}
            protectionRate={simulationResults.protectionRate}
          />
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. GIẢI MÃ BẢN CHẤT TOÁN HỌC & ĐỊNH LÝ GUTKIN */}
      <SimulationSection
        dotColor="blue"
        title={dict.sim_bodyguard.explainer_title}
        subtitle={dict.sim_bodyguard.explainer_desc}
      >
        <SimulationExplainerCard>
          <BodyguardExplainer />
        </SimulationExplainerCard>
      </SimulationSection>

      {/* 4. NHẬT KÝ LƯỢT CHẠY THỰC NGHIỆM */}
      <SimulationSection
        dotColor="indigo"
        title={dict.simulations.history.title}
        subtitle={dict.simulations.history.subtitle}
      >
        <SimulationHistoryTable
          runs={history}
          isLoading={isSyncing}
          onReloadParams={handleReloadParameters}
        />
      </SimulationSection>
    </div>
  );
}
