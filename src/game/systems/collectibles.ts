import { distanceSquared } from '../core/math';
import { nextUnit } from '../core/rng';
import type { Collectible, SimEvent, Simulation, Vec } from '../core/types';

export function playerClearance(sim: Simulation): number {
  const longest = Math.min(sim.arena.width, sim.arena.height);
  const pressured =
    sim.config.minSpawnGap + sim.echoes.length * sim.config.spawnPressurePerEcho;
  return Math.min(pressured, longest * 0.28);
}

export function isFairCollectiblePoint(sim: Simulation, x: number, y: number): boolean {
  const radius = sim.config.collectibleRadius;
  const margin = sim.config.edgeMargin;
  if (x < margin + radius || y < margin + radius) {
    return false;
  }
  if (x > sim.arena.width - margin - radius || y > sim.arena.height - margin - radius) {
    return false;
  }

  const clearance = playerClearance(sim);
  const playerReach = sim.config.playerRadius + radius + clearance;
  if (distanceSquared(x, y, sim.player.x, sim.player.y) <= playerReach * playerReach) {
    return false;
  }

  for (const echo of sim.echoes) {
    const reach = sim.config.echoRadius + radius + sim.config.minSpawnGap;
    if (distanceSquared(x, y, echo.x, echo.y) <= reach * reach) {
      return false;
    }
  }

  for (const other of sim.collectibles) {
    const reach = radius * 2 + sim.config.minSpawnGap;
    if (distanceSquared(x, y, other.x, other.y) <= reach * reach) {
      return false;
    }
  }

  return true;
}

export function trySpawnCollectible(sim: Simulation): Vec | undefined {
  const radius = sim.config.collectibleRadius;
  const margin = sim.config.edgeMargin;
  const minX = margin + radius;
  const maxX = sim.arena.width - margin - radius;
  const minY = margin + radius;
  const maxY = sim.arena.height - margin - radius;
  if (maxX <= minX || maxY <= minY) {
    return undefined;
  }

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const x = minX + nextUnit(sim) * (maxX - minX);
    const y = minY + nextUnit(sim) * (maxY - minY);
    if (isFairCollectiblePoint(sim, x, y)) {
      return { x, y };
    }
  }
  return undefined;
}

export function fillCollectibles(sim: Simulation): void {
  let guard = sim.config.collectibleCount * 2;
  while (sim.collectibles.length < sim.config.collectibleCount && guard > 0) {
    guard -= 1;
    const point = trySpawnCollectible(sim);
    if (!point) {
      return;
    }
    sim.collectibles.push({
      id: sim.nextCollectibleId,
      x: point.x,
      y: point.y,
    });
    sim.nextCollectibleId += 1;
  }
}

export function updateCollectibles(sim: Simulation): SimEvent[] {
  const events: SimEvent[] = [];
  const reach =
    sim.config.playerRadius + sim.config.collectibleRadius + sim.config.pickupPadding;
  const reachSq = reach * reach;
  const kept: Collectible[] = [];
  for (const item of sim.collectibles) {
    if (distanceSquared(sim.player.x, sim.player.y, item.x, item.y) <= reachSq) {
      sim.energyCollected += 1;
      events.push({ type: 'collect', id: item.id });
    } else {
      kept.push(item);
    }
  }
  sim.collectibles = kept;
  fillCollectibles(sim);
  return events;
}
