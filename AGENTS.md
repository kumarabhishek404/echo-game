# ECHO

Portrait survival game. The player drags a white orb. After 10 seconds, Echo 1 replays that path from 10 seconds earlier. Echo 2 uses 20 seconds, then 30, 40, and 50, up to five rings. Echoes copy recorded samples. They do not chase.

## Stack

TypeScript, Expo SDK 58, React Native 0.88. Confirm `expo` in `package.json` and use the matching docs at `https://docs.expo.dev/versions/v58.0.0/` before changing an Expo API. Install native modules with `npx expo install`.

Skia, Gesture Handler 3 (`usePanGesture`), Reanimated, AsyncStorage, `expo-audio`, and `expo-haptics` are part of this SDK. Do not add login, networking, ads, or notification permission.

## Layout

- `src/game/core` — 60Hz tick, accumulator, seeded RNG, history ring
- `src/game/systems` — input integration, echoes, collectibles, collision, score
- `src/game/render` — Skia picture, gestures
- `src/screens` — splash, home, settings, how to play, game
- `src/storage` — best score and preferences
- `src/audio` — optional effects

Screens are a state switch in `App.tsx`. The game loop stays mounted under the overlays. Do not move collision into React state or into the canvas.

## Rules that tests lock

- History lookup of an overwritten tick is undefined. Interpolation needs both neighbors.
- An echo spawns only when `history.get(tick - delayTicks)` exists.
- Lethal collision uses the echo body, not `trail`.
- Collectibles stay out of the player, echoes, other diamonds, and the edge margin.
- Pause, a backward timestamp, and a multi-second frame gap do not fast-forward the run.
- `resetSimulation` clears tick, history, echoes, score, energy, and the pointer.

## Commands

```bash
npm test
npm run typecheck
npm run lint
npx expo start
```

## Done

Tests, `tsc --noEmit`, and lint pass. Device frame rate is reported only when it was measured. Read `.claude/skills/echo-gameplay-engine/SKILL.md`, `echo-mobile-visuals`, and `echo-quality-gates` before changing those areas. Cursor loads `.cursor/rules/echo.mdc` automatically. The skill files are project docs, not runtime imports.

## Expo notes carried forward

`ios/` and `android/` are generated. Change native behavior through `app.json` and config plugins. Expo Go for SDK 58 can run this project. A store build still needs `expo run` or EAS.
