'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';

export function useBodyguardAudio() {
  const sound = useSound();
  const lastDragSoundRef = React.useRef<number>(0);

  const playShieldActivate = React.useCallback(() => {
    // Ascending harmonic chime (E major triad: E5, G#5, B5, E6)
    sound.playTone(659.25, 200, 'sine', 0.5);
    setTimeout(() => sound.playTone(830.61, 200, 'sine', 0.55), 50);
    setTimeout(() => sound.playTone(987.77, 240, 'sine', 0.6), 100);
    setTimeout(() => sound.playTone(1318.51, 320, 'triangle', 0.45), 160);
  }, [sound]);

  const playShieldDeactivate = React.useCallback(() => {
    // Descending soft warning tone (A4 -> F4 -> D4)
    sound.playTone(440, 160, 'sine', 0.4);
    setTimeout(() => sound.playTone(349.23, 180, 'sine', 0.45), 60);
    setTimeout(() => sound.playTone(293.66, 220, 'triangle', 0.35), 120);
  }, [sound]);

  const playNodeDrag = React.useCallback(() => {
    const now = performance.now();
    // Throttle to at most once every 60ms
    if (now - lastDragSoundRef.current < 60) return;
    lastDragSoundRef.current = now;
    sound.playTone(720, 20, 'triangle', 0.15);
  }, [sound]);

  const playPresetChange = React.useCallback(() => {
    sound.playTone(520, 40, 'sine', 0.3);
    setTimeout(() => sound.playTone(680, 50, 'sine', 0.35), 45);
  }, [sound]);

  const playModeChange = React.useCallback(() => {
    sound.playTone(880, 30, 'triangle', 0.25);
  }, [sound]);

  return {
    playShieldActivate,
    playShieldDeactivate,
    playNodeDrag,
    playPresetChange,
    playModeChange,
  };
}
