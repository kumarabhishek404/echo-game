import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameButton } from '../components/GameButton';

type HowToPlayScreenProps = {
  onBack: () => void;
};

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How to Play</Text>
        <Text style={styles.body}>Drag anywhere. The white orb follows your finger and stays inside the arena.</Text>
        <Text style={styles.body}>Blue diamonds are energy. Each one adds to your score and another appears.</Text>
        <Text style={styles.body}>
          After 10 seconds, Echo 1 replays the path you took 10 seconds earlier. It does not chase you. The ring is
          dangerous. The faint dots behind it are not.
        </Text>
        <Text style={styles.body}>
          Echo 2 arrives at 20 seconds, Echo 3 at 30, and so on, each on its own delay. A new echo is visible before it
          can hit you.
        </Text>
        <Text style={styles.body}>Pause freezes time. Leaving the app pauses too. Resume counts down, then continues.</Text>
      </ScrollView>
      <GameButton label="Back" emphasis="primary" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    gap: 16,
  },
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  body: {
    color: '#D4D4D4',
    fontSize: 17,
    lineHeight: 25,
  },
});
