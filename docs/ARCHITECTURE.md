# Architecture

ECHO is a single Expo app. Screens swap in `App.tsx`. The playfield does not use a router because pause, countdown, and game over share one simulation instance.

## Modules

| Path | Role |
| --- | --- |
| `src/game/core` | Config, seeded RNG, history ring, fixed-step clock, simulation lifecycle |
| `src/game/systems` | Movement, coordinates, echoes, collectibles, collision, scoring |
| `src/game/render` | Skia picture recording and the gesture view |
| `src/screens` | Splash, home, how to play, settings, gameplay overlays |
| `src/storage` | Best score and preferences behind a small store interface |
| `src/audio` | Optional effects and haptics |
| `src/game/__tests__` | Deterministic simulation tests |

## Clock

`stepTick` is one 60Hz step. Gameplay time is `tick / 60`. `advance` turns a monotonic millisecond timestamp into a bounded number of steps.

- The accumulator runs at most `MAX_CATCH_UP_STEPS` (5) ticks per frame, then drops the remainder.
- A gap larger than `LARGE_GAP_MS` (250ms) is collapsed to one step.
- `paused` and `gameover` park the clock. The next playing frame does not replay the gap.
- Leaving the app pauses before that safety net matters.

React state updates the HUD about ten times a second, and immediately when the phase changes. The canvas reads the mutated simulation and swaps a Skia picture. Positions are lerped across the previous completed step.

## Coordinates

The arena is locked to the playfield size in points on the first layout. `viewToWorld` scales a gesture-local point into that arena. `windowToWorld` subtracts the playfield origin first, which is how a notch above the canvas is kept out of the world. The orb eases toward the clamped touch at a capped speed. It never teleports.

## Echoes

History stores one sample per tick in a ring sized to the longest delay plus padding. `history.get` returns undefined for overwritten or missing ticks. `interpolate` returns undefined unless both neighbors exist.

Echo *n* uses `echoDelaysSec[n - 1]`. On the tick that delay elapses, it spawns only if `history.get(tick - delayTicks)` exists, then copies that sample every tick. Later echoes use longer delays so they are not the same pose.

New echoes are `telegraph`, then `invulnerable`, then `lethal`. Overlap at the end of invulnerability spends `echoOverlapGraceSec` before the body can hit. Collision tests the lethal body only.

## Persistence

`loadSave` / `saveBestScore` / `savePreferences` take a `KeyValueStore`. The app passes AsyncStorage. Tests pass an in-memory store. Reduced motion starts from the system setting until the player saves a preference.
