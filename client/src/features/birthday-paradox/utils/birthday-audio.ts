'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';

export function useBirthdayAudio() {
  const sound = useSound();
  const lastTickSoundRef = React.useRef<number>(0);

  /** Âm thanh khi sinh ngẫu nhiên phòng mới */
  const playRandomizeRoom = React.useCallback(
    (hasCollision: boolean) => {
      if (hasCollision) {
        // Có va chạm ngày sinh: Âm vang đôi ngân vang (E5 -> B5 -> E6)
        sound.playTone(659.25, 100, 'sine', 0.45);
        setTimeout(() => sound.playTone(987.77, 120, 'sine', 0.5), 70);
        setTimeout(() => sound.playTone(1318.51, 240, 'triangle', 0.55), 150);
      } else {
        // Không có va chạm: Âm nhẹ nhàng đơn sắc
        sound.playTone(440, 70, 'sine', 0.25);
      }
    },
    [sound],
  );

  /** Âm thanh tiến trình Monte Carlo */
  const playBatchTick = React.useCallback(() => {
    const now = performance.now();
    if (now - lastTickSoundRef.current < 65) return;
    lastTickSoundRef.current = now;
    sound.playTone(840, 15, 'sine', 0.12);
  }, [sound]);

  /** Âm thanh hoàn thành lượt chạy batch Monte Carlo */
  const playBatchComplete = React.useCallback(() => {
    sound.playTone(523.25, 100, 'sine', 0.4);
    setTimeout(() => sound.playTone(659.25, 120, 'sine', 0.45), 80);
    setTimeout(() => sound.playTone(783.99, 160, 'sine', 0.5), 160);
  }, [sound]);

  /** Âm thanh đặt lại */
  const playReset = React.useCallback(() => {
    sound.playTone(440, 60, 'sine', 0.2);
    setTimeout(() => sound.playTone(330, 80, 'sine', 0.15), 50);
  }, [sound]);

  return {
    playRandomizeRoom,
    playBatchTick,
    playBatchComplete,
    playReset,
  };
}
