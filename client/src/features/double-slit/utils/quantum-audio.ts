'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';

export function useQuantumAudio() {
  const sound = useSound();
  const lastPhotonSoundRef = React.useRef<number>(0);

  /** Âm thanh bắn 1 photon đơn lẻ (Blip lượng tử vi mô) */
  const playPhotonFire = React.useCallback(() => {
    const now = performance.now();
    // Throttle để tránh dồn dập khi stream
    if (now - lastPhotonSoundRef.current < 50) return;
    lastPhotonSoundRef.current = now;
    sound.playTone(880, 25, 'sine', 0.25);
  }, [sound]);

  /** Âm thanh chùm photon nhanh (Burst discharge) */
  const playPhotonBurst = React.useCallback(() => {
    sound.playTone(720, 40, 'triangle', 0.35);
    setTimeout(() => sound.playTone(880, 50, 'triangle', 0.4), 30);
    setTimeout(() => sound.playTone(1050, 70, 'sine', 0.3), 70);
  }, [sound]);

  /** Âm thanh bật / tắt Máy dò lượng tử (Detector Observer effect) */
  const playObserverToggle = React.useCallback(
    (isActive: boolean) => {
      if (isActive) {
        // Kích hoạt máy dò: Cảm biến lượng tử rung quét (Sawtooth + Sine buzz)
        sound.playTone(320, 80, 'sawtooth', 0.3);
        setTimeout(() => sound.playTone(640, 120, 'sine', 0.4), 60);
      } else {
        // Tắt máy dò: Hạ trường lượng tử về sóng tự do
        sound.playTone(520, 70, 'sine', 0.3);
        setTimeout(() => sound.playTone(340, 100, 'sine', 0.25), 50);
      }
    },
    [sound],
  );

  /** Âm thanh tẩy sạch màn chắn phosphor */
  const playReset = React.useCallback(() => {
    sound.playTone(500, 60, 'sine', 0.2);
    setTimeout(() => sound.playTone(300, 90, 'sine', 0.15), 50);
  }, [sound]);

  return {
    playPhotonFire,
    playPhotonBurst,
    playObserverToggle,
    playReset,
  };
}
