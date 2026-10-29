import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSimulation, setPointer, stepTick } from '../core/simulation';
import { computeScore, formatClock } from '../systems/scoring';

test('score counts survival time and collected energy', () => {
  const sim = createSimulation({ arena: { width: 360, height: 640 }, seed: 15 });
  sim.tick = 120;
  sim.energyCollected = 3;
  assert.equal(computeScore(sim), 320);
  assert.equal(formatClock(65), '1:05');
});

test('picking up energy replaces the collectible and raises the score', () => {
  const sim = createSimulation({ arena: { width: 360, height: 640 }, seed: 21 });
  const target = sim.collectibles[0];
  assert.ok(target);
  setPointer(sim, true, target.x, target.y);
  let picked = false;
  for (let n = 0; n < 180 && !picked; n += 1) {
    const events = stepTick(sim);
    picked = events.some((event) => event.type === 'collect');
  }
  assert.equal(picked, true);
  assert.ok(sim.energyCollected >= 1);
  assert.ok(sim.score >= sim.config.scorePerEnergy);
  setPointer(sim, true, 40, 40);
  for (let n = 0; n < 30; n += 1) {
    stepTick(sim);
  }
  assert.equal(sim.collectibles.length, sim.config.collectibleCount);
});
