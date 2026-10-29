# QA checklist

## What was run here

- `npm test` — 19 passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- Expo config loads (`ECHO`, portrait, dark, audio plugin with the microphone disabled).
- Expo web bundled and the home screen rendered in a browser: title, play button, best score 0. The arena itself was not exercised in that browser pass. Android and iOS were not launched. Frame rate and memory were not measured.

## Not measured

Frame rate and memory were not measured on a device. Do not treat the simulator or this checklist as a performance result.

## Device pass

Use Expo Go for SDK 58, or a development build from `npx expo run:ios` / `npx expo run:android`.

- [ ] Cold start reaches Home in about a second, portrait, black background, light status bar.
- [ ] Play starts immediately after the tutorial. Dragging from a corner moves the orb toward the finger without a jump. The orb cannot leave the arena.
- [ ] A notch or home indicator does not cover the HUD or the bottom of the orb. Touches on the canvas match the orb.
- [ ] Blue diamonds are reachable, not on top of the orb at the start, and respawn after a pickup.
- [ ] At 10 seconds a ring appears on the earlier path. It is visible before it can hit. Standing still is survivable for the telegraph, invulnerability, and overlap grace, then ends the run.
- [ ] A second ring appears at 20 seconds on the 20-second-old path, not on top of the first ring's current sample.
- [ ] The faint trail behind a ring does not match the lethal ring. Dying requires touching the ring body.
- [ ] Pause stops the clock. Backgrounding stops it. Resume shows 3, 2, 1 and does not skip time. Restart clears echoes, score, and the path in one tap.
- [ ] Game over shows time, energy, score, best, and Play Again. A higher score is still the best after killing and reopening the app.
- [ ] Sound off, haptics off, and reduced motion all persist. Silent mode does not play effects.
- [ ] No login, notification prompt, microphone prompt, or ad on restart.

## Release

- [ ] Replace the Expo template icon and splash artwork.
- [ ] Confirm `microphonePermission` stays false in `app.json`.
- [ ] Run `npx expo-doctor`.
- [ ] Produce an Android and iOS binary and repeat the device pass on a midrange Android phone.
