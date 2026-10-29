/** Fixed simulation rate. Gameplay time is `tick / SIM_HZ`. */
export const SIM_HZ = 60;

export const FIXED_DT_MS = 1000 / SIM_HZ;

/** Drop a stall instead of simulating it. Backgrounding also pauses. */
export const LARGE_GAP_MS = 250;

/** Maximum ticks applied for one rendered frame. */
export const MAX_CATCH_UP_STEPS = 5;

export const GAME_CONFIG = {
  playerRadius: 16,
  playerMaxSpeed: 360,
  /** Exponential chase rate, in 1/seconds, still capped by playerMaxSpeed. */
  playerResponse: 14,
  echoRadius: 16,
  echoTrailLength: 8,
  collectibleRadius: 11,
  collectibleCount: 4,
  /** Collectibles stay this far inside the arena, beyond their own radius. */
  edgeMargin: 28,
  minSpawnGap: 36,
  /** Added to the player clearance after each active echo. */
  spawnPressurePerEcho: 10,
  /**
   * Distinct delays so later echoes are not samples of the same instant.
   * Echo n becomes eligible at this timestamp and replays tick - delay.
   * It stays inactive until that historical sample exists.
   */
  echoDelaysSec: [10, 20, 30, 40, 50],
  maxEchoes: 5,
  echoTelegraphSec: 0.7,
  echoInvulnSec: 0.85,
  /** Extra non-lethal time if the body still overlaps the player. */
  echoOverlapGraceSec: 0.6,
  scorePerSecond: 10,
  scorePerEnergy: 100,
  pickupPadding: 6,
  /** Buffer is longest delay plus this padding. Must cover every delay. */
  historyPaddingSec: 2,
  /** Reserved. No arena hazards until the echo loop is worth complicating. */
  hazardsEnabled: false,
  countdownSec: 3,
} as const;

export type GameConfig = {
  playerRadius: number;
  playerMaxSpeed: number;
  playerResponse: number;
  echoRadius: number;
  echoTrailLength: number;
  collectibleRadius: number;
  collectibleCount: number;
  edgeMargin: number;
  minSpawnGap: number;
  spawnPressurePerEcho: number;
  echoDelaysSec: readonly number[];
  maxEchoes: number;
  echoTelegraphSec: number;
  echoInvulnSec: number;
  echoOverlapGraceSec: number;
  scorePerSecond: number;
  scorePerEnergy: number;
  pickupPadding: number;
  historyPaddingSec: number;
  hazardsEnabled: boolean;
  countdownSec: number;
};

export function secToTicks(seconds: number): number {
  return Math.round(seconds * SIM_HZ);
}

export function historyCapacityFor(config: GameConfig): number {
  const longest = config.echoDelaysSec.reduce((max, delay) => Math.max(max, delay), 0);
  return secToTicks(longest + config.historyPaddingSec) + 2;
}
