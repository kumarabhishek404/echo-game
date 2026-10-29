import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_CATCH_UP_STEPS } from '../core/config';
import { advance, createClock } from '../core/loop';
import {
  createSimulation,
  pauseSimulation,
  resetSimulation,
  resumeSimulation,
  setPointer,
  stepTick,
} from '../core/simulation';

const arena = { width: 360, height: 640 };

test('pause and a backward clock do not advance time', () => {
  const sim = createSimulation({ arena, seed: 8 });
  const clock = createClock();
  advance(clock, 1_000, sim);
  advance(clock, 1_100, sim);
  const tick = sim.tick;
  pauseSimulation(sim);
  const paused = advance(clock, 20_000, sim);
  assert.equal(paused.steps, 0);
  assert.equal(sim.tick, tick);
  stepTick(sim);
  assert.equal(sim.tick, tick);
  resumeSimulation(sim);
  const backward = advance(clock, 19_000, sim);
  assert.equal(backward.steps, 0);
  assert.equal(sim.tick, tick);
});

test('large frame gaps are capped', () => {
  const sim = createSimulation({ arena, seed: 8 });
  const clock = createClock();
  advance(clock, 0, sim);
  const stalled = advance(clock, 5_000, sim);
  assert.equal(stalled.steps, 1);
  assert.equal(sim.tick, 1);

  const burst = advance(clock, 5_000 + 100, sim);
  assert.equal(burst.steps, MAX_CATCH_UP_STEPS);
  assert.equal(sim.tick, 1 + MAX_CATCH_UP_STEPS);
});

test('reset clears history, echoes, score, and the pointer', () => {
  const sim = createSimulation({ arena, seed: 11 });
  setPointer(sim, true, 300, 500);
  for (let n = 0; n < 700; n += 1) {
    stepTick(sim);
  }
  assert.ok(sim.tick > 600);
  assert.ok(sim.echoes.length >= 1);
  resetSimulation(sim, 11);
  assert.equal(sim.tick, 0);
  assert.equal(sim.phase, 'playing');
  assert.equal(sim.echoes.length, 0);
  assert.equal(sim.score, 0);
  assert.equal(sim.energyCollected, 0);
  assert.equal(sim.pointer.active, false);
  assert.equal(sim.history.get(700), undefined);
  assert.equal(sim.history.get(0)?.x, arena.width / 2);
  assert.equal(sim.seed, 11);
});
