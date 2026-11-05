'use client';

import * as React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useSound } from '@/lib/audio-context';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

interface SoundControlProps {
  className?: string;
}

export function SoundControl({ className }: SoundControlProps) {
  const { isMuted, volume, toggleMute, setVolume, setMuted, playPop } = useSound();
  const { dict } = useTranslation();
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  const handleClickToggle = () => {
    const nextMuted = !isMuted;
    toggleMute();
    if (!nextMuted) {
      // Gentle confirmation pop tone when unmuting
      setTimeout(() => playPop(0.7), 50);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setMuted(false);
    }
  };

  const displayPercent = isMuted ? 0 : Math.round(volume * 100);

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-3.5 w-3.5 text-slate-400 transition-colors" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="h-3.5 w-3.5 text-blue-600 transition-colors" />;
    }
    return <Volume2 className="h-3.5 w-3.5 text-blue-600 transition-colors" />;
  };

  return (
    <div
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Primary Toggle Button */}
      <button
        type="button"
        onClick={handleClickToggle}
        aria-label={
          isMuted
            ? dict.header.sound_muted || 'Âm thanh: Đang tắt'
            : dict.header.sound_unmuted || 'Âm thanh: Đang bật'
        }
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-mono font-semibold shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          isMuted
            ? 'border-slate-300/80 bg-white/90 text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700'
            : 'border-blue-300/90 bg-blue-50/70 text-blue-700 hover:bg-blue-100/70',
        )}
      >
        {renderVolumeIcon()}
        <span className="uppercase tracking-wider select-none">
          {isMuted ? 'MUTE' : `${displayPercent}%`}
        </span>
      </button>

      {/* Floating Volume Slider Popover on Hover */}
      {isHovered && (
        <div
          role="dialog"
          aria-label={dict.header.sound_toggle || 'Điều chỉnh âm lượng'}
          className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-300/90 bg-white/95 p-3 shadow-xl backdrop-blur-md z-50 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-700">
              {renderVolumeIcon()}
              <span>{dict.header.sound_toggle || 'Âm thanh'}</span>
            </span>
            <span className="font-mono text-xs text-blue-700 tabular-nums">{displayPercent}%</span>
          </div>

          <div className="pt-2.5 space-y-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label={dict.header.sound_toggle || 'Thanh điều chỉnh âm lượng'}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            />

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <button
                type="button"
                onClick={() => setMuted(!isMuted)}
                className="hover:text-blue-600 transition-colors"
              >
                {isMuted ? 'Bật âm' : 'Tắt âm'}
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setVolume(0.3);
                    setMuted(false);
                  }}
                  className="px-1 py-0.5 rounded hover:bg-slate-100 transition-colors"
                >
                  30%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVolume(0.7);
                    setMuted(false);
                  }}
                  className="px-1 py-0.5 rounded hover:bg-slate-100 transition-colors"
                >
                  70%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVolume(1.0);
                    setMuted(false);
                  }}
                  className="px-1 py-0.5 rounded hover:bg-slate-100 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
