import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameButton } from '../components/GameButton';

type HomeScreenProps = {
  bestScore: number;
  onPlay: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
};

export function HomeScreen({ bestScore, onPlay, onHowToPlay, onSettings }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <Text style={styles.mark}>ECHO</Text>
        <Text style={styles.tagline}>Every move comes back to challenge you.</Text>
      </View>
      <View style={styles.actions}>
        <GameButton label="Play" emphasis="primary" onPress={onPlay} />
        <Text style={styles.best} accessibilityRole="text">
          Best score {bestScore}
        </Text>
        <GameButton label="How to Play" onPress={onHowToPlay} />
        <GameButton label="Settings" onPress={onSettings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  hero: {
    gap: 12,
    paddingTop: 36,
  },
  mark: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: 8,
  },
  tagline: {
    color: '#C4C4C4',
    fontSize: 18,
    lineHeight: 26,
    maxWidth: 280,
  },
  actions: {
    gap: 12,
  },
  best: {
    color: '#3DDCFF',
    textAlign: 'center',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
});
