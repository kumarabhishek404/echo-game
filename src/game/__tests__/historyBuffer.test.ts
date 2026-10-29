import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SIM_HZ } from '../core/config';
import { HistoryBuffer } from '../core/historyBuffer';

test('circular buffer drops overwritten ticks and keeps the live window', () => {
  const history = new HistoryBuffer(4);
  for (let tick = 0; tick <= 6; tick += 1) {
    history.record(tick, tick, tick * 2);
  }
  assert.equal(history.get(0), undefined);
  assert.equal(history.get(2), undefined);
  assert.equal(history.get(3)?.x, 3);
  assert.equal(history.get(6)?.y, 12);
  assert.equal(history.get(7), undefined);
  const stale = history.get(6);
  assert.equal(stale?.tick, 6);
});

test('interpolation blends neighbors and refuses missing samples', () => {
  const history = new HistoryBuffer(8);
  history.record(0, 0, 10);
  history.record(1, 10, 20);
  const mid = history.interpolate(0.5 / SIM_HZ, SIM_HZ);
  assert.deepEqual(mid, { x: 5, y: 15 });
  assert.deepEqual(history.interpolate(0, SIM_HZ), { x: 0, y: 10 });
  assert.equal(history.interpolate(1.5 / SIM_HZ, SIM_HZ), undefined);
  assert.equal(history.interpolate(-1, SIM_HZ), undefined);

  for (let tick = 2; tick < 10; tick += 1) {
    history.record(tick, tick, 0);
  }
  assert.equal(history.interpolate(0, SIM_HZ), undefined);
  assert.equal(history.get(1), undefined);
  const live = history.interpolate(8.5 / SIM_HZ, SIM_HZ);
  assert.ok(live);
  assert.equal(live.x, 8.5);
});
