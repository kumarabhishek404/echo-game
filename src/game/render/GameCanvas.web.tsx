import { lazy, Suspense, type ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import type { GameCanvasProps, HudSample } from './canvasTypes';

export type { HudSample };

const CANVASKIT_VERSION = '0.41.0';

/**
 * Skia's web build captures CanvasKit when its module is first imported.
 * Load the wasm, then import the arena so that capture sees a real CanvasKit.
 * The phone build does not use this file.
 */
const Arena = lazy(async () => {
  const web = await import('@shopify/react-native-skia/lib/module/web');
  await web.LoadSkiaWeb({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${CANVASKIT_VERSION}/bin/full/${file}`,
  });
  const arena = await import('./ArenaCanvas');
  return { default: arena.ArenaCanvas as ComponentType<GameCanvasProps> };
});

export function GameCanvas(props: GameCanvasProps) {
  return (
    <Suspense fallback={<View style={styles.playfield} />}>
      <Arena {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  playfield: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
