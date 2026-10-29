import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameButton } from '../components/GameButton';
import { ToggleRow } from '../components/ToggleRow';
import type { Preferences } from '../storage/persistence';

type SettingsScreenProps = {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
  onBack: () => void;
};

export function SettingsScreen({ preferences, onChange, onBack }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const patch = (partial: Partial<Preferences>) => onChange({ ...preferences, ...partial });
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.group}>
        <ToggleRow label="Sound" value={preferences.sound} onValueChange={(sound) => patch({ sound })} />
        <ToggleRow label="Haptics" value={preferences.haptics} onValueChange={(haptics) => patch({ haptics })} />
        <ToggleRow
          label="Reduced motion"
          value={preferences.reducedMotion}
          onValueChange={(reducedMotion) => patch({ reducedMotion })}
        />
      </View>
      <Text style={styles.note}>Sound stays off while the device is silenced. Nothing here uses the network.</Text>
      <GameButton label="Back" emphasis="primary" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    gap: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  group: {
    gap: 4,
  },
  note: {
    color: '#A3A3A3',
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
});
