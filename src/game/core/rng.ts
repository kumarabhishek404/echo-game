/**
 * Mulberry32. `rngState` is the full generator state so a run can be replayed.
 */
export function nextUnit(host: { rngState: number }): number {
  let a = host.rngState | 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  host.rngState = a >>> 0;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function hashSeed(seed: number): number {
  const mixed = Math.imul(seed | 0, 0x9e3779b1) ^ 0x85ebca6b;
  return mixed >>> 0;
}
