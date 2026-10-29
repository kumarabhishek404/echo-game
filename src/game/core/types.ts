import type { GameConfig } from './config';
import type { HistoryBuffer } from './historyBuffer';

export type Vec = {
  x: number;
  y: number;
};

export type Arena = {
  width: number;
  height: number;
};

export type Phase = 'playing' | 'paused' | 'gameover';

/** Telegraph and invulnerable bodies are visible and non-lethal. */
export type EchoPhase = 'telegraph' | 'invulnerable' | 'lethal';

export type Echo = {
  id: number;
  delayTicks: number;
  ageTicks: number;
  overlapGraceTicks: number;
  phase: EchoPhase;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  /** Decorative samples. Collision ignores this list. */
  trail: Vec[];
};

export type Collectible = {
  id: number;
  x: number;
  y: number;
};

export type SimEvent =
  | { type: 'collect'; id: number }
  | { type: 'echo-spawn'; id: number }
  | { type: 'gameover' };

export type Simulation = {
  arena: Arena;
  config: GameConfig;
  seed: number;
  rngState: number;
  phase: Phase;
  tick: number;
  player: Vec;
  previousPlayer: Vec;
  pointer: { active: boolean; x: number; y: number };
  history: HistoryBuffer;
  echoes: Echo[];
  collectibles: Collectible[];
  nextCollectibleId: number;
  energyCollected: number;
  score: number;
};

export type ViewMapping = {
  viewWidth: number;
  viewHeight: number;
  worldWidth: number;
  worldHeight: number;
};

export type WindowMapping = ViewMapping & {
  originX: number;
  originY: number;
};
