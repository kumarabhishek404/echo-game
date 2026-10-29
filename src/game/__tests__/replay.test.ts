import assert from 'node:assert/strict';
import { test } from 'node:test';
import { secToTicks } from '../core/config';
import { createSimulation, setPointer, stepTick } from '../core/simulation';

test('echoes replay recorded samples and ignore missing history', () => {
  const arena = { width: 480, height: 854 };
  const sim = createSimulation({ arena, seed: 9 });
  const corners = [
    { x: 48, y: 72 },
    { x: arena.width - 48, y: 72 },
    { x: arena.width - 48, y: arena.height - 72 },
    { x: 48, y: arena.height - 72 },
  ];

  for (let n = 0; n < secToTicks(21); n += 1) {
    const threats = sim.echoes.map((echo) => ({ x: echo.x, y: echo.y }));
    let choice = corners[0] ?? { x: 48, y: 72 };
    let best = -1;
    for (const corner of corners) {
      let nearest = 10_000;
      for (const threat of threats) {
        nearest = Math.min(nearest, Math.hypot(corner.x - threat.x, corner.y - threat.y));
      }
      if (threats.length === 0) {
        nearest = 1;
      }
      if (nearest > best) {
        best = nearest;
        choice = corner;
      }
    }
    setPointer(sim, true, choice.x, choice.y);
    stepTick(sim);
    for (const echo of sim.echoes) {
      const sample = sim.history.get(sim.tick - echo.delayTicks);
      assert.ok(sample, `echo ${echo.id} sampled an empty tick`);
      assert.equal(echo.x, sample.x);
      assert.equal(echo.y, sample.y);
    }
  }

  assert.equal(sim.phase, 'playing');
  assert.equal(sim.echoes.length >= 2, true);
  const first = sim.echoes[0];
  const second = sim.echoes[1];
  assert.ok(first && second);
  assert.equal(first.delayTicks, secToTicks(10));
  assert.equal(second.delayTicks, secToTicks(20));
  assert.notEqual(first.x, second.x);
  const atSpawn = secToTicks(10);
  assert.equal(sim.history.get(atSpawn)?.x !== undefined, true);
});

test('a stationary player is not killed on the echo spawn tick', () => {
  const sim = createSimulation({ arena: { width: 360, height: 640 }, seed: 2 });
  const spawn = secToTicks(10);
  for (let n = 0; n < spawn; n += 1) {
    stepTick(sim);
  }
  assert.equal(sim.tick, spawn);
  assert.equal(sim.phase, 'playing');
  assert.equal(sim.echoes[0]?.phase, 'telegraph');
  assert.equal(sim.echoes[0]?.x, sim.history.get(0)?.x);

  let guard = secToTicks(4);
  while (sim.phase === 'playing' && guard > 0) {
    stepTick(sim);
    guard -= 1;
  }
  assert.equal(sim.phase, 'gameover');
  const lived = sim.tick - spawn;
  const minimum =
    secToTicks(sim.config.echoTelegraphSec) + secToTicks(sim.config.echoInvulnSec);
  const maximum = minimum + secToTicks(sim.config.echoOverlapGraceSec) + 1;
  assert.ok(lived >= minimum);
  assert.ok(lived <= maximum);
});

test('an undersized history buffer never replays a wrapped sample', () => {
  const sim = createSimulation({
    arena: { width: 360, height: 640 },
    seed: 5,
    historyCapacity: 30,
  });
  setPointer(sim, true, 300, 400);
  for (let n = 0; n < secToTicks(10) + 5; n += 1) {
    stepTick(sim);
  }
  assert.equal(sim.echoes.length, 0);
  assert.equal(sim.phase, 'playing');
  assert.equal(sim.history.get(0), undefined);
});
