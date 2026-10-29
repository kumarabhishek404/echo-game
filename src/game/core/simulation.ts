import {
  GAME_CONFIG,
  historyCapacityFor,
  type GameConfig,
} from './config';
import { HistoryBuffer } from './historyBuffer';
import { hashSeed } from './rng';
import type { Arena, Phase, SimEvent, Simulation } from './types';
import { lethalEchoHit } from '../systems/collision';
import { fillCollectibles, updateCollectibles } from '../systems/collectibles';
import { updateEchoes, updateHazards } from '../systems/echoes';
import { integratePlayer } from '../systems/movement';
import { computeScore } from '../systems/scoring';

export type CreateSimulationOptions = {
  arena: Arena;
  seed?: number;
  startPaused?: boolean;
  historyCapacity?: number;
  config?: Partial<GameConfig>;
};

export function createSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

export function createSimulation(options: CreateSimulationOptions): Simulation {
  const config: GameConfig = {
    ...GAME_CONFIG,
    ...options.config,
    echoDelaysSec: options.config?.echoDelaysSec ?? GAME_CONFIG.echoDelaysSec,
  };
  const seed = (options.seed ?? createSeed()) >>> 0;
  const centerX = options.arena.width / 2;
  const centerY = options.arena.height / 2;
  const phase: Phase = options.startPaused ? 'paused' : 'playing';
  const sim: Simulation = {
    arena: { width: options.arena.width, height: options.arena.height },
    config,
    seed,
    rngState: hashSeed(seed),
    phase,
    tick: 0,
    player: { x: centerX, y: centerY },
    previousPlayer: { x: centerX, y: centerY },
    pointer: { active: false, x: centerX, y: centerY },
    history: new HistoryBuffer(options.historyCapacity ?? historyCapacityFor(config)),
    echoes: [],
    collectibles: [],
    nextCollectibleId: 1,
    energyCollected: 0,
    score: 0,
  };
  sim.history.record(0, centerX, centerY);
  fillCollectibles(sim);
  return sim;
}

export function setPointer(sim: Simulation, active: boolean, x: number, y: number): void {
  sim.pointer.active = active;
  sim.pointer.x = x;
  sim.pointer.y = y;
}

export function pauseSimulation(sim: Simulation): void {
  if (sim.phase === 'playing') {
    sim.phase = 'paused';
  }
}

export function resumeSimulation(sim: Simulation): void {
  if (sim.phase === 'paused') {
    sim.phase = 'playing';
  }
}

export function stepTick(sim: Simulation): SimEvent[] {
  if (sim.phase !== 'playing') {
    return [];
  }
  sim.tick += 1;
  integratePlayer(sim);
  sim.history.record(sim.tick, sim.player.x, sim.player.y);
  const events = [...updateEchoes(sim), ...updateCollectibles(sim)];
  updateHazards(sim);
  if (lethalEchoHit(sim)) {
    sim.phase = 'gameover';
    events.push({ type: 'gameover' });
  }
  sim.score = computeScore(sim);
  return events;
}

export function resetSimulation(sim: Simulation, seed?: number): void {
  const next = createSimulation({
    arena: sim.arena,
    seed: seed ?? ((sim.seed + 1) >>> 0),
    config: sim.config,
    historyCapacity: sim.history.capacity,
  });
  sim.seed = next.seed;
  sim.rngState = next.rngState;
  sim.phase = 'playing';
  sim.tick = next.tick;
  sim.player.x = next.player.x;
  sim.player.y = next.player.y;
  sim.previousPlayer.x = next.previousPlayer.x;
  sim.previousPlayer.y = next.previousPlayer.y;
  sim.pointer.active = false;
  sim.pointer.x = next.pointer.x;
  sim.pointer.y = next.pointer.y;
  sim.history = next.history;
  sim.echoes = next.echoes;
  sim.collectibles = next.collectibles;
  sim.nextCollectibleId = next.nextCollectibleId;
  sim.energyCollected = 0;
  sim.score = 0;
}
