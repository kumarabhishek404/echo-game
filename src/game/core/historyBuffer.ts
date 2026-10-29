export type Sample = {
  tick: number;
  x: number;
  y: number;
};

/**
 * Fixed-capacity ring of per-tick samples.
 * A lookup returns undefined when the tick was overwritten or never recorded.
 */
export class HistoryBuffer {
  readonly capacity: number;
  private readonly slots: (Sample | undefined)[];
  private newestTick = -1;

  constructor(capacity: number) {
    if (capacity < 1) {
      throw new Error('History capacity must be positive.');
    }
    this.capacity = capacity;
    this.slots = new Array(capacity);
  }

  get newest(): number {
    return this.newestTick;
  }

  clear(): void {
    this.slots.fill(undefined);
    this.newestTick = -1;
  }

  record(tick: number, x: number, y: number): void {
    this.slots[tick % this.capacity] = { tick, x, y };
    this.newestTick = tick;
  }

  get(tick: number): Sample | undefined {
    if (tick < 0 || this.newestTick < 0 || tick > this.newestTick) {
      return undefined;
    }
    const oldest = this.newestTick - this.capacity + 1;
    if (tick < oldest) {
      return undefined;
    }
    const sample = this.slots[tick % this.capacity];
    if (!sample || sample.tick !== tick) {
      return undefined;
    }
    return sample;
  }

  /**
   * Linear blend between the samples surrounding `timeSec`.
   * Returns undefined if either neighbor is missing, so callers never invent a pose.
   */
  interpolate(timeSec: number, hz: number): { x: number; y: number } | undefined {
    if (timeSec < 0 || hz <= 0) {
      return undefined;
    }
    const exact = timeSec * hz;
    const i0 = Math.floor(exact);
    const u = exact - i0;
    const a = this.get(i0);
    if (!a) {
      return undefined;
    }
    if (u <= 1e-9) {
      return { x: a.x, y: a.y };
    }
    const b = this.get(i0 + 1);
    if (!b) {
      return undefined;
    }
    return {
      x: a.x + (b.x - a.x) * u,
      y: a.y + (b.y - a.y) * u,
    };
  }
}
