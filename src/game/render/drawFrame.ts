import {
  PaintStyle,
  Skia,
  type SkCanvas,
  type SkPaint,
} from '@shopify/react-native-skia';
import { lerp } from '../core/math';
import type { Echo, Simulation } from '../core/types';

const GRID = 48;

export type DrawParams = {
  sim: Simulation;
  alpha: number;
  viewWidth: number;
  viewHeight: number;
  nowMs: number;
  reducedMotion: boolean;
  impactStartMs: number | null;
};

export function createDrawer() {
  const fill = Skia.Paint();
  const stroke = Skia.Paint();
  fill.setAntiAlias(true);
  stroke.setAntiAlias(true);
  stroke.setStyle(PaintStyle.Stroke);

  return {
    draw(canvas: SkCanvas, params: DrawParams) {
      const { sim, viewWidth, viewHeight } = params;
      canvas.clear(Skia.Color('#000000'));
      const scaleX = viewWidth / sim.arena.width;
      const scaleY = viewHeight / sim.arena.height;
      canvas.save();
      canvas.scale(scaleX, scaleY);
      drawGrid(canvas, stroke, sim.arena.width, sim.arena.height);
      if (!params.reducedMotion) {
        drawParticles(canvas, fill, sim.arena.width, sim.arena.height, params.nowMs);
      }
      for (const item of sim.collectibles) {
        drawDiamond(canvas, fill, item.x, item.y, sim.config.collectibleRadius);
      }
      for (const echo of sim.echoes) {
        drawEcho(canvas, fill, stroke, echo, params);
      }
      drawPlayer(canvas, fill, sim, params.alpha);
      if (params.impactStartMs !== null && sim.phase === 'gameover') {
        drawImpact(canvas, stroke, fill, sim, params.nowMs - params.impactStartMs);
      }
      canvas.restore();
    },
    dispose() {
      fill.dispose();
      stroke.dispose();
    },
  };
}

function drawGrid(canvas: SkCanvas, stroke: SkPaint, width: number, height: number) {
  stroke.setStrokeWidth(1);
  stroke.setColor(Skia.Color('rgba(255,255,255,0.045)'));
  for (let x = GRID; x < width; x += GRID) {
    canvas.drawLine(x, 0, x, height, stroke);
  }
  for (let y = GRID; y < height; y += GRID) {
    canvas.drawLine(0, y, width, y, stroke);
  }
}

function drawParticles(canvas: SkCanvas, fill: SkPaint, width: number, height: number, nowMs: number) {
  const time = nowMs / 1000;
  fill.setColor(Skia.Color('rgba(255,255,255,0.16)'));
  for (let i = 0; i < 14; i += 1) {
    const x = (i * 97 + time * (10 + (i % 4))) % width;
    const y = (i * 61 + time * (7 + (i % 5))) % height;
    canvas.drawCircle(x, y, 1.3, fill);
  }
}

function drawDiamond(canvas: SkCanvas, fill: SkPaint, x: number, y: number, radius: number) {
  fill.setColor(Skia.Color('rgba(61,220,255,0.22)'));
  canvas.drawCircle(x, y, radius * 1.8, fill);
  fill.setColor(Skia.Color('#3DDCFF'));
  canvas.save();
  canvas.translate(x, y);
  canvas.rotate(45, 0, 0);
  const size = radius * 1.35;
  canvas.drawRect(Skia.XYWHRect(-size / 2, -size / 2, size, size), fill);
  canvas.restore();
}

function drawPlayer(canvas: SkCanvas, fill: SkPaint, sim: Simulation, alpha: number) {
  const x = lerp(sim.previousPlayer.x, sim.player.x, alpha);
  const y = lerp(sim.previousPlayer.y, sim.player.y, alpha);
  const radius = sim.config.playerRadius;
  fill.setColor(Skia.Color('rgba(255,255,255,0.20)'));
  canvas.drawCircle(x, y, radius * 1.85, fill);
  fill.setColor(Skia.Color('#FFFFFF'));
  canvas.drawCircle(x, y, radius, fill);
  fill.setColor(Skia.Color('rgba(0,0,0,0.18)'));
  canvas.drawCircle(x, y, radius * 0.28, fill);
}

function drawEcho(
  canvas: SkCanvas,
  fill: SkPaint,
  stroke: SkPaint,
  echo: Echo,
  params: DrawParams,
) {
  const x = lerp(echo.prevX, echo.x, params.alpha);
  const y = lerp(echo.prevY, echo.y, params.alpha);
  const radius = params.sim.config.echoRadius;
  if (!params.reducedMotion) {
    const count = echo.trail.length;
    for (let i = 0; i < count - 1; i += 1) {
      const point = echo.trail[i];
      if (!point) {
        continue;
      }
      const fade = ((i + 1) / count) * 0.28;
      fill.setColor(Skia.Color(`rgba(255,122,48,${fade.toFixed(3)})`));
      canvas.drawCircle(point.x, point.y, 2.4, fill);
    }
  }

  fill.setColor(Skia.Color('rgba(255,77,46,0.16)'));
  canvas.drawCircle(x, y, radius * 1.7, fill);

  const pulse = params.reducedMotion ? 0.5 : (Math.sin(params.nowMs / 170) + 1) / 2;
  const ringBoost = echo.phase === 'telegraph' ? 7 + pulse * 5 : 2;
  const bodyAlpha = echo.phase === 'telegraph' ? 0.45 : echo.phase === 'invulnerable' ? 0.72 : 0.95;
  fill.setColor(Skia.Color(`rgba(255,90,40,${bodyAlpha})`));
  canvas.drawCircle(x, y, radius * 0.72, fill);

  stroke.setStrokeWidth(echo.phase === 'lethal' ? 3.5 : 2);
  stroke.setColor(Skia.Color(echo.phase === 'telegraph' ? '#FFB088' : '#FF4D2E'));
  canvas.drawCircle(x, y, radius + ringBoost, stroke);
}

function drawImpact(
  canvas: SkCanvas,
  stroke: SkPaint,
  fill: SkPaint,
  sim: Simulation,
  ageMs: number,
) {
  const duration = 420;
  if (ageMs < 0 || ageMs > duration) {
    return;
  }
  const t = ageMs / duration;
  stroke.setStrokeWidth(2);
  stroke.setColor(Skia.Color(`rgba(255,255,255,${(1 - t) * 0.85})`));
  canvas.drawCircle(sim.player.x, sim.player.y, sim.config.playerRadius + t * 150, stroke);
  fill.setColor(Skia.Color(`rgba(255,255,255,${(1 - t) * 0.18})`));
  canvas.drawCircle(sim.player.x, sim.player.y, sim.config.playerRadius + 4, fill);
}
