import { distanceSquared } from '../core/math';
import type { Echo, Simulation } from '../core/types';

export function circlesOverlap(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): boolean {
  const reach = ar + br;
  return distanceSquared(ax, ay, bx, by) <= reach * reach;
}

/** True only when a lethal echo body overlaps the player. Trails are ignored. */
export function lethalEchoHit(sim: Simulation): boolean {
  const playerRadius = sim.config.playerRadius;
  const echoRadius = sim.config.echoRadius;
  for (const echo of sim.echoes) {
    if (echoHitsPlayer(sim.player.x, sim.player.y, playerRadius, echo, echoRadius)) {
      return true;
    }
  }
  return false;
}

export function echoHitsPlayer(
  playerX: number,
  playerY: number,
  playerRadius: number,
  echo: Echo,
  echoRadius: number,
): boolean {
  if (echo.phase !== 'lethal') {
    return false;
  }
  return circlesOverlap(playerX, playerY, playerRadius, echo.x, echo.y, echoRadius);
}
