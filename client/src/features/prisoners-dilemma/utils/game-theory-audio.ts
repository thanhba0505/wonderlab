'use client';

import * as React from 'react';
import { useSound } from '@/lib/audio-context';
import { Move } from '../game-theory-math';

export function useGameTheoryAudio() {
  const sound = useSound();

  /** Âm thanh khi người chơi hoặc đối thủ chọn nước đi */
  const playMove = React.useCallback(
    (move: Move) => {
      if (move === 'C') {
        // Hợp tác: Âm sắc ấm áp, du dương (Sine 523Hz C5)
        sound.playTone(523.25, 90, 'sine', 0.35);
      } else {
        // Phản bội: Âm sắc dứt khoát, sắc nhọn (Sawtooth 293Hz D4)
        sound.playTone(293.66, 110, 'sawtooth', 0.3);
      }
    },
    [sound],
  );

  /** Âm thanh kết quả cặp nước đi (Payoff result) */
  const playRoundPayoff = React.useCallback(
    (move1: Move, move2: Move) => {
      if (move1 === 'C' && move2 === 'C') {
        // Cùng hợp tác: Win-win chord (C5 + G5)
        sound.playTone(523.25, 120, 'sine', 0.4);
        setTimeout(() => sound.playTone(783.99, 140, 'triangle', 0.45), 50);
      } else if (move1 === 'D' && move2 === 'D') {
        // Cùng phản bội: Low tension rumble
        sound.playTone(180, 160, 'sawtooth', 0.35);
      } else {
        // Một bên phản bội, một bên hợp tác: Tension chime
        sound.playTone(392, 100, 'triangle', 0.4);
        setTimeout(() => sound.playTone(659.25, 120, 'sine', 0.35), 60);
      }
    },
    [sound],
  );

  /** Âm thanh hoàn thành trận đấu hoặc giải đấu */
  const playTournamentEnd = React.useCallback(() => {
    sound.playTone(440, 90, 'triangle', 0.4);
    setTimeout(() => sound.playTone(554.37, 100, 'triangle', 0.45), 70);
    setTimeout(() => sound.playTone(659.25, 150, 'sine', 0.5), 140);
  }, [sound]);

  /** Âm thanh chuyển đổi chế độ Duel / Tournament */
  const playModeSwitch = React.useCallback(() => {
    sound.playTone(600, 35, 'sine', 0.25);
  }, [sound]);

  return {
    playMove,
    playRoundPayoff,
    playTournamentEnd,
    playModeSwitch,
  };
}
