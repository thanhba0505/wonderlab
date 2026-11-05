'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';

export function useMontyHallAudio() {
  const sound = useSound();
  const lastTickSoundRef = React.useRef<number>(0);

  /** Âm thanh gõ chọn cửa (Knock-knock) */
  const playDoorPick = React.useCallback(() => {
    // 2 nhịp gõ gỗ đanh
    sound.playTone(220, 60, 'triangle', 0.5);
    setTimeout(() => {
      sound.playTone(180, 80, 'triangle', 0.55);
    }, 70);
  }, [sound]);

  /** Âm thanh MC mở cánh cửa có Dê (Bản lề mở hé) */
  const playHostReveal = React.useCallback(() => {
    sound.playTone(330, 90, 'sine', 0.35);
    setTimeout(() => {
      sound.playTone(294, 140, 'sine', 0.4);
    }, 80);
  }, [sound]);

  /** Âm thanh thắng Ô tô Thể thao (Fanfare chiến thắng hợp âm trưởng) */
  const playWinCar = React.useCallback(() => {
    // C5 - E5 - G5 - C6 arpeggio
    sound.playTone(523.25, 120, 'sine', 0.5);
    setTimeout(() => sound.playTone(659.25, 120, 'sine', 0.55), 80);
    setTimeout(() => sound.playTone(783.99, 140, 'sine', 0.6), 160);
    setTimeout(() => sound.playTone(1046.5, 280, 'triangle', 0.65), 240);
  }, [sound]);

  /** Âm thanh Dê Cỏ (Wobbling tone hạ dần) */
  const playGoat = React.useCallback(() => {
    sound.playTone(280, 90, 'sawtooth', 0.3);
    setTimeout(() => sound.playTone(240, 110, 'sawtooth', 0.35), 80);
    setTimeout(() => sound.playTone(200, 160, 'sawtooth', 0.25), 180);
  }, [sound]);

  /** Âm thanh nhịp tiến trình Monte Carlo */
  const playBatchTick = React.useCallback(() => {
    const now = performance.now();
    if (now - lastTickSoundRef.current < 80) return;
    lastTickSoundRef.current = now;
    sound.playTone(800, 15, 'sine', 0.1);
  }, [sound]);

  /** Âm thanh làm mới lượt chơi */
  const playReset = React.useCallback(() => {
    sound.playTone(480, 60, 'sine', 0.25);
    setTimeout(() => sound.playTone(360, 80, 'sine', 0.2), 50);
  }, [sound]);

  return {
    playDoorPick,
    playHostReveal,
    playWinCar,
    playGoat,
    playBatchTick,
    playReset,
  };
}
