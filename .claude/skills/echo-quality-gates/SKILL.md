---
name: echo-quality-gates
description: Unit tests, device QA, regressions, and release readiness for ECHO. Use when adding tests, running checks, or deciding whether a build is done.
---

# ECHO quality gates

## Before finishing a gameplay change

1. `npm test`
2. `npm run typecheck`
3. `npm run lint`

Say which commands ran and their results. Never invent a device build, frame rate, or memory figure.

## Regression focus

- Circular history wraparound and interpolation without invented samples.
- Echo positions equal the recorded sample at `tick - delayTicks`.
- Lethal hits use the echo body only.
- Collectibles reject the player, echoes, other pickups, and edge margins.
- Pause, background, and large gaps do not advance `tick`.
- Reset clears history, echoes, timers, and score.
- Best score and settings survive a reload via the storage interface.

## Device QA

Follow `docs/QA.md`. Expo Go can load this project because Skia, Gesture Handler, Reanimated, AsyncStorage, audio, and haptics are in the SDK 58 Expo Go bundle. A store binary still needs EAS or a local native build. Portrait, notches, silent mode, and backgrounding are manual checks.
