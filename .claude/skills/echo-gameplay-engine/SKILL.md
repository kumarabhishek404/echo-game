---
name: echo-gameplay-engine
description: Deterministic ECHO game loop, echo history, collision, and spawn fairness. Use when changing simulation, movement, echoes, collectibles, scoring, pause, reset, or gameplay tests.
---

# ECHO gameplay engine

Simulation lives in `src/game/core` and `src/game/systems`. It is pure TypeScript. Do not import React, Skia, or native modules into it.

## Clock

- Simulate at `SIM_HZ` (60). Time is `tick / SIM_HZ`, not a summed float.
- `advance` in `src/game/core/loop.ts` uses a monotonic millisecond clock, an accumulator, and at most `MAX_CATCH_UP_STEPS` ticks.
- Frame gaps larger than `LARGE_GAP_MS` drop the stall instead of fast-forwarding. Backgrounding must also pause the sim so a gap is never required for correctness.
- While `phase` is `paused` or `gameover`, `advance` and `stepTick` do not change tick, history, score, or echo age.

## Echoes

- Delays are `GAME_CONFIG.echoDelaysSec` (10s, 20s, 30s, ...), distinct on purpose so echoes are not stacked on one sample.
- An echo spawns only when `tick >= delayTicks` and `history.get(tick - delayTicks)` returns a sample. Never synthesize a missing sample.
- Playback is that historical sample. Echoes do not steer, chase, or predict.
- History capacity must exceed the longest delay. A too-small buffer refuses to spawn rather than replay a wrapped slot.
- New echoes start in `telegraph`, then `invulnerable`, and only then `lethal`. If the body still overlaps the player, `overlapGraceTicks` keeps them non-lethal. Trails are not collision geometry.

## Fairness

- Collectibles spawn inside the arena inset, away from the player, echoes, and other collectibles. If placement fails, skip it and retry later.
- `hazardsEnabled` stays false until the echo loop is intentionally expanded.
- `resetSimulation` clears history, echoes, collectibles, score, energy, pointer, and tick, then records a fresh tick-0 sample.

## Tests

Extend `src/game/__tests__` for buffer wraparound, interpolation gaps, replay equality, collision, spawn rejection, pause, large gaps, and reset. Keep fixtures seeded.
