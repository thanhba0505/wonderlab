'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Sliders, Sparkles, FlaskConical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';

export interface SimulationWorkbenchCardProps {
  /** Tiêu đề buồng thí nghiệm */
  title?: string;
  /** Huy hiệu đi kèm tiêu đề */
  badge?: React.ReactNode;
  /** Thanh trạng thái chỉ số đo lường */
  metricsBar?: React.ReactNode;
  /** Slot Cột Cài đặt thông số & điều khiển */
  controls?: React.ReactNode;
  /** Slot Cột Trình diễn mô phỏng trực quan */
  stage?: React.ReactNode;
  /** Nội dung tùy chỉnh (fallback nếu không phân chia controls/stage) */
  children?: React.ReactNode;
  /** Thanh công cụ (Xuất CSV, JSON, Báo cáo, Share link...) */
  tools?: React.ReactNode;
  /** Dòng thông số Telemetry thời gian thực */
  telemetry?: React.ReactNode;
  /** Class tùy biến */
  className?: string;
  /** Bố cục mặc định ở chế độ thường khi dùng controls & stage: 'stacked' | 'split' */
  normalLayout?: 'stacked' | 'split';
}

export function SimulationWorkbenchCard({
  title,
  badge,
  metricsBar,
  controls,
  stage,
  children,
  tools,
  telemetry,
  className = '',
  normalLayout = 'stacked',
}: SimulationWorkbenchCardProps) {
  const { dict } = useTranslation();
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Xử lý phím Esc để thoát toàn màn hình
  React.useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Khóa cuộn trang khi ở chế độ toàn màn hình
  React.useEffect(() => {
    if (!isFullscreen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreen]);

  const hasBottomBar = Boolean(tools || telemetry);
  const hasSplitSlots = Boolean(controls && stage);

  // Render nội dung chính ở chế độ bình thường
  const renderNormalContent = () => {
    if (children) {
      return children;
    }

    if (hasSplitSlots) {
      if (normalLayout === 'split') {
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 lg:divide-x divide-slate-200/80">
            <div className="lg:col-span-4 space-y-6 lg:pr-6 pb-6 lg:pb-0 border-b lg:border-b-0 border-slate-200/80">
              {controls}
            </div>
            <div className="lg:col-span-8 space-y-6 lg:pl-6 pt-6 lg:pt-0">{stage}</div>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {stage}
          {controls}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* ────────────────────────── CHẾ ĐỘ THƯỜNG (INLINE) ────────────────────────── */}
      <div
        className={`rounded-2xl border border-slate-300/85 bg-white shadow-xs p-5 sm:p-6 space-y-6 ${className}`}
      >
        {/* Thanh tiêu đề Card & Nút mở rộng Toàn màn hình */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 shrink-0" />
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800 truncate">
              {title ?? dict.simulations.title}
            </h3>
            {badge}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="h-7 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs active:scale-[0.98] shrink-0"
            title={dict.simulations.fullscreen_enter}
          >
            <Maximize2 className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline font-sans">{dict.simulations.fullscreen_enter}</span>
          </Button>
        </div>

        {/* Thanh trạng thái đo lường nhỏ gọn */}
        {metricsBar && <div>{metricsBar}</div>}

        {/* Vùng thực nghiệm tương tác chính */}
        <div className="space-y-6">{renderNormalContent()}</div>

        {/* Thanh công cụ và telemetry góc dưới */}
        {hasBottomBar && (
          <div className="border-t border-slate-200/80 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {tools && <div className="flex flex-wrap items-center gap-2">{tools}</div>}
            {telemetry && (
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                {telemetry}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ────────────────────────── CHẾ ĐỘ TOÀN MÀN HÌNH (PORTAL) ────────────────────────── */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {isFullscreen && (
              <motion.div
                key="simulation-fullscreen-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-xs p-2 sm:p-3 md:p-5"
                role="dialog"
                aria-modal="true"
                aria-label={title ?? dict.simulations.title}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 12 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-1 flex-col rounded-2xl border border-slate-300/85 bg-slate-100 shadow-2xl overflow-hidden min-h-0"
                >
                  {/* [1] Header Toàn màn hình */}
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200/90 bg-white shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/70 shrink-0">
                        <FlaskConical className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="font-heading text-sm font-bold text-slate-900 truncate">
                            {title ?? dict.simulations.title}
                          </h2>
                          {badge}
                        </div>
                        <p className="text-xs text-slate-500 font-mono hidden sm:block">
                          {dict.simulations.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullscreen(false)}
                        className="h-8 gap-1.5 border-slate-300 bg-white font-mono text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs active:scale-[0.98]"
                        title={dict.simulations.fullscreen_exit}
                      >
                        <X className="h-3.5 w-3.5 text-slate-600" />
                        <span className="font-sans font-medium">
                          {dict.simulations.fullscreen_exit}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* [2] Metrics Bar (nếu có) */}
                  {metricsBar && (
                    <div className="px-5 py-3.5 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs shrink-0 overflow-x-auto">
                      {metricsBar}
                    </div>
                  )}

                  {/* [3] Thân 2 Cột Trong Fullscreen */}
                  <div className="flex-1 min-h-0 p-3 sm:p-4 md:p-5 overflow-hidden">
                    {hasSplitSlots ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
                        {/* Cột 1: Cài đặt thông số & điều khiển (Settings Deck) */}
                        <div className="lg:col-span-4 xl:col-span-4 flex flex-col min-h-0 rounded-xl border border-slate-300/85 bg-white shadow-2xs overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-2.5 bg-slate-50/70 shrink-0">
                            <div className="flex items-center gap-2">
                              <Sliders className="h-4 w-4 text-blue-600" />
                              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
                                {dict.simulations.fullscreen_controls_title}
                              </h3>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 space-y-5">{controls}</div>
                        </div>

                        {/* Cột 2: Trình diễn mô phỏng (Visual Stage) */}
                        <div className="lg:col-span-8 xl:col-span-8 flex flex-col min-h-0 rounded-xl border border-slate-300/85 bg-white shadow-2xs overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-2.5 bg-slate-50/70 shrink-0">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-violet-600" />
                              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
                                {dict.simulations.fullscreen_stage_title}
                              </h3>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 space-y-6">{stage}</div>
                        </div>
                      </div>
                    ) : (
                      /* Fallback nếu không chia controls/stage */
                      <div className="h-full min-h-0 rounded-xl border border-slate-300/85 bg-white p-5 shadow-2xs overflow-y-auto space-y-6">
                        {children}
                      </div>
                    )}
                  </div>

                  {/* [4] Footer Bar (Tools & Telemetry) */}
                  {hasBottomBar && (
                    <div className="border-t border-slate-200/80 bg-white px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
                      {tools && <div className="flex flex-wrap items-center gap-2">{tools}</div>}
                      {telemetry && (
                        <div className="flex items-center gap-4 font-mono text-slate-500">
                          {telemetry}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
