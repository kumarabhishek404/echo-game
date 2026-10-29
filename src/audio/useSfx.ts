import { useEffect, useRef } from 'react';
import { useAudioPlayer, type AudioPlayer } from 'expo-audio';

const collectSource = require('../../assets/sfx/collect.wav');
const spawnSource = require('../../assets/sfx/spawn.wav');
const overSource = require('../../assets/sfx/over.wav');

export function useSfx(enabled: boolean) {
  const collectPlayer = useAudioPlayer(collectSource);
  const spawnPlayer = useAudioPlayer(spawnSource);
  const overPlayer = useAudioPlayer(overSource);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const play = (player: AudioPlayer) => {
    if (!enabledRef.current) {
      return;
    }
    player
      .seekTo(0)
      .then(() => {
        player.play();
      })
      .catch(() => undefined);
  };

  return {
    collect: () => play(collectPlayer),
    spawn: () => play(spawnPlayer),
    over: () => play(overPlayer),
  };
}
