import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSimulation } from '../core/simulation';
import { isFairCollectiblePoint } from '../systems/collectibles';

test('the same seed scatters the same fair collectibles', () => {
  const arena = { width: 360, height: 640 };
  const a = createSimulation({ arena, seed: 42 });
  const b = createSimulation({ arena, seed: 42 });
  assert.equal(a.collectibles.length, a.config.collectibleCount);
  assert.deepEqual(
    a.collectibles.map((item) => [item.x, item.y]),
    b.collectibles.map((item) => [item.x, item.y]),
  );
  for (const item of a.collectibles) {
    const saved = a.collectibles;
    a.collectibles = saved.filter((other) => other.id !== item.id);
    assert.equal(isFairCollectiblePoint(a, item.x, item.y), true);
    a.collectibles = saved;
  }
});

test('collectibles reject the player, echoes, and the edge margin', () => {
  const sim = createSimulation({ arena: { width: 360, height: 640 }, seed: 7 });
  assert.equal(isFairCollectiblePoint(sim, sim.player.x, sim.player.y), false);
  assert.equal(isFairCollectiblePoint(sim, 4, 4), false);
  assert.equal(isFairCollectiblePoint(sim, 350, 620), false);
  sim.echoes.push({
    id: 1,
    delayTicks: 600,
    ageTicks: 0,
    overlapGraceTicks: 0,
    phase: 'telegraph',
    x: 80,
    y: 80,
    prevX: 80,
    prevY: 80,
    trail: [],
  });
  assert.equal(isFairCollectiblePoint(sim, 80, 80), false);
});
