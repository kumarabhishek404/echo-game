import assert from 'node:assert/strict';
import { test } from 'node:test';
import { viewToWorld, windowToWorld } from '../systems/coordinates';

test('window coordinates exclude a notch before scaling into the arena', () => {
  const mapping = {
    viewWidth: 200,
    viewHeight: 400,
    worldWidth: 400,
    worldHeight: 800,
    originX: 0,
    originY: 54,
  };
  const world = windowToWorld(100, 54 + 200, mapping);
  assert.equal(world.x, 200);
  assert.equal(world.y, 400);
});

test('playfield-local touches scale into world units', () => {
  const world = viewToWorld(90, 160, {
    viewWidth: 180,
    viewHeight: 320,
    worldWidth: 360,
    worldHeight: 640,
  });
  assert.equal(world.x, 180);
  assert.equal(world.y, 320);
});
