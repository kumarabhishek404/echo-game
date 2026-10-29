import { secToTicks } from '../core/config';
import type { Echo, SimEvent, Simulation } from '../core/types';
import { circlesOverlap } from './collision';

/**
 * Echoes become active only when their delay has elapsed and the history
 * buffer still holds `tick - delayTicks`. Positions are copied from that
 * sample. Missing samples are skipped, never interpolated into existence.
 */
export function updateEchoes(sim: Simulation): SimEvent[] {
  const events: SimEvent[] = [];
  const delays = sim.config.echoDelaysSec;
  const limit = Math.min(delays.length, sim.config.maxEchoes);

  for (let index = 0; index < limit; index += 1) {
    const id = index + 1;
    if (sim.echoes.some((echo) => echo.id === id)) {
      continue;
    }
    const delayTicks = secToTicks(delays[index] ?? 0);
    if (sim.tick < delayTicks) {
      continue;
    }
    const sample = sim.history.get(sim.tick - delayTicks);
    if (!sample) {
      continue;
    }
    const echo: Echo = {
      id,
      delayTicks,
      ageTicks: 0,
      overlapGraceTicks: secToTicks(sim.config.echoOverlapGraceSec),
      phase: 'telegraph',
      x: sample.x,
      y: sample.y,
      prevX: sample.x,
      prevY: sample.y,
      trail: [],
    };
    applySample(sim, echo, sample.x, sample.y);
    classifyEcho(sim, echo);
    sim.echoes.push(echo);
    events.push({ type: 'echo-spawn', id });
  }

  for (const echo of sim.echoes) {
    if (events.some((event) => event.type === 'echo-spawn' && event.id === echo.id)) {
      continue;
    }
    echo.ageTicks += 1;
    const sample = sim.history.get(sim.tick - echo.delayTicks);
    if (sample) {
      applySample(sim, echo, sample.x, sample.y);
    }
    classifyEcho(sim, echo);
  }

  return events;
}

function applySample(sim: Simulation, echo: Echo, x: number, y: number): void {
  echo.prevX = echo.x;
  echo.prevY = echo.y;
  echo.x = x;
  echo.y = y;
  echo.trail.push({ x, y });
  const extra = echo.trail.length - sim.config.echoTrailLength;
  if (extra > 0) {
    echo.trail.splice(0, extra);
  }
}

function classifyEcho(sim: Simulation, echo: Echo): void {
  const telegraphTicks = secToTicks(sim.config.echoTelegraphSec);
  const invulnTicks = secToTicks(sim.config.echoInvulnSec);
  if (echo.ageTicks < telegraphTicks) {
    echo.phase = 'telegraph';
    return;
  }
  if (echo.ageTicks < telegraphTicks + invulnTicks) {
    echo.phase = 'invulnerable';
    return;
  }
  const overlapping = circlesOverlap(
    sim.player.x,
    sim.player.y,
    sim.config.playerRadius,
    echo.x,
    echo.y,
    sim.config.echoRadius,
  );
  if (overlapping && echo.overlapGraceTicks > 0) {
    echo.phase = 'invulnerable';
    echo.overlapGraceTicks -= 1;
    return;
  }
  echo.phase = 'lethal';
}

/** No-op while hazards are disabled. Kept so difficulty can grow in one place. */
export function updateHazards(sim: Simulation): void {
  if (!sim.config.hazardsEnabled) {
    return;
  }
}
