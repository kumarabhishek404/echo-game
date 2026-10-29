import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStore } from './types';

export const asyncStore: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};
