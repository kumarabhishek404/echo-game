# ECHO

Portrait arcade survival. Drag the white orb. After a grace period, your own path comes back as a ring.

The simulation is TypeScript. Rendering is React Native Skia on Expo SDK 58. There is no account, network, or ads.

## Language and stack

- TypeScript
- Expo SDK 58, React Native 0.88, React 19.3
- `@shopify/react-native-skia` 2.14.0
- `react-native-gesture-handler` 3.3
- `react-native-reanimated` 4.7
- `expo-audio`, `expo-haptics`, `expo-keep-awake`
- `@react-native-async-storage/async-storage` 2.2.0

Versions were taken from the Expo SDK 58 native module list (`https://api.expo.dev/v2/sdks/58.0.0/native-modules`) and installed with `npx expo install`.

## Run

```bash
npm install
npx expo start
```

Then open the project in Expo Go on Android or iOS (SDK 58). Skia, Gesture Handler, Reanimated, AsyncStorage, audio, and haptics are in that Expo Go bundle.

```bash
npm run ios
npm run android
npm run web
```

`web` is useful for layout smoke tests. Touch, haptics, and silent-mode audio still need a device.

## Checks

```bash
npm test
npm run typecheck
npm run lint
```

## Build

Native projects are generated, not committed. For a store binary:

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

Or use EAS: `npx eas-cli@latest build`. Replace the template icon before release. See `docs/QA.md`.

## Docs

- `docs/ARCHITECTURE.md` — modules, clock, coordinates
- `docs/TUNING.md` — delays, speed, scoring
- `docs/QA.md` — device checklist
- `AGENTS.md` — rules for future edits

## Defaults

- Echo delays: 10s, 20s, 30s, 40s, 50s. Cap is 5.
- An echo spawns only when the history buffer still has `tick - delay`. It copies that sample. It does not chase.
- Telegraph, then invulnerability, then a short overlap grace. Trails are not lethal.
- Arena hazards are off (`hazardsEnabled: false`).
- Pause and background freeze simulation time. Resume counts down from 3. Restart does not.
- Restart uses the next seed so the diamonds move. Pass the same seed to `resetSimulation` to repeat a layout.
- Audio mixes with other apps and stays off in silent mode. The audio plugin does not request a microphone.
