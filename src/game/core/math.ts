import type { Arena, Vec } from './types';

export function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return (min + max) / 2;
  }
  return Math.min(max, Math.max(min, value));
}

export function clampToArena(x: number, y: number, arena: Arena, radius: number): Vec {
  return {
    x: clamp(x, radius, arena.width - radius),
    y: clamp(y, radius, arena.height - radius),
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function distanceSquared(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}
