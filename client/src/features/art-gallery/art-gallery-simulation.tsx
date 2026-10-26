'use client';

import * as React from 'react';
import {
  Point,
  computeFiskProof,
  calculateCoveragePercentage,
  generateRandomPolygon,
  GALLERY_PRESETS,
  PolygonPreset,
} from './art-gallery-math';
import {
  GalleryCanvas,
  GalleryControls,
  FiskStepper,
  GalleryMetrics,
  GalleryExplainer,
} from './components';
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
import { FileSpreadsheet, FileJson, Copy, Check } from 'lucide-react';

export function ArtGallerySimulation() {
  const meta = getSimulationBySlug('art-gallery');

  const [polygon, setPolygon] = React.useState<Point[]>(GALLERY_PRESETS[0]!.vertices);
  const [currentPresetId, setCurrentPresetId] = React.useState<string | null>('chvatal-comb-3');
  const [guards, setGuards] = React.useState<Point[]>([]);
  const [isVertexOnlyMode, setIsVertexOnlyMode] = React.useState<boolean>(true);
  const [fiskStep, setFiskStep] = React.useState<number>(0);
  const [copiedType, setCopiedType] = React.useState<'report' | null>(null);

  // Intuition Challenge State
  const [, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);

  // Background Telemetry Hook
  const { history, recordRun } = useSimulationTelemetry('art-gallery');

  // Compute Steve Fisk's 3-Coloring and Triangulation
  const fiskProof = React.useMemo(() => {
    return computeFiskProof(polygon);
  }, [polygon]);

  // Compute live coverage percentage
  const coveragePercentage = React.useMemo(() => {
    return calculateCoveragePercentage(guards, polygon);
  }, [guards, polygon]);

  // Record telemetry when user achieves 100% coverage
  const hasRecordedRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    if (coveragePercentage >= 99.5 && guards.length > 0 && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      recordRun(
        {
          numVertices: polygon.length,
          guardsUsed: guards.length,
          chvatalBound: Math.floor(polygon.length / 3),
          preset: currentPresetId ?? 'random',
        },
        {
          coveragePercentage,
          status: 'full-coverage',
        },
        1,
      );
    } else if (coveragePercentage < 95) {
      hasRecordedRef.current = false;
    }
  }, [coveragePercentage, guards.length, polygon.length, currentPresetId, recordRun]);

  // Handlers
  const handleAddGuard = (point: Point) => {
    setGuards(prev => [...prev, point]);
  };

  const handleRemoveGuard = (index: number) => {
    if (index === -1) {
      setGuards([]);
    } else {
      setGuards(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSelectPreset = (preset: PolygonPreset) => {
    setPolygon(preset.vertices);
    setCurrentPresetId(preset.id);
    setGuards([]);
    setFiskStep(0);
  };

  const handleGenerateRandom = (numVertices: number) => {
    const newPoly = generateRandomPolygon(numVertices);
    setPolygon(newPoly);
    setCurrentPresetId(null);
    setGuards([]);
    setFiskStep(0);
  };

  const handleApplyFiskGuards = () => {
    const fiskGuards = fiskProof.guardVertexIndices.map(idx => polygon[idx]!);
    setGuards(fiskGuards);
    setFiskStep(4); // Move stepper to 100% verified step
  };

  const handleReset = () => {
    setPolygon(GALLERY_PRESETS[0]!.vertices);
    setCurrentPresetId('chvatal-comb-3');
    setGuards([]);
    setFiskStep(0);
  };

  // Sync Fisk step with canvas visual layers
  const showTriangulation = fiskStep >= 1;
  const showColoring = fiskStep >= 2;

  // Handle Stepper Change
  const handleStepChange = (newStep: number) => {
    setFiskStep(newStep);
    if (newStep === 3 || newStep === 4) {
      // Auto-place Fisk guards on step 3 and 4
      const fiskGuards = fiskProof.guardVertexIndices.map(idx => polygon[idx]!);
      setGuards(fiskGuards);
    }
  };

  // Export handlers
  const handleExportCsv = () => {
    const headers = [
      'Guard_Index',
      'Position_X',
      'Position_Y',
      'Polygon_Vertices',
      'Chvatal_Bound',
      'Coverage_Pct',
    ];
    const rows = guards.map((g, idx) => [
      `G${idx + 1}`,
      g.x,
      g.y,
      polygon.length,
      Math.floor(polygon.length / 3),
      coveragePercentage,
    ]);
    exportToCsv('wonderlab-art-gallery-data.csv', headers, rows);
  };

  const handleExportJson = () => {
    const data = {
      simulation: 'art-gallery',
      timestamp: new Date().toISOString(),
      numVertices: polygon.length,
      chvatalBound: Math.floor(polygon.length / 3),
      coveragePercentage,
      polygon,
      guards,
      fiskProof: {
        trianglesCount: fiskProof.triangles.length,
        optimalColorGuardsCount: fiskProof.guardVertexIndices.length,
        colorCounts: fiskProof.colorCounts,
      },
    };
    exportToJson('wonderlab-art-gallery-data.json', data);
  };

  const handleCopyReport = async () => {
    const report = `# Báo Cáo Thực Nghiệm: Bài toán Người gác Phòng trưng bày (Art Gallery Problem)
- **Số đỉnh căn phòng (n)**: ${polygon.length} đỉnh
- **Ngưỡng định lý Chvátal (⌊n/3⌋)**: ${Math.floor(polygon.length / 3)} lính gác
- **Số người gác thực tế đang bố trí**: ${guards.length} lính gác
- **Tỉ lệ diện tích bao quát**: ${coveragePercentage.toFixed(1)}%
- **Trạng thái an ninh**: ${coveragePercentage >= 99.5 ? 'Bao quát trọn vẹn 100%' : 'Còn góc khuất chưa quan sát'}
- **Thuật toán Steve Fisk (1978)**: Phân rã ${fiskProof.triangles.length} tam giác, tô 3 màu ${fiskProof.colorCounts.join('-')}, chọn nhóm cực tiểu ${fiskProof.guardVertexIndices.length} đỉnh.`;
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

      {/* 1. KHẢO SÁT TRỰC GIÁC TRƯỚC THỰC NGHIỆM */}
      <SimulationSection
        dotColor="amber"
        title="Khảo Sát Trực Giác Trước Thực Nghiệm"
        subtitle="Đo lường trực giác không gian hình học so với định lý giới hạn Václav Chvátal"
      >
        {meta?.hypothesis && (
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug="art-gallery"
            onPredictionSelected={(option: HypothesisOption, gap: number) => {
              setUserPrediction({ option, gap });
            }}
          />
        )}
      </SimulationSection>

      {/* 2. BUỒNG THÍ NGHIỆM & BÀN TƯƠNG TÁC HÌNH HỌC */}
      <SimulationSection
        dotColor="emerald"
        title="Buồng Thí Nghiệm & Bàn Tương Tác Hình Học"
        subtitle="Mô phỏng góc nhìn 360 độ, kiểm tra vùng che khuất và chứng minh trực quan định lý Chvátal"
      >
        <SimulationWorkbenchCard
          metricsBar={
            <GalleryMetrics
              numVertices={polygon.length}
              numGuards={guards.length}
              coveragePercentage={coveragePercentage}
            />
          }
        >
          {/* Bento Grid 2 cột: Cột chính Canvas + Stepper, Cột phụ Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Cột chính (8 cols): Canvas hình học & Trình diễn Steve Fisk */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <GalleryCanvas
                polygon={polygon}
                guards={guards}
                onAddGuard={handleAddGuard}
                onRemoveGuard={handleRemoveGuard}
                showTriangulation={showTriangulation}
                showColoring={showColoring}
                fiskProof={fiskProof}
                isVertexOnlyMode={isVertexOnlyMode}
              />

              <FiskStepper
                currentStep={fiskStep}
                onStepChange={handleStepChange}
                fiskProof={fiskProof}
                numVertices={polygon.length}
              />
            </div>

            {/* Cột phụ (4 cols): Bộ điều khiển, Presets, Sinh ngẫu nhiên */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <GalleryControls
                currentPresetId={currentPresetId}
                onSelectPreset={handleSelectPreset}
                onGenerateRandom={handleGenerateRandom}
                onApplyFiskGuards={handleApplyFiskGuards}
                onReset={handleReset}
                isVertexOnlyMode={isVertexOnlyMode}
                onToggleVertexMode={setIsVertexOnlyMode}
              />

              {/* Thông tin nhanh về lính gác */}
              <div className="rounded-xl border border-slate-300/85 bg-slate-50/60 p-4 space-y-2 text-xs text-slate-600">
                <div className="font-heading font-bold text-slate-800 uppercase tracking-wider">
                  Mẹo Bố Trí Lính Gác
                </div>
                <p className="leading-relaxed">
                  Ở căn phòng lồi (mọi góc trong &lt; 180&deg;), 1 người duy nhất đủ quan sát 100%.
                  Nhưng với các phòng răng lược, mỗi chóp nhọn tạo thành một góc chết độc lập, đòi
                  hỏi đúng <strong className="font-mono text-slate-900">&lfloor;n/3&rfloor;</strong>{' '}
                  người gác.
                </p>
              </div>
            </div>
          </div>
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. BẢNG XUẤT DỮ LIỆU & BÁO CÁO KHOA HỌC */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-300/85 bg-white shadow-xs">
        <div className="space-y-0.5">
          <div className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
            Xuất Dữ Liệu Thực Nghiệm & Báo Cáo
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Tải về bộ tọa độ hình học, vị trí lính gác và kết quả tính toán độ phủ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={guards.length === 0}
            className="border-slate-300 text-slate-700 text-xs flex items-center gap-1.5 active:scale-[0.98]"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Xuất CSV</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportJson}
            className="border-slate-300 text-slate-700 text-xs flex items-center gap-1.5 active:scale-[0.98]"
          >
            <FileJson className="h-3.5 w-3.5 text-blue-600" />
            <span>Xuất JSON</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyReport}
            className="border-slate-300 text-slate-700 text-xs flex items-center gap-1.5 active:scale-[0.98]"
          >
            {copiedType === 'report' ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>{copiedType === 'report' ? 'Đã sao chép!' : 'Sao chép báo cáo'}</span>
          </Button>
        </div>
      </div>

      {/* 4. GIẢI THÍCH CHUYÊN SÂU & TOÁN HỌC */}
      <SimulationSection
        dotColor="violet"
        title="Luận Giải Khoa Học & Ý Nghĩa Toán Học"
        subtitle="Từ câu hỏi của Victor Klee đến chứng minh ngắn gọn của Steve Fisk và bài toán tối ưu NP-hard"
      >
        <SimulationExplainerCard>
          <GalleryExplainer />
        </SimulationExplainerCard>
      </SimulationSection>

      {/* 5. LỊCH SỬ THỰC NGHIỆM */}
      <SimulationSection
        dotColor="indigo"
        title="Nhật Ký Thực Nghiệm Cá Nhân"
        subtitle="Lưu trữ các cấu hình phòng và kết quả đạt độ phủ 100% trong phiên làm việc hiện tại"
      >
        <SimulationHistoryTable runs={history} />
      </SimulationSection>
    </div>
  );
}
