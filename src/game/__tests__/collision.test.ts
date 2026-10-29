import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSimulation } from '../core/simulation';
import { circlesOverlap, lethalEchoHit } from '../systems/collision';

test('circle contact is inclusive and a gap is a miss', () => {
  assert.equal(circlesOverlap(0, 0, 10, 20, 0, 10), true);
  assert.equal(circlesOverlap(0, 0, 10, 21, 0, 10), false);
});

test('only a lethal echo body hits, never its trail', () => {
  const sim = createSimulation({ arena: { width: 360, height: 640 }, seed: 1 });
  sim.echoes.push({
    id: 1,
    delayTicks: 600,
    ageTicks: 200,
    overlapGraceTicks: 0,
    phase: 'lethal',
    x: 20,
    y: 20,
    prevX: 20,
    prevY: 20,
    trail: [{ x: sim.player.x, y: sim.player.y }],
  });
  assert.equal(lethalEchoHit(sim), false);
  const echo = sim.echoes[0];
  assert.ok(echo);
  echo.x = sim.player.x;
  echo.y = sim.player.y;
  assert.equal(lethalEchoHit(sim), true);
  echo.phase = 'telegraph';
  assert.equal(lethalEchoHit(sim), false);
  echo.phase = 'invulnerable';
  assert.equal(lethalEchoHit(sim), false);
});
