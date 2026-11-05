'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';

export interface UseHatSoundOptions {
  isLocalMuted?: boolean;
  localVolume?: number; // 0.0 to 1.0
}

export function useHatSound({ isLocalMuted = false, localVolume = 1.0 }: UseHatSoundOptions = {}) {
  const globalSound = useSound();

  const effectiveGain = isLocalMuted ? 0 : localVolume;

  const playBeaconSignal = React.useCallback(() => {
    if (effectiveGain <= 0) return;
    globalSound.playBeacon(effectiveGain);
  }, [globalSound, effectiveGain]);

  const playSurvivalChime = React.useCallback(
    (turnIndex: number, totalPrisoners: number) => {
      if (effectiveGain <= 0) return;
      // Harmonically ascending pitch as we get closer to Prisoner #1
      // Base frequency 440 to 880Hz
      const progress = totalPrisoners > 1 ? turnIndex / (totalPrisoners - 1) : 0.5;
      const baseFreq = 440 + progress * 220; // 440Hz -> 660Hz
      globalSound.playTone(baseFreq, 300, 'triangle', effectiveGain * 0.9);
      setTimeout(() => {
        globalSound.playTone(baseFreq * 1.25, 250, 'sine', effectiveGain * 0.7); // Major third harmonic
      }, 60);
    },
    [globalSound, effectiveGain],
  );

  const playMistakeFeedback = React.useCallback(() => {
    if (effectiveGain <= 0) return;
    globalSound.playTone(180, 250, 'sawtooth', effectiveGain * 0.5);
    setTimeout(() => {
      globalSound.playTone(140, 300, 'sawtooth', effectiveGain * 0.6);
    }, 120);
  }, [globalSound, effectiveGain]);

  const playShuffleDrop = React.useCallback(() => {
    if (effectiveGain <= 0) return;
    globalSound.playPop(effectiveGain * 0.8);
    setTimeout(() => {
      globalSound.playPop(effectiveGain * 0.6);
    }, 80);
    setTimeout(() => {
      globalSound.playPop(effectiveGain * 0.4);
    }, 150);
  }, [globalSound, effectiveGain]);

  const playHeartbeatPulse = React.useCallback(() => {
    if (effectiveGain <= 0) return;
    globalSound.playHeartbeat(effectiveGain * 0.85);
  }, [globalSound, effectiveGain]);

  return {
    ...globalSound,
    effectiveGain,
    playBeaconSignal,
    playSurvivalChime,
    playMistakeFeedback,
    playShuffleDrop,
    playHeartbeatPulse,
  };
}
