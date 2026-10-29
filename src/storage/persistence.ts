import type { KeyValueStore } from './types';

export const STORAGE_KEYS = {
  bestScore: 'echo.bestScore',
  preferences: 'echo.preferences',
} as const;

export type Preferences = {
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
  tutorialSeen: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  sound: true,
  haptics: true,
  reducedMotion: false,
  tutorialSeen: false,
};

export type SaveData = {
  bestScore: number;
  preferences: Preferences;
  hasPreferences: boolean;
};

export function createMemoryStore(initial?: Record<string, string>): KeyValueStore & {
  dump: () => Record<string, string>;
} {
  const data = { ...initial };
  return {
    async getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] ?? null : null;
    },
    async setItem(key: string, value: string) {
      data[key] = value;
    },
    dump: () => ({ ...data }),
  };
}

export async function loadSave(store: KeyValueStore): Promise<SaveData> {
  const [bestRaw, prefsRaw] = await Promise.all([
    store.getItem(STORAGE_KEYS.bestScore),
    store.getItem(STORAGE_KEYS.preferences),
  ]);
  return {
    bestScore: parseBest(bestRaw),
    preferences: parsePreferences(prefsRaw),
    hasPreferences: prefsRaw !== null,
  };
}

export async function saveBestScore(store: KeyValueStore, score: number): Promise<void> {
  await store.setItem(STORAGE_KEYS.bestScore, String(Math.max(0, Math.floor(score))));
}

export async function savePreferences(store: KeyValueStore, preferences: Preferences): Promise<void> {
  await store.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
}

function parseBest(raw: string | null): number {
  if (!raw) {
    return 0;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

function parsePreferences(raw: string | null): Preferences {
  if (!raw) {
    return { ...DEFAULT_PREFERENCES };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      sound: parsed.sound !== false,
      haptics: parsed.haptics !== false,
      reducedMotion: parsed.reducedMotion === true,
      tutorialSeen: parsed.tutorialSeen === true,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}
