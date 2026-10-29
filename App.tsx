import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync } from 'expo-audio';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { HowToPlayScreen } from './src/screens/HowToPlayScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { asyncStore } from './src/storage/asyncStore';
import {
  DEFAULT_PREFERENCES,
  loadSave,
  saveBestScore,
  savePreferences,
  type Preferences,
} from './src/storage/persistence';

type Route = 'splash' | 'home' | 'game' | 'settings' | 'howto';

export default function App() {
  const [route, setRoute] = useState<Route>('splash');
  const [bestScore, setBestScore] = useState(0);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    let live = true;
    const started = Date.now();
    loadSave(asyncStore)
      .then(async (save) => {
        let next = save.preferences;
        if (!save.hasPreferences) {
          try {
            const systemReduce = await AccessibilityInfo.isReduceMotionEnabled();
            next = { ...next, reducedMotion: systemReduce };
          } catch {
            next = save.preferences;
          }
        }
        const wait = Math.max(0, 650 - (Date.now() - started));
        await new Promise((resolve) => setTimeout(resolve, wait));
        if (!live) {
          return;
        }
        setBestScore(save.bestScore);
        setPreferences(next);
        setRoute('home');
      })
      .catch(() => {
        if (live) {
          setRoute('home');
        }
      });
    return () => {
      live = false;
    };
  }, []);

  const updatePreferences = (next: Preferences) => {
    setPreferences(next);
    savePreferences(asyncStore, next).catch(() => undefined);
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.root}>
          {route === 'splash' ? <SplashScreen /> : null}
          {route === 'home' ? (
            <HomeScreen
              bestScore={bestScore}
              onPlay={() => setRoute('game')}
              onHowToPlay={() => setRoute('howto')}
              onSettings={() => setRoute('settings')}
            />
          ) : null}
          {route === 'howto' ? <HowToPlayScreen onBack={() => setRoute('home')} /> : null}
          {route === 'settings' ? (
            <SettingsScreen
              preferences={preferences}
              onChange={updatePreferences}
              onBack={() => setRoute('home')}
            />
          ) : null}
          {route === 'game' ? (
            <GameScreen
              preferences={preferences}
              bestScore={bestScore}
              onBestScore={(score) => {
                setBestScore(score);
                saveBestScore(asyncStore, score).catch(() => undefined);
              }}
              onTutorialSeen={() => updatePreferences({ ...preferences, tutorialSeen: true })}
              onHome={() => setRoute('home')}
            />
          ) : null}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
