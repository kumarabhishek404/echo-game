---
name: echo-mobile-visuals
description: Minimalist Skia rendering, effect budgets, accessibility, and motion for ECHO. Use when changing the canvas, HUD, overlays, audio, haptics, or visual effects.
---

# ECHO mobile visuals

## Scene

- Background is black. The player is a filled white orb. Echoes are orange rings (shape cue, not color alone). Collectibles are electric-blue diamonds. Trails are small fading dots and must not resemble the lethal ring.
- Draw the world in arena units and scale to the gesture view. Touch mapping uses `viewToWorld` / `windowToWorld`. Do not teleport the orb to the finger.
- Prefer a few extra circles over blur, bloom, or full-screen shaders. Trail length is `echoTrailLength`. Reduced motion removes trails, ambient particles, and telegraph pulses.
- Record a Skia picture from the simulation snapshot. Do not call React `setState` per tick. HUD updates are throttled, plus an immediate update on phase changes.

## UX

- Portrait only. Playfield sits inside safe areas. Pause, primary actions, and toggles use at least a 48-point target.
- Audio is optional, mixes with other apps, and does not play in silent mode. No microphone permission. Haptics follow the settings toggle.
- Pause and background freeze the sim. Resume uses a countdown. Restart does not.
- Overlays: tutorial, pause, countdown, game over. Game over shows time, energy, score, best score, and Play Again.

## Performance

- Do not claim frame rate or memory without a measurement on a named device.
- Dispose replaced Skia pictures. Keep particle counts fixed and derived from time, not an unbounded list.
