'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';

export interface UseGallerySoundOptions {
  isLocalMuted?: boolean;
  localVolume?: number; // 0.0 to 1.0
}

export function useGallerySound(config: boolean | UseGallerySoundOptions = {}) {
  const globalSound = useSound();

  const options: UseGallerySoundOptions =
    typeof config === 'boolean' ? { isLocalMuted: !config } : config;

  const { isLocalMuted = false, localVolume = 1.0 } = options;

  const effectiveGain = isLocalMuted ? 0 : localVolume;

  const playDeployGuard = React.useCallback(
    (guardIndex: number = 0) => {
      if (effectiveGain <= 0) return;
      // Ascending pentatonic chime based on guard number
      const baseFreq = 523.25; // C5
      const intervals = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];
      const freqMultiplier = intervals[guardIndex % intervals.length] ?? 1;
      const octave = Math.floor(guardIndex / intervals.length);
      const freq = baseFreq * freqMultiplier * Math.pow(2, octave);

      globalSound.playTone(freq, 220, 'sine', effectiveGain * 0.85);
      setTimeout(() => {
        globalSound.playTone(freq * 1.5, 180, 'triangle', effectiveGain * 0.4);
      }, 40);
    },
    [globalSound, effectiveGain],
  );

  const playRemoveGuard = React.useCallback(() => {
    if (effectiveGain <= 0) return;
    globalSound.playTone(320, 150, 'sine', effectiveGain * 0.6);
    setTimeout(() => {
      globalSound.playTone(200, 180, 'sine', effectiveGain * 0.5);
    }, 60);
  }, [globalSound, effectiveGain]);

  const playStepChange = React.useCallback(
    (stepIndex: number = 0) => {
      if (effectiveGain <= 0) return;
      const pitch = 640 + stepIndex * 80;
      globalSound.playTone(pitch, 50, 'triangle', effectiveGain * 0.65);
    },
    [globalSound, effectiveGain],
  );

  const playCoverageVictory = React.useCallback(() => {
    if (effectiveGain <= 0) return;
    // Harmonic major-triad arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        globalSound.playTone(freq, 350, 'sine', effectiveGain * 0.8);
      }, idx * 90);
    });
  }, [globalSound, effectiveGain]);

  const playPresetSelect = React.useCallback(() => {
    if (effectiveGain <= 0) return;
    globalSound.playPop(effectiveGain * 0.7);
  }, [globalSound, effectiveGain]);

  const playVertexDrag = React.useCallback(() => {
    if (effectiveGain <= 0) return;
    globalSound.playTone(900, 25, 'triangle', effectiveGain * 0.2);
  }, [globalSound, effectiveGain]);

  return {
    ...globalSound,
    effectiveGain,
    playDeployGuard,
    playRemoveGuard,
    playStepChange,
    playCoverageVictory,
    playPresetSelect,
    playVertexDrag,
  };
}
