import { StyleSheet, Text, View } from 'react-native';

type SplashScreenProps = {
  message?: string;
};

export function SplashScreen({ message = 'Loading' }: SplashScreenProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.mark}>ECHO</Text>
      <Text style={styles.caption}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mark: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 8,
  },
  caption: {
    color: '#A3A3A3',
    fontSize: 14,
    letterSpacing: 1,
  },
});
