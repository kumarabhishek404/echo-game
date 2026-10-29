import { Canvas, Picture, Skia, type SkPicture } from '@shopify/react-native-skia';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { advance } from '../core/loop';
import { setPointer } from '../core/simulation';
import type { Phase, Simulation, ViewMapping } from '../core/types';
import { viewToWorld } from '../systems/coordinates';
import type { GameCanvasProps } from './canvasTypes';
import { createDrawer } from './drawFrame';

function blankPicture(): SkPicture {
  const recorder = Skia.PictureRecorder();
  recorder.beginRecording(Skia.XYWHRect(0, 0, 1, 1));
  return recorder.finishRecordingAsPicture();
}

export function ArenaCanvas({
  simRef,
  clockRef,
  mappingRef,
  reducedMotion,
  onArena,
  onSample,
  onEvents,
}: GameCanvasProps) {
  const picture = useSharedValue<SkPicture>(blankPicture());
  const trash = useRef<SkPicture[]>([]);
  const drawer = useRef<ReturnType<typeof createDrawer> | null>(null);
  const size = useRef({ width: 0, height: 0 });
  const impactStart = useRef<number | null>(null);
  const lastHud = useRef(0);
  const lastPhase = useRef<Phase | null>(null);
  const reducedRef = useRef(reducedMotion);
  const onArenaRef = useRef(onArena);
  const onSampleRef = useRef(onSample);
  const onEventsRef = useRef(onEvents);
  useEffect(() => {
    reducedRef.current = reducedMotion;
    onArenaRef.current = onArena;
    onSampleRef.current = onSample;
    onEventsRef.current = onEvents;
  }, [onArena, onEvents, onSample, reducedMotion]);

  const pan = usePanGesture({
    minDistance: 0,
    maxPointers: 1,
    runOnJS: true,
    onBegin: (event) => {
      aim(simRef, mappingRef, event.x, event.y, true);
    },
    onUpdate: (event) => {
      aim(simRef, mappingRef, event.x, event.y, true);
    },
    onFinalize: () => {
      const sim = simRef.current;
      if (!sim) {
        return;
      }
      setPointer(sim, false, sim.player.x, sim.player.y);
    },
  });

  useEffect(() => {
    drawer.current = createDrawer();
    let frame = 0;
    const loop = (now: number) => {
      const sim = simRef.current;
      const clock = clockRef.current;
      const view = size.current;
      if (sim && clock && view.width > 0 && view.height > 0 && drawer.current) {
        const result = advance(clock, now, sim);
        if (result.events.length > 0) {
          onEventsRef.current(result.events);
        }
        if (sim.phase === 'gameover') {
          if (impactStart.current === null) {
            impactStart.current = now;
          }
        } else {
          impactStart.current = null;
        }
        const recorder = Skia.PictureRecorder();
        const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, view.width, view.height));
        drawer.current.draw(canvas, {
          sim,
          alpha: result.alpha,
          viewWidth: view.width,
          viewHeight: view.height,
          nowMs: now,
          reducedMotion: reducedRef.current,
          impactStartMs: impactStart.current,
        });
        const next = recorder.finishRecordingAsPicture();
        const previous = picture.value;
        picture.value = next;
        trash.current.push(previous);
        if (trash.current.length > 2) {
          trash.current.shift()?.dispose();
        }
        if (now - lastHud.current > 100 || sim.phase !== lastPhase.current) {
          lastHud.current = now;
          lastPhase.current = sim.phase;
          onSampleRef.current({
            score: sim.score,
            tick: sim.tick,
            energy: sim.energyCollected,
            phase: sim.phase,
          });
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      drawer.current?.dispose();
      drawer.current = null;
      for (const old of trash.current) {
        old.dispose();
      }
      trash.current = [];
      picture.value.dispose();
    };
  }, [clockRef, picture, simRef]);

  return (
    <GestureDetector gesture={pan}>
      <View
        style={styles.playfield}
        collapsable={false}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width < 8 || height < 8) {
            return;
          }
          size.current = { width, height };
          onArenaRef.current(width, height);
          const sim = simRef.current;
          mappingRef.current = {
            viewWidth: width,
            viewHeight: height,
            worldWidth: sim?.arena.width ?? width,
            worldHeight: sim?.arena.height ?? height,
          };
        }}
      >
        <Canvas style={styles.canvas}>
          <Picture picture={picture} />
        </Canvas>
      </View>
    </GestureDetector>
  );
}

function aim(
  simRef: React.RefObject<Simulation | null>,
  mappingRef: React.RefObject<ViewMapping>,
  x: number,
  y: number,
  active: boolean,
) {
  const sim = simRef.current;
  const mapping = mappingRef.current;
  if (!sim || !mapping || sim.phase !== 'playing') {
    return;
  }
  if (mapping.viewWidth <= 0 || mapping.viewHeight <= 0) {
    return;
  }
  const world = viewToWorld(x, y, mapping);
  setPointer(sim, active, world.x, world.y);
}

const styles = StyleSheet.create({
  playfield: {
    flex: 1,
    backgroundColor: '#000000',
  },
  canvas: {
    flex: 1,
  },
});
