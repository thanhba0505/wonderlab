'use client';

import * as React from 'react';

export interface SoundContextValue {
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  playTone: (
    frequency: number,
    durationMs?: number,
    type?: OscillatorType,
    gainMultiplier?: number,
  ) => void;
  playChime: (frequencies: number[], durationMs?: number, gainMultiplier?: number) => void;
  playBeacon: (gainMultiplier?: number) => void;
  playSuccess: (gainMultiplier?: number) => void;
  playPop: (gainMultiplier?: number) => void;
  playHeartbeat: (gainMultiplier?: number) => void;
}

const SoundContext = React.createContext<SoundContextValue | null>(null);

const STORAGE_KEY_MUTED = 'wonderlab_sound_muted';
const STORAGE_KEY_VOLUME = 'wonderlab_sound_volume';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  // Default muted is true according to user requirements
  const [isMuted, setIsMutedState] = React.useState<boolean>(true);
  const [volume, setVolumeState] = React.useState<number>(0.7);

  // AudioContext reference (lazily initialized on first user interaction)
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  // Load persisted preferences after client mount
  React.useEffect(() => {
    try {
      const savedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
      if (savedMuted !== null) {
        setIsMutedState(savedMuted === 'true');
      } else {
        // Explicitly set default muted = true
        setIsMutedState(true);
      }

      const savedVol = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setVolumeState(parsed);
        }
      }
    } catch {
      // Ignore localStorage access errors (e.g. iframe sandbox or private mode)
    }
  }, []);

  const getAudioContext = React.useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!audioCtxRef.current) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume();
    }

    return audioCtxRef.current;
  }, []);

  const setMuted = React.useCallback(
    (muted: boolean) => {
      setIsMutedState(muted);
      try {
        localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
      } catch {
        // Ignore
      }
      if (!muted) {
        // Unlock audio context on unmute gesture
        getAudioContext();
      }
    },
    [getAudioContext],
  );

  const toggleMute = React.useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const setVolume = React.useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped));
    } catch {
      // Ignore
    }
  }, []);

  const playTone = React.useCallback(
    (frequency: number, durationMs = 200, type: OscillatorType = 'sine', gainMultiplier = 1) => {
      if (isMuted || volume <= 0) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        const targetGain = Math.min(1, volume * gainMultiplier * 0.25);
        gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(targetGain, ctx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + durationMs / 1000 + 0.05);
      } catch {
        // Silently catch audio buffer collisions
      }
    },
    [isMuted, volume, getAudioContext],
  );

  const playChime = React.useCallback(
    (frequencies: number[], durationMs = 400, gainMultiplier = 1) => {
      if (isMuted || volume <= 0) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          playTone(freq, durationMs, 'triangle', gainMultiplier);
        }, index * 90);
      });
    },
    [isMuted, volume, getAudioContext, playTone],
  );

  // High-craft specialized sound synthesis:
  const playBeacon = React.useCallback(
    (gainMultiplier = 1) => {
      // Deep reassuring 220Hz beacon with gentle 440Hz harmonic
      playTone(220, 450, 'sine', gainMultiplier * 1.1);
      setTimeout(() => {
        playTone(330, 350, 'triangle', gainMultiplier * 0.7);
      }, 70);
    },
    [playTone],
  );

  const playSuccess = React.useCallback(
    (gainMultiplier = 1) => {
      // Pentatonic upward chime C5 -> E5 -> G5
      playChime([523.25, 659.25, 783.99], 350, gainMultiplier);
    },
    [playChime],
  );

  const playPop = React.useCallback(
    (gainMultiplier = 1) => {
      if (isMuted || volume <= 0) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

        const targetGain = Math.min(1, volume * gainMultiplier * 0.2);
        gainNode.gain.setValueAtTime(targetGain, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.09);
      } catch {
        // Ignore
      }
    },
    [isMuted, volume, getAudioContext],
  );

  const playHeartbeat = React.useCallback(
    (gainMultiplier = 1) => {
      if (isMuted || volume <= 0) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        // Double heartbeat: Lub-dub
        const playBeat = (timeOffset: number, freq: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
          osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + timeOffset + dur);

          const targetGain = Math.min(1, volume * gainMultiplier * 0.35);
          gainNode.gain.setValueAtTime(targetGain, ctx.currentTime + timeOffset);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + dur);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(ctx.currentTime + timeOffset);
          osc.stop(ctx.currentTime + timeOffset + dur + 0.02);
        };

        playBeat(0, 65, 0.12);
        playBeat(0.18, 55, 0.14);
      } catch {
        // Ignore
      }
    },
    [isMuted, volume, getAudioContext],
  );

  const contextValue = React.useMemo<SoundContextValue>(
    () => ({
      isMuted,
      volume,
      toggleMute,
      setMuted,
      setVolume,
      playTone,
      playChime,
      playBeacon,
      playSuccess,
      playPop,
      playHeartbeat,
    }),
    [
      isMuted,
      volume,
      toggleMute,
      setMuted,
      setVolume,
      playTone,
      playChime,
      playBeacon,
      playSuccess,
      playPop,
      playHeartbeat,
    ],
  );

  return <SoundContext.Provider value={contextValue}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const context = React.useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
