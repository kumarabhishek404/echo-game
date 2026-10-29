import type { Vec, ViewMapping, WindowMapping } from '../core/types';

/** Maps a point inside the playfield view into arena units. */
export function viewToWorld(viewX: number, viewY: number, mapping: ViewMapping): Vec {
  const scaleX = mapping.worldWidth / mapping.viewWidth;
  const scaleY = mapping.worldHeight / mapping.viewHeight;
  return {
    x: viewX * scaleX,
    y: viewY * scaleY,
  };
}

/**
 * Maps a window point into arena units.
 * `origin` is the playfield's top-left in the window, so a notch above the
 * playfield is excluded before scaling.
 */
export function windowToWorld(windowX: number, windowY: number, mapping: WindowMapping): Vec {
  return viewToWorld(windowX - mapping.originX, windowY - mapping.originY, mapping);
}
