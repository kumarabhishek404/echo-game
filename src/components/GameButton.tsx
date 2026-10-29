import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

type GameButtonProps = {
  label: string;
  onPress: () => void;
  emphasis?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
};

export function GameButton({ label, onPress, emphasis = 'secondary', style }: GameButtonProps) {
  const primary = emphasis === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#F5F5F5',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  pressed: {
    opacity: 0.72,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: '#050505',
  },
  secondaryLabel: {
    color: '#F5F5F5',
  },
});
