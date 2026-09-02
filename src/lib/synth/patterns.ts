import { emptyPattern, type DrumId } from "./drums";

export type PatternId = "lofi" | "hop" | "trap" | "under" | "melt" | "emo" | "bounce" | "det" | "memphis" | "boom";

export const PATTERNS: { id: PatternId; label: string; bpm: number; swing: number; steps: Record<DrumId, boolean[]> }[] = [
  {
    id: "lofi",
    label: "Lofi",
    bpm: 82,
    swing: 0.34,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 7, 10);
      p.snare = on(4, 12);
      p.hat = on(0, 3, 4, 7, 8, 11, 12, 15);
      p.rim = on(6, 14);
      p.open = on(14);
      return p;
    })(),
  },
  {
    id: "hop",
    label: "Hop",
    bpm: 92,
    swing: 0.22,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 3, 8, 10);
      p.snare = on(4, 12);
      p.hat = on(0, 2, 4, 6, 8, 10, 12, 14);
      p.rim = on(2, 11);
      p.perc = on(7, 15);
      p.clap = on(12);
      return p;
    })(),
  },
  {
    id: "trap",
    label: "Trap",
    bpm: 140,
    swing: 0.06,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 7, 10);
      p.snare = on(8);
      p.clap = on(8);
      p.hat = on(0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15);
      p.open = on(6);
      p.perc = on(14);
      return p;
    })(),
  },
  {
    id: "under",
    label: "Under",
    bpm: 136,
    swing: 0.1,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 9);
      p.snare = on(8);
      p.hat = on(0, 4, 6, 10, 12);
      p.open = on(14);
      p.perc = on(3, 11);
      p.rim = on(7, 15);
      return p;
    })(),
  },
  {
    id: "melt",
    label: "Melt",
    bpm: 144,
    swing: 0.08,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 6, 10);
      p.snare = on(8);
      p.clap = on(8);
      p.hat = on(0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 14, 15);
      p.open = on(6);
      return p;
    })(),
  },
  {
    id: "emo",
    label: "Emo",
    bpm: 128,
    swing: 0.16,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 10);
      p.snare = on(8);
      p.hat = on(0, 3, 4, 7, 8, 11, 12, 15);
      p.open = on(14);
      p.rim = on(6);
      return p;
    })(),
  },
  {
    id: "bounce",
    label: "Bounce",
    bpm: 98,
    swing: 0.18,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 3, 6, 8, 11);
      p.snare = on(4, 12);
      p.hat = on(0, 2, 4, 6, 8, 10, 12, 14);
      p.open = on(10);
      p.perc = on(7, 15);
      return p;
    })(),
  },
  {
    id: "det",
    label: "Det",
    bpm: 90,
    swing: 0.14,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 8, 11);
      p.snare = on(4, 12);
      p.clap = on(4, 12);
      p.hat = on(0, 2, 4, 6, 8, 10, 12, 14);
      p.perc = on(7);
      p.rim = on(15);
      return p;
    })(),
  },
  {
    id: "memphis",
    label: "Memph",
    bpm: 136,
    swing: 0.05,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 8);
      p.snare = on(8);
      p.hat = on(0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14);
      p.perc = on(3, 7, 11, 15);
      p.open = on(14);
      p.rim = on(6);
      return p;
    })(),
  },
  {
    id: "boom",
    label: "Boom",
    bpm: 90,
    swing: 0.2,
    steps: (() => {
      const p = emptyPattern();
      p.kick = on(0, 3, 8, 10);
      p.snare = on(4, 12);
      p.hat = on(0, 2, 4, 6, 8, 9, 10, 12, 14);
      p.rim = on(2, 11);
      return p;
    })(),
  },
];

function on(...indexes: number[]): boolean[] {
  const row = Array(16).fill(false);
  for (const i of indexes) row[i] = true;
  return row;
}
