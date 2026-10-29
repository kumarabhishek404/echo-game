import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SIM_HZ } from '../core/config';
import { createSimulation, setPointer, stepTick } from '../core/simulation';

const arena = { width: 360, height: 640 };

test('a far drag does not teleport and respects the speed cap', () => {
  const sim = createSimulation({ arena, seed: 3 });
  const startX = sim.player.x;
  setPointer(sim, true, arena.width - 5, 12);
  stepTick(sim);
  const step = Math.hypot(sim.player.x - startX, sim.player.y - sim.previousPlayer.y);
  assert.ok(step <= sim.config.playerMaxSpeed / SIM_HZ + 1e-6);
  assert.ok(Math.hypot(sim.player.x - (arena.width - 5), sim.player.y - 12) > 20);

  for (let i = 0; i < SIM_HZ; i += 1) {
    stepTick(sim);
  }
  const traveled = Math.hypot(sim.player.x - startX, sim.player.y - arena.height / 2);
  assert.ok(traveled <= sim.config.playerMaxSpeed + 1);
  assert.ok(sim.player.x >= sim.config.playerRadius);
  assert.ok(sim.player.x <= arena.width - sim.config.playerRadius);
  assert.ok(sim.player.y >= sim.config.playerRadius);
  assert.ok(sim.player.y <= arena.height - sim.config.playerRadius);
});

test('releasing the pointer stops the orb', () => {
  const sim = createSimulation({ arena, seed: 4 });
  setPointer(sim, true, 300, 320);
  for (let i = 0; i < 10; i += 1) {
    stepTick(sim);
  }
  setPointer(sim, false, 0, 0);
  const x = sim.player.x;
  const y = sim.player.y;
  stepTick(sim);
  assert.equal(sim.player.x, x);
  assert.equal(sim.player.y, y);
});
