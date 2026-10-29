import { SIM_HZ } from '../core/config';
import type { Simulation } from '../core/types';

export function survivalSeconds(sim: Simulation): number {
  return sim.tick / SIM_HZ;
}

export function computeScore(sim: Simulation): number {
  return Math.floor(
    survivalSeconds(sim) * sim.config.scorePerSecond +
      sim.energyCollected * sim.config.scorePerEnergy,
  );
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
