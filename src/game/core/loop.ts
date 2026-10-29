import { FIXED_DT_MS, LARGE_GAP_MS, MAX_CATCH_UP_STEPS } from './config';
import { stepTick } from './simulation';
import type { SimEvent, Simulation } from './types';

export type LoopClock = {
  lastMs: number | null;
  accumulatorMs: number;
};

export type AdvanceResult = {
  steps: number;
  alpha: number;
  events: SimEvent[];
};

export function createClock(): LoopClock {
  return { lastMs: null, accumulatorMs: 0 };
}

/**
 * Advances the simulation from a monotonic timestamp.
 * Paused and finished runs keep the clock parked so resume does not jump.
 */
export function advance(clock: LoopClock, nowMs: number, sim: Simulation): AdvanceResult {
  if (sim.phase !== 'playing') {
    clock.lastMs = nowMs;
    clock.accumulatorMs = 0;
    return { steps: 0, alpha: 1, events: [] };
  }

  if (clock.lastMs === null || !Number.isFinite(nowMs)) {
    clock.lastMs = nowMs;
    return { steps: 0, alpha: 0, events: [] };
  }

  let delta = nowMs - clock.lastMs;
  clock.lastMs = nowMs;
  if (!Number.isFinite(delta) || delta < 0) {
    delta = 0;
  } else if (delta > LARGE_GAP_MS) {
    delta = FIXED_DT_MS;
  }

  clock.accumulatorMs += delta;
  const events: SimEvent[] = [];
  let steps = 0;
  while (
    clock.accumulatorMs >= FIXED_DT_MS &&
    steps < MAX_CATCH_UP_STEPS &&
    sim.phase === 'playing'
  ) {
    events.push(...stepTick(sim));
    clock.accumulatorMs -= FIXED_DT_MS;
    steps += 1;
  }
  if (steps === MAX_CATCH_UP_STEPS) {
    clock.accumulatorMs = 0;
  }
  const alpha = Math.min(1, clock.accumulatorMs / FIXED_DT_MS);
  return { steps, alpha, events };
}
