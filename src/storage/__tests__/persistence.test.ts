import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMemoryStore, loadSave, saveBestScore, savePreferences } from '../persistence';

test('best score and preferences round-trip through a store', async () => {
  const store = createMemoryStore();
  const empty = await loadSave(store);
  assert.equal(empty.bestScore, 0);
  assert.equal(empty.hasPreferences, false);
  assert.equal(empty.preferences.sound, true);

  await saveBestScore(store, 1540.8);
  await savePreferences(store, {
    sound: false,
    haptics: true,
    reducedMotion: true,
    tutorialSeen: true,
  });
  const loaded = await loadSave(store);
  assert.equal(loaded.bestScore, 1540);
  assert.equal(loaded.hasPreferences, true);
  assert.deepEqual(loaded.preferences, {
    sound: false,
    haptics: true,
    reducedMotion: true,
    tutorialSeen: true,
  });

  await store.setItem('echo.preferences', '{');
  const broken = await loadSave(store);
  assert.equal(broken.preferences.tutorialSeen, false);
});
