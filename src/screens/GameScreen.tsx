import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pulse } from '../audio/feedback';
import { useSfx } from '../audio/useSfx';
import { CanvasBoundary } from '../components/CanvasBoundary';
import { GameButton } from '../components/GameButton';
import { SIM_HZ } from '../game/core/config';
import { createClock } from '../game/core/loop';
import {
  createSimulation,
  pauseSimulation,
  resetSimulation,
  resumeSimulation,
} from '../game/core/simulation';
import type { Simulation, ViewMapping } from '../game/core/types';
import { GameCanvas, type HudSample } from '../game/render/GameCanvas';
import { formatClock } from '../game/systems/scoring';
import type { Preferences } from '../storage/persistence';

type GameScreenProps = {
  preferences: Preferences;
  bestScore: number;
  onBestScore: (score: number) => void;
  onTutorialSeen: () => void;
  onHome: () => void;
};

const EMPTY_HUD: HudSample = { score: 0, tick: 0, energy: 0, phase: 'playing' };

export function GameScreen({
  preferences,
  bestScore,
  onBestScore,
  onTutorialSeen,
  onHome,
}: GameScreenProps) {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const sfx = useSfx(preferences.sound);
  const simRef = useRef<Simulation | null>(null);
  const clockRef = useRef(createClock());
  const mappingRef = useRef<ViewMapping>({
    viewWidth: 1,
    viewHeight: 1,
    worldWidth: 1,
    worldHeight: 1,
  });
  const pausedBy = useRef<'user' | 'background' | null>(null);
  const scored = useRef(false);
  const [hud, setHud] = useState<HudSample>(EMPTY_HUD);
  const [count, setCount] = useState<number | null>(null);
  const [tutorial, setTutorial] = useState(!preferences.tutorialSeen);
  const [record, setRecord] = useState(false);
  const tutorialRef = useRef(tutorial);
  useEffect(() => {
    tutorialRef.current = tutorial;
  }, [tutorial]);

  const onArena = useCallback(
    (width: number, height: number) => {
      if (simRef.current) {
        return;
      }
      simRef.current = createSimulation({
        arena: { width, height },
        startPaused: !preferences.tutorialSeen,
      });
      clockRef.current = createClock();
      setHud({ score: 0, tick: 0, energy: 0, phase: simRef.current.phase });
    },
    [preferences.tutorialSeen],
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const sim = simRef.current;
      if (!sim || tutorialRef.current) {
        return;
      }
      if ((next === 'background' || next === 'inactive') && sim.phase === 'playing') {
        pauseSimulation(sim);
        pausedBy.current = 'background';
        setCount(null);
        setHud((current) => ({ ...current, phase: 'paused' }));
      }
      if (next === 'active' && pausedBy.current === 'background' && sim.phase === 'paused') {
        pausedBy.current = null;
        setCount(3);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (count === null) {
      return;
    }
    const id = setTimeout(() => {
      if (count <= 1) {
        const sim = simRef.current;
        if (sim) {
          resumeSimulation(sim);
        }
        clockRef.current = createClock();
        setHud((current) => ({ ...current, phase: 'playing' }));
        setCount(null);
        return;
      }
      setCount(count - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [count]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const sim = simRef.current;
      if (sim && sim.phase === 'playing' && !tutorialRef.current) {
        pauseSimulation(sim);
        pausedBy.current = 'user';
        setHud((current) => ({ ...current, phase: 'paused' }));
        return true;
      }
      onHome();
      return true;
    });
    return () => sub.remove();
  }, [onHome]);

  const pause = () => {
    const sim = simRef.current;
    if (!sim || sim.phase !== 'playing') {
      return;
    }
    pauseSimulation(sim);
    pausedBy.current = 'user';
    setHud((current) => ({ ...current, phase: 'paused' }));
  };

  const restart = () => {
    const sim = simRef.current;
    if (!sim) {
      return;
    }
    resetSimulation(sim);
    clockRef.current = createClock();
    pausedBy.current = null;
    scored.current = false;
    setRecord(false);
    setCount(null);
    setTutorial(false);
    setHud(EMPTY_HUD);
  };

  const dismissTutorial = () => {
    setTutorial(false);
    onTutorialSeen();
    const sim = simRef.current;
    if (sim) {
      resumeSimulation(sim);
    }
    clockRef.current = createClock();
    setHud((current) => ({ ...current, phase: 'playing' }));
  };

  const showCountdown = count !== null && count > 0;
  const showPause = hud.phase === 'paused' && !tutorial && !showCountdown;
  const showOver = hud.phase === 'gameover';

  return (
    <View style={styles.screen}>
      <View style={[styles.hud, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.hudLabel}>Score</Text>
          <Text style={styles.hudValue}>{hud.score}</Text>
        </View>
        <View>
          <Text style={styles.hudLabel}>Time</Text>
          <Text style={styles.hudValue}>{formatClock(hud.tick / SIM_HZ)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pause"
          onPress={pause}
          style={styles.pause}
        >
          <Text style={styles.pauseLabel}>Pause</Text>
        </Pressable>
      </View>
      <View style={[styles.stage, { marginBottom: insets.bottom }]}>
        <CanvasBoundary>
          <GameCanvas
          simRef={simRef}
          clockRef={clockRef}
          mappingRef={mappingRef}
          reducedMotion={preferences.reducedMotion}
          onArena={onArena}
          onSample={(sample) => {
            setHud(sample);
            if (sample.phase !== 'gameover' || scored.current) {
              return;
            }
            scored.current = true;
            if (sample.score > bestScore) {
              setRecord(true);
              onBestScore(sample.score);
            }
          }}
          onEvents={(events) => {
            for (const event of events) {
              if (event.type === 'collect') {
                sfx.collect();
                void pulse('light', preferences.haptics);
              } else if (event.type === 'echo-spawn') {
                sfx.spawn();
                void pulse('select', preferences.haptics);
              } else {
                sfx.over();
                void pulse('error', preferences.haptics);
              }
            }
          }}
        />
        </CanvasBoundary>
        {tutorial ? (
          <View style={styles.overlay} accessibilityViewIsModal>
            <Text style={styles.overlayTitle}>Drag to move</Text>
            <Text style={styles.overlayBody}>
              The white orb follows your finger. After a short grace period, your own path returns as a ring. Only the
              ring can end the run.
            </Text>
            <GameButton label="Got it" emphasis="primary" onPress={dismissTutorial} />
          </View>
        ) : null}
        {showPause ? (
          <View style={styles.overlay} accessibilityViewIsModal>
            <Text style={styles.overlayTitle}>Paused</Text>
            <GameButton label="Resume" emphasis="primary" onPress={() => setCount(3)} />
            <GameButton label="Restart" onPress={restart} />
            <GameButton label="Home" onPress={onHome} />
          </View>
        ) : null}
        {showCountdown ? (
          <View style={styles.overlay} accessibilityViewIsModal>
            <Text style={styles.count}>{count}</Text>
          </View>
        ) : null}
        {showOver ? (
          <View style={styles.overlay} accessibilityViewIsModal>
            <Text style={styles.overlayTitle}>{record ? 'New best' : 'Run over'}</Text>
            <Text style={styles.stat}>Time {formatClock(hud.tick / SIM_HZ)}</Text>
            <Text style={styles.stat}>Energy {hud.energy}</Text>
            <Text style={styles.stat}>Score {hud.score}</Text>
            <Text style={styles.stat}>Best {Math.max(bestScore, hud.score)}</Text>
            <GameButton label="Play Again" emphasis="primary" onPress={restart} />
            <GameButton label="Home" onPress={onHome} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hud: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  hudLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  hudValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pause: {
    minWidth: 76,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  overlayBody: {
    color: '#D4D4D4',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  count: {
    color: '#FFFFFF',
    fontSize: 84,
    fontWeight: '700',
  },
  stat: {
    color: '#F5F5F5',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
});
