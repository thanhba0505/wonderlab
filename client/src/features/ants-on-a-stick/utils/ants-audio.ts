'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';

export function useAntsAudio() {
  const sound = useSound();
  const lastCollisionTimeRef = React.useRef<number>(0);
  const lastExitTimeRef = React.useRef<number>(0);

  /** Âm thanh va chạm vi mô giữa 2 con kiến (Throttled 35ms tránh méo âm khi mật độ va chạm cao) */
  const playCollision = React.useCallback(() => {
    const now = performance.now();
    if (now - lastCollisionTimeRef.current < 35) return;
    lastCollisionTimeRef.current = now;

    // Âm click nhẹ dạng sine/triangle với tần số ngẫu nhiên nhẹ 600 - 800Hz tạo cảm giác va chạm tự nhiên
    const pitch = 640 + (Math.random() * 160 - 80);
    sound.playTone(pitch, 20, 'triangle', 0.15);
  }, [sound]);

  /** Âm thanh khi một chú kiến chạm mép và rơi khỏi thanh gỗ */
  const playAntExit = React.useCallback(() => {
    const now = performance.now();
    if (now - lastExitTimeRef.current < 60) return;
    lastExitTimeRef.current = now;

    // Âm thanh giọt nước nhẹ (Water droplet plop)
    sound.playTone(420, 45, 'sine', 0.22);
    setTimeout(() => sound.playTone(260, 60, 'sine', 0.18), 35);
  }, [sound]);

  /** Âm thanh khi toàn bộ đàn kiến đã rơi hết (Kết thúc mô phỏng) */
  const playCompleted = React.useCallback(() => {
    // Chuỗi hợp âm nhẹ nhàng C5 - E5 - G5 - C6
    sound.playTone(523.25, 90, 'sine', 0.35);
    setTimeout(() => sound.playTone(659.25, 90, 'sine', 0.4), 80);
    setTimeout(() => sound.playTone(783.99, 110, 'sine', 0.45), 160);
    setTimeout(() => sound.playTone(1046.5, 220, 'triangle', 0.5), 240);
  }, [sound]);

  /** Âm thanh bật / tắt chế độ bóng ma Ghost Mode */
  const playGhostToggle = React.useCallback(() => {
    sound.playTone(720, 40, 'sine', 0.2);
    setTimeout(() => sound.playTone(880, 50, 'sine', 0.22), 40);
  }, [sound]);

  /** Âm thanh đặt lại (Reset) */
  const playReset = React.useCallback(() => {
    sound.playTone(480, 40, 'sine', 0.2);
    setTimeout(() => sound.playTone(320, 60, 'sine', 0.2), 35);
  }, [sound]);

  return {
    playCollision,
    playAntExit,
    playCompleted,
    playGhostToggle,
    playReset,
  };
}
