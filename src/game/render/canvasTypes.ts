import type { LoopClock } from '../core/loop';
import type { Phase, SimEvent, Simulation, ViewMapping } from '../core/types';

export type HudSample = {
  score: number;
  tick: number;
  energy: number;
  phase: Phase;
};

export type GameCanvasProps = {
  simRef: React.RefObject<Simulation | null>;
  clockRef: React.RefObject<LoopClock>;
  mappingRef: React.RefObject<ViewMapping>;
  reducedMotion: boolean;
  onArena: (width: number, height: number) => void;
  onSample: (sample: HudSample) => void;
  onEvents: (events: SimEvent[]) => void;
};
