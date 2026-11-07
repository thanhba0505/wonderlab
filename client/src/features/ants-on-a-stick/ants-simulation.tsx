'use client';

import * as React from 'react';
import {
  Ant,
  AntsSimulationConfig,
  CollisionEvent,
  PresetScenario,
  generateAnts,
  calculateTheoreticalBounds,
  stepSimulation,
} from './ants-math';
import {
  StickCanvas,
  SpacetimeDiagram,
  ControlDeck,
  TelemetryPanel,
  AntsExplainer,
} from './components';
import {
  SimulationSection,
  SimulationWorkbenchCard,
  IntuitionChallengeCard,
  SimulationHistoryTable,
} from '@/features/simulations/components';
import { useSimulationTelemetry } from '@/lib/hooks/use-simulation-telemetry';
import { useSimulationMeta } from '@/features/simulations/hooks';
import { useAntsAudio } from './utils/ants-audio';
import { HypothesisOption } from '@/features/simulations/types';

const SIMULATION_SLUG = 'ants-on-a-stick';

export function AntsSimulation() {
  const meta = useSimulationMeta(SIMULATION_SLUG);
  const audio = useAntsAudio();

  // Cấu hình mô phỏng (Default 10 con kiến như yêu cầu)
  const [config, setConfig] = React.useState<AntsSimulationConfig>({
    stickLength: 100,
    speed: 1,
    antCount: 10,
  });

  const [selectedPreset, setSelectedPreset] = React.useState<PresetScenario>('default-10');
  const [ants, setAnts] = React.useState<Ant[]>(() => generateAnts(config, 'default-10'));
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = React.useState<number>(1);
  const [isGhostMode, setIsGhostMode] = React.useState<boolean>(true);
  const [showSpacetime, setShowSpacetime] = React.useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);
  const [selectedAntId, setSelectedAntId] = React.useState<number | null>(null);
  const [collisions, setCollisions] = React.useState<CollisionEvent[]>([]);
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false);

  // Intuition Challenge State
  const [, setUserPrediction] = React.useState<{
    option: HypothesisOption;
    gap: number;
  } | null>(null);

  // Telemetry backend hook
  const { history, recordRun, page, pageSize, total, onPageChange, onPageSizeChange } =
    useSimulationTelemetry(SIMULATION_SLUG);

  // Tính toán giới hạn giải tích lý thuyết
  const bounds = React.useMemo(() => {
    return calculateTheoreticalBounds(ants, config);
  }, [ants, config]);

  // Refs cho animation loop hiệu năng cao (Tránh re-render React liên tục)
  const animationFrameRef = React.useRef<number | null>(null);
  const lastTimestampRef = React.useRef<number | null>(null);
  const antsRef = React.useRef<Ant[]>(ants);
  const currentTimeRef = React.useRef<number>(currentTime);
  const isPlayingRef = React.useRef<boolean>(isPlaying);
  const speedRef = React.useRef<number>(speedMultiplier);
  const soundRef = React.useRef<boolean>(soundEnabled);
  const isCompletedRef = React.useRef<boolean>(isCompleted);

  // Đồng bộ refs khi state thay đổi
  React.useEffect(() => {
    antsRef.current = ants;
  }, [ants]);

  React.useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  React.useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  React.useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  React.useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  React.useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  // Đặt lại mô phỏng
  const handleReset = React.useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    audio.playReset();
    setIsPlaying(false);
    setCurrentTime(0);
    setIsCompleted(false);
    setCollisions([]);
    setSelectedAntId(null);

    // Tái tạo lại vị trí xuất phát ban đầu từ danh sách hiện tại
    setAnts(prev =>
      prev.map(a => ({
        ...a,
        x: a.initialX,
        ghostX: a.initialX,
        direction: a.initialDirection,
        isFallen: false,
        exitSide: null,
        exitTime: null,
        collisionCount: 0,
      })),
    );
  }, [audio]);

  // Sinh ngẫu nhiên kịch bản mới
  const handleRandomize = React.useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    audio.playReset();
    setIsPlaying(false);
    setCurrentTime(0);
    setIsCompleted(false);
    setCollisions([]);
    setSelectedAntId(null);

    const newAnts = generateAnts(config, selectedPreset);
    setAnts(newAnts);
  }, [config, selectedPreset, audio]);

  // Chọn kịch bản mẫu
  const handleSelectPreset = React.useCallback(
    (preset: PresetScenario) => {
      setSelectedPreset(preset);
      setIsPlaying(false);
      setCurrentTime(0);
      setIsCompleted(false);
      setCollisions([]);
      setSelectedAntId(null);

      const targetCount =
        preset === 'classic-100' ? 100 : preset === 'two-ant-duel' ? 2 : config.antCount;

      const newConfig: AntsSimulationConfig = {
        ...config,
        antCount: targetCount,
      };
      setConfig(newConfig);

      const newAnts = generateAnts(newConfig, preset);
      setAnts(newAnts);
      audio.playReset();
    },
    [config, audio],
  );

  // Đổi số lượng kiến qua slider
  const handleAntCountChange = React.useCallback(
    (newCount: number) => {
      const updatedConfig = { ...config, antCount: newCount };
      setConfig(updatedConfig);
      setIsPlaying(false);
      setCurrentTime(0);
      setIsCompleted(false);
      setCollisions([]);
      setSelectedAntId(null);
      setSelectedPreset('default-10');

      const newAnts = generateAnts(updatedConfig, 'default-10');
      setAnts(newAnts);
    },
    [config],
  );

  // Bước nhảy thủ công (+0.2s)
  const handleStep = React.useCallback(() => {
    if (isCompletedRef.current) return;

    const dt = 0.2;
    const res = stepSimulation(antsRef.current, dt, config, currentTimeRef.current);
    antsRef.current = res.updatedAnts;
    currentTimeRef.current += dt;

    setAnts(res.updatedAnts);
    setCurrentTime(currentTimeRef.current);

    if (res.newCollisions.length > 0) {
      setCollisions(prev => [...prev, ...res.newCollisions]);
      if (soundRef.current) audio.playCollision();
    }

    if (res.newlyFallen.length > 0 && soundRef.current) {
      audio.playAntExit();
    }

    if (res.isCompleted) {
      setIsCompleted(true);
      setIsPlaying(false);
      if (soundRef.current) audio.playCompleted();
    }
  }, [config, audio]);

  // Bật/tắt chạy mô phỏng
  const handleTogglePlay = React.useCallback(() => {
    if (isCompleted) {
      handleReset();
      setIsPlaying(true);
      return;
    }
    setIsPlaying(prev => !prev);
  }, [isCompleted, handleReset]);

  // Vòng lặp Animation Loop 60fps sử dụng requestAnimationFrame
  React.useEffect(() => {
    if (!isPlaying) {
      lastTimestampRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const tick = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      // Giới hạn delta time tối đa 0.1s để tránh xuyên tường khi tab bị freeze
      const elapsedMs = Math.min(100, timestamp - lastTimestampRef.current);
      lastTimestampRef.current = timestamp;

      // dt thực tế tính theo giây và nhân với tốc độ
      const dt = (elapsedMs / 1000) * speedRef.current;

      if (dt > 0 && !isCompletedRef.current) {
        const res = stepSimulation(antsRef.current, dt, config, currentTimeRef.current);
        antsRef.current = res.updatedAnts;
        currentTimeRef.current += dt;

        // Cập nhật state
        setAnts(res.updatedAnts);
        setCurrentTime(currentTimeRef.current);

        if (res.newCollisions.length > 0) {
          setCollisions(prev => [...prev, ...res.newCollisions]);
          if (soundRef.current) audio.playCollision();
        }

        if (res.newlyFallen.length > 0 && soundRef.current) {
          audio.playAntExit();
        }

        if (res.isCompleted) {
          isCompletedRef.current = true;
          setIsCompleted(true);
          setIsPlaying(false);
          if (soundRef.current) audio.playCompleted();

          // Ghi nhận telemetry kết quả chạy
          recordRun(
            {
              antCount: config.antCount,
              preset: selectedPreset,
            },
            {
              duration: currentTimeRef.current,
              totalCollisions: collisions.length + res.newCollisions.length,
              maxTheoreticalTime: bounds.maxTime,
            },
            1,
            Math.round(currentTimeRef.current * 1000),
          );
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, config, audio, recordRun, collisions.length, selectedPreset, bounds.maxTime]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Thử thách trực giác nhận thức (Intuition Challenge Card) */}
      {meta?.hypothesis && (
        <SimulationSection
          title="Thử Thách Trực Giác Nhận Thức"
          subtitle="Hãy đưa ra dự đoán của bạn trước khi quan sát mô phỏng thực tế"
          dotColor="amber"
        >
          <IntuitionChallengeCard
            challenge={meta.hypothesis}
            simulationSlug={SIMULATION_SLUG}
            onPredictionSelected={(option: HypothesisOption, gap: number) =>
              setUserPrediction({ option, gap })
            }
          />
        </SimulationSection>
      )}

      {/* 2. Bàn Thí Nghiệm Chính (Workbench & Dual View) */}
      <SimulationSection
        title="Không Gian Mô Phỏng Tương Tác"
        subtitle="Quan sát sự va chạm đàn hồi 1D và đối chiếu trực quan với lớp bóng ma đi xuyên tương đương"
        dotColor="amber"
      >
        <SimulationWorkbenchCard
          title="Thanh Thước 1D & Đàn Kiến"
          badge={
            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-300">
              Live Physical Simulation
            </span>
          }
        >
          <div className="flex flex-col gap-4">
            {/* View 1: Canvas Thanh thước 1D */}
            <StickCanvas
              ants={ants}
              stickLength={config.stickLength}
              currentTime={currentTime}
              isGhostMode={isGhostMode}
              selectedAntId={selectedAntId}
              onSelectAnt={setSelectedAntId}
              recentCollisions={collisions}
            />

            {/* View 2: Biểu đồ Không-Thời Gian Minkowski (Tùy chọn hiển thị) */}
            {showSpacetime && (
              <SpacetimeDiagram
                ants={ants}
                stickLength={config.stickLength}
                currentTime={currentTime}
                maxTime={bounds.maxTime}
                collisions={collisions}
                isGhostMode={isGhostMode}
                selectedAntId={selectedAntId}
              />
            )}

            {/* Bảng đồng hồ Telemetry */}
            <TelemetryPanel
              currentTime={currentTime}
              maxTime={bounds.maxTime}
              ants={ants}
              totalCollisions={collisions.length}
              bounds={bounds}
              selectedAntId={selectedAntId}
              onClearSelectedAnt={() => setSelectedAntId(null)}
            />

            {/* Bàn điều khiển chính */}
            <ControlDeck
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onStep={handleStep}
              onReset={handleReset}
              onRandomize={handleRandomize}
              speedMultiplier={speedMultiplier}
              onSpeedChange={setSpeedMultiplier}
              antCount={config.antCount}
              onAntCountChange={handleAntCountChange}
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              isGhostMode={isGhostMode}
              onToggleGhostMode={() => {
                audio.playGhostToggle();
                setIsGhostMode(prev => !prev);
              }}
              showSpacetime={showSpacetime}
              onToggleSpacetime={() => setShowSpacetime(prev => !prev)}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(prev => !prev)}
              isCompleted={isCompleted}
            />
          </div>
        </SimulationWorkbenchCard>
      </SimulationSection>

      {/* 3. Bài Xã Luận Khoa Học & Phân Tích Chuyên Sâu */}
      <SimulationSection
        title="Giải Thích Khoa Học & Phân Tích Bản Chất"
        subtitle="Mô hình toán học, định lý bảo toàn thứ tự và liên hệ với cơ học lượng tử"
        dotColor="amber"
      >
        <AntsExplainer />
      </SimulationSection>

      {/* 4. Lịch Sử Chạy Thực Nghiệm (Simulation History Table) */}
      <SimulationSection
        title="Nhật Ký Thí Nghiệm"
        subtitle="Theo dõi dữ liệu các phiên thử nghiệm đã ghi nhận"
        dotColor="amber"
      >
        <SimulationHistoryTable
          simulationSlug={SIMULATION_SLUG}
          runs={history}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </SimulationSection>
    </div>
  );
}
