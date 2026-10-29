import * as Haptics from 'expo-haptics';

export async function pulse(kind: 'light' | 'select' | 'error', enabled: boolean): Promise<void> {
  if (!enabled) {
    return;
  }
  try {
    if (kind === 'light') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (kind === 'select') {
      await Haptics.selectionAsync();
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Some devices and browsers have no haptics engine.
  }
}
