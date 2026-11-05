'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';

export function useZenoAudio() {
  const sound = useSound();
  const lastStepTimeRef = React.useRef<number>(0);

  /** Âm thanh khi phân chia bước nhảy vi mô k (Tần số tăng dần khi tiến gần điểm kỳ dị t*) */
  const playStepJump = React.useCallback(
    (stepIndex: number) => {
      const now = performance.now();
      if (now - lastStepTimeRef.current < 45) return;
      lastStepTimeRef.current = now;

      // Base frequency 340Hz, tăng dần theo step để thể hiện chuỗi co cụm vô hạn
      const baseFreq = 340 + Math.min(stepIndex, 15) * 45;
      sound.playTone(baseFreq, 35, 'triangle', 0.25);
    },
    [sound],
  );

  /** Âm thanh đạt điểm hội tụ vượt qua rùa (Achilles đuổi kịp) */
  const playOvertake = React.useCallback(() => {
    // E5 - G#5 - B5 - E6
    sound.playTone(659.25, 120, 'sine', 0.45);
    setTimeout(() => sound.playTone(830.61, 120, 'sine', 0.5), 70);
    setTimeout(() => sound.playTone(987.77, 140, 'triangle', 0.55), 140);
    setTimeout(() => sound.playTone(1318.51, 260, 'sine', 0.6), 210);
  }, [sound]);

  /** Âm thanh đổi góc nhìn Zeno (Rời rạc) vs Newton/Leibniz (Liên tục) */
  const playPerspectiveToggle = React.useCallback(() => {
    sound.playTone(580, 40, 'sine', 0.25);
  }, [sound]);

  /** Âm thanh đặt lại */
  const playReset = React.useCallback(() => {
    sound.playTone(440, 50, 'sine', 0.2);
    setTimeout(() => sound.playTone(280, 80, 'sine', 0.2), 40);
  }, [sound]);

  return {
    playStepJump,
    playOvertake,
    playPerspectiveToggle,
    playReset,
  };
}
