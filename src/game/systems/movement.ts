import { SIM_HZ } from '../core/config';
import { clampToArena } from '../core/math';
import type { Simulation } from '../core/types';

export function integratePlayer(sim: Simulation): void {
  const dt = 1 / SIM_HZ;
  sim.previousPlayer.x = sim.player.x;
  sim.previousPlayer.y = sim.player.y;
  if (!sim.pointer.active) {
    return;
  }

  const radius = sim.config.playerRadius;
  const target = clampToArena(sim.pointer.x, sim.pointer.y, sim.arena, radius);
  const dx = target.x - sim.player.x;
  const dy = target.y - sim.player.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= 0.35) {
    sim.player.x = target.x;
    sim.player.y = target.y;
    return;
  }

  const gain = 1 - Math.exp(-sim.config.playerResponse * dt);
  let mx = dx * gain;
  let my = dy * gain;
  const mag = Math.hypot(mx, my);
  const maxStep = sim.config.playerMaxSpeed * dt;
  if (mag > maxStep && mag > 0) {
    const scale = maxStep / mag;
    mx *= scale;
    my *= scale;
  }
  sim.player.x += mx;
  sim.player.y += my;
  const clamped = clampToArena(sim.player.x, sim.player.y, sim.arena, radius);
  sim.player.x = clamped.x;
  sim.player.y = clamped.y;
}
