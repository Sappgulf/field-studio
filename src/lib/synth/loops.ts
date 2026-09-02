import { PATTERNS, type PatternId } from "./patterns";
import type { VoiceId } from "./instruments";

export type BassId = "dust" | "eight" | "slide" | "grim" | "pulse" | "walk" | "bounce" | "grind" | "sub";
export type GuitarId = "strum" | "riff" | "mute" | "chime" | "hook" | "wash";
export type KeysId = "dust" | "chop" | "ice" | "void" | "cry" | "gospel" | "stab" | "lift" | "haze" | "spark" | "bells";

export type PhraseHit = { midi: number; gate: number; slide?: boolean };

const F1 = 29;
const G1 = 31;
const A1 = 33;
const C2 = 36;
const D2 = 38;
const E2 = 40;
const F2 = 41;
const G2 = 43;
const A2 = 45;
const C3 = 48;
const E3 = 52;
const G3 = 55;
const A3 = 57;
const B3 = 59;
const C4 = 60;
const E4 = 64;
const G4 = 67;
const Bb3 = 58;
const D4 = 62;
const F4 = 65;

function row(hits: Record<number, PhraseHit[]>): PhraseHit[][] {
  return Array.from({ length: 16 }, (_, i) => hits[i] ?? []);
}

export const BASS_LOOPS: { id: BassId; label: string; steps: PhraseHit[][] }[] = [
  {
    id: "dust",
    label: "Dust",
    steps: row({
      0: [{ midi: A1, gate: 0.55 }],
      8: [{ midi: G1, gate: 0.5 }],
      12: [{ midi: A1, gate: 0.4 }],
    }),
  },
  {
    id: "eight",
    label: "808",
    steps: row({
      0: [{ midi: A1, gate: 0.7 }],
      7: [{ midi: A1, gate: 0.22, slide: true }],
      10: [{ midi: G1, gate: 0.55 }],
    }),
  },
  {
    id: "slide",
    label: "Slide",
    steps: row({
      0: [{ midi: F1, gate: 0.72, slide: true }],
      8: [{ midi: A1, gate: 0.55, slide: true }],
      12: [{ midi: G1, gate: 0.4 }],
    }),
  },
  {
    id: "grim",
    label: "Grim",
    steps: row({
      0: [{ midi: A1, gate: 0.8 }],
      9: [{ midi: F1, gate: 0.45, slide: true }],
    }),
  },
  {
    id: "pulse",
    label: "Pulse",
    steps: row({
      0: [{ midi: A1, gate: 0.42 }],
      4: [{ midi: A1, gate: 0.42 }],
      8: [{ midi: A1, gate: 0.42 }],
      12: [{ midi: A1, gate: 0.42 }],
    }),
  },
  {
    id: "walk",
    label: "Walk",
    steps: row({
      0: [{ midi: A1, gate: 0.38 }],
      3: [{ midi: C2, gate: 0.22 }],
      4: [{ midi: A1, gate: 0.3 }],
      7: [{ midi: G2, gate: 0.2 }],
      8: [{ midi: F2, gate: 0.38 }],
      11: [{ midi: G2, gate: 0.22 }],
      12: [{ midi: A1, gate: 0.3 }],
      14: [{ midi: C2, gate: 0.22 }],
    }),
  },
  {
    id: "bounce",
    label: "Bounce",
    steps: row({
      0: [{ midi: A2, gate: 0.2 }],
      3: [{ midi: A2, gate: 0.16 }],
      6: [{ midi: E2, gate: 0.16 }],
      8: [{ midi: C2, gate: 0.22 }],
      10: [{ midi: D2, gate: 0.16 }],
      14: [{ midi: E2, gate: 0.2 }],
    }),
  },
  {
    id: "grind",
    label: "Grind",
    steps: row({
      0: [{ midi: A1, gate: 0.18 }],
      1: [{ midi: A1, gate: 0.12 }],
      4: [{ midi: A1, gate: 0.18 }],
      5: [{ midi: A1, gate: 0.12 }],
      8: [{ midi: G2, gate: 0.16 }],
      10: [{ midi: A1, gate: 0.2 }],
      12: [{ midi: C2, gate: 0.16 }],
      14: [{ midi: A1, gate: 0.18 }],
    }),
  },
  {
    id: "sub",
    label: "Sub",
    steps: row({
      0: [{ midi: A1, gate: 0.72 }],
      8: [{ midi: F2, gate: 0.72 }],
    }),
  },
];

export const KEYS_LOOPS: { id: KeysId; label: string; steps: PhraseHit[][] }[] = [
  {
    id: "dust",
    label: "Dust",
    steps: row({
      0: [
        { midi: A3, gate: 0.7 },
        { midi: C4, gate: 0.7 },
        { midi: E4, gate: 0.7 },
        { midi: G4, gate: 0.7 },
      ],
      8: [
        { midi: G3, gate: 0.65 },
        { midi: Bb3, gate: 0.65 },
        { midi: D4, gate: 0.65 },
        { midi: F4, gate: 0.65 },
      ],
    }),
  },
  {
    id: "chop",
    label: "Chop",
    steps: row({
      0: [
        { midi: A3, gate: 0.22 },
        { midi: C4, gate: 0.22 },
        { midi: E4, gate: 0.22 },
      ],
      4: [
        { midi: A3, gate: 0.18 },
        { midi: C4, gate: 0.18 },
      ],
      8: [
        { midi: G3, gate: 0.22 },
        { midi: Bb3, gate: 0.22 },
        { midi: D4, gate: 0.22 },
      ],
      12: [{ midi: C4, gate: 0.2 }, { midi: E4, gate: 0.2 }],
    }),
  },
  {
    id: "ice",
    label: "Ice",
    steps: row({
      4: [{ midi: E4, gate: 0.16 }, { midi: A3, gate: 0.16 }],
      12: [{ midi: C4, gate: 0.18 }, { midi: G4, gate: 0.14 }],
    }),
  },
  {
    id: "void",
    label: "Void",
    steps: row({
      0: [{ midi: A3, gate: 0.9 }, { midi: E4, gate: 0.9 }],
      8: [{ midi: G3, gate: 0.8 }, { midi: D4, gate: 0.8 }],
    }),
  },
  {
    id: "cry",
    label: "Cry",
    steps: row({
      0: [{ midi: A3, gate: 0.85 }, { midi: C4, gate: 0.85 }, { midi: E4, gate: 0.85 }],
      8: [{ midi: G3, gate: 0.8 }, { midi: B3, gate: 0.8 }, { midi: D4, gate: 0.8 }],
    }),
  },
  {
    id: "gospel",
    label: "Gospel",
    steps: row({
      4: [{ midi: A3, gate: 0.28 }, { midi: C4, gate: 0.28 }, { midi: E4, gate: 0.28 }],
      12: [{ midi: G3, gate: 0.32 }, { midi: B3, gate: 0.32 }, { midi: D4, gate: 0.32 }],
    }),
  },
  {
    id: "stab",
    label: "Stab",
    steps: row({
      4: [
        { midi: A3, gate: 0.28 },
        { midi: C4, gate: 0.28 },
        { midi: E4, gate: 0.28 },
      ],
      12: [
        { midi: A3, gate: 0.28 },
        { midi: C4, gate: 0.28 },
        { midi: E4, gate: 0.28 },
      ],
    }),
  },
  {
    id: "lift",
    label: "Lift",
    steps: row({
      0: [{ midi: A3, gate: 0.2 }],
      2: [{ midi: C4, gate: 0.16 }],
      4: [{ midi: E4, gate: 0.2 }],
      6: [{ midi: C4, gate: 0.16 }],
      8: [{ midi: G3, gate: 0.2 }],
      10: [{ midi: A3, gate: 0.16 }],
      12: [{ midi: C4, gate: 0.22 }],
      14: [{ midi: E4, gate: 0.18 }],
    }),
  },
  {
    id: "haze",
    label: "Haze",
    steps: row({
      0: [
        { midi: A3, gate: 0.9 },
        { midi: E4, gate: 0.9 },
      ],
      8: [
        { midi: G3, gate: 0.9 },
        { midi: C4, gate: 0.9 },
      ],
    }),
  },
  {
    id: "spark",
    label: "Spark",
    steps: row({
      2: [{ midi: E4, gate: 0.12 }],
      6: [{ midi: G4, gate: 0.1 }],
      10: [{ midi: E4, gate: 0.12 }],
      13: [{ midi: C4, gate: 0.1 }],
      15: [{ midi: A3, gate: 0.14 }],
    }),
  },
  {
    id: "bells",
    label: "Bells",
    steps: row({
      0: [{ midi: E4, gate: 0.35 }],
      4: [{ midi: A3, gate: 0.28 }],
      8: [{ midi: C4, gate: 0.32 }],
      12: [{ midi: G4, gate: 0.3 }],
    }),
  },
];

export const GUITAR_LOOPS: { id: GuitarId; label: string; steps: PhraseHit[][] }[] = [
  {
    id: "strum",
    label: "Strum",
    steps: row({
      0: [
        { midi: A2, gate: 0.7 },
        { midi: E3, gate: 0.7 },
        { midi: A3, gate: 0.7 },
      ],
      8: [
        { midi: G2, gate: 0.7 },
        { midi: D2, gate: 0.55 },
        { midi: G3, gate: 0.7 },
      ],
    }),
  },
  {
    id: "riff",
    label: "Riff",
    steps: row({
      0: [{ midi: A2, gate: 0.22 }],
      3: [{ midi: C3, gate: 0.16 }],
      4: [{ midi: E3, gate: 0.2 }],
      7: [{ midi: C3, gate: 0.14 }],
      8: [{ midi: G2, gate: 0.22 }],
      11: [{ midi: A2, gate: 0.16 }],
      12: [{ midi: C3, gate: 0.22 }],
      14: [{ midi: E3, gate: 0.18 }],
    }),
  },
  {
    id: "mute",
    label: "Mute",
    steps: row({
      0: [{ midi: A2, gate: 0.1 }],
      2: [{ midi: A2, gate: 0.08 }],
      4: [{ midi: A2, gate: 0.1 }],
      6: [{ midi: A2, gate: 0.08 }],
      8: [{ midi: G2, gate: 0.1 }],
      10: [{ midi: G2, gate: 0.08 }],
      12: [{ midi: A2, gate: 0.1 }],
      14: [{ midi: C3, gate: 0.1 }],
    }),
  },
  {
    id: "chime",
    label: "Chime",
    steps: row({
      4: [{ midi: E4, gate: 0.5 }],
      12: [{ midi: A3, gate: 0.45 }],
    }),
  },
  {
    id: "hook",
    label: "Hook",
    steps: row({
      0: [{ midi: A3, gate: 0.2 }],
      2: [{ midi: C4, gate: 0.16 }],
      4: [{ midi: B3, gate: 0.16 }],
      6: [{ midi: A3, gate: 0.22 }],
      8: [{ midi: G3, gate: 0.2 }],
      10: [{ midi: A3, gate: 0.16 }],
      12: [{ midi: C4, gate: 0.18 }],
      14: [{ midi: E4, gate: 0.2 }],
    }),
  },
  {
    id: "wash",
    label: "Wash",
    steps: row({
      0: [{ midi: A2, gate: 0.9 }, { midi: E3, gate: 0.9 }, { midi: C4, gate: 0.9 }],
      8: [{ midi: G2, gate: 0.85 }, { midi: D2, gate: 0.7 }, { midi: B3, gate: 0.85 }],
    }),
  },
];

export type SceneId = "lofi" | "hop" | "trap" | "under" | "melt" | "emo" | "bounce" | "det" | "memphis";

export const SCENES: {
  id: SceneId;
  label: string;
  drums: PatternId;
  bass: BassId;
  keys: KeysId;
  guitar: GuitarId | null;
  kit: "dusty" | "trap" | "808" | "room";
  reverb: number;
}[] = [
  { id: "lofi", label: "Lofi", drums: "lofi", bass: "dust", keys: "dust", guitar: "chime", kit: "dusty", reverb: 0.22 },
  { id: "hop", label: "Hop", drums: "hop", bass: "eight", keys: "chop", guitar: null, kit: "room", reverb: 0.14 },
  { id: "trap", label: "Trap", drums: "trap", bass: "slide", keys: "ice", guitar: null, kit: "trap", reverb: 0.12 },
  { id: "under", label: "Under", drums: "under", bass: "grim", keys: "void", guitar: "mute", kit: "808", reverb: 0.2 },
  { id: "melt", label: "Melt", drums: "melt", bass: "slide", keys: "cry", guitar: "hook", kit: "trap", reverb: 0.28 },
  { id: "emo", label: "Emo", drums: "emo", bass: "eight", keys: "cry", guitar: "wash", kit: "dusty", reverb: 0.42 },
  { id: "bounce", label: "Bounce", drums: "bounce", bass: "bounce", keys: "stab", guitar: null, kit: "808", reverb: 0.1 },
  { id: "det", label: "Det", drums: "det", bass: "eight", keys: "gospel", guitar: null, kit: "room", reverb: 0.16 },
  { id: "memphis", label: "Memph", drums: "memphis", bass: "grim", keys: "void", guitar: "mute", kit: "808", reverb: 0.18 },
];

export const DRUM_CLIPS = PATTERNS.map((p) => ({ id: p.id as PatternId, label: p.label }));

export function bassSteps(id: BassId | null) {
  return BASS_LOOPS.find((l) => l.id === id)?.steps ?? null;
}

export function keysSteps(id: KeysId | null) {
  return KEYS_LOOPS.find((l) => l.id === id)?.steps ?? null;
}

export function guitarSteps(id: GuitarId | null) {
  return GUITAR_LOOPS.find((l) => l.id === id)?.steps ?? null;
}

export const BASS_VOICE: Record<BassId, VoiceId> = {
  dust: "sub",
  eight: "808",
  slide: "808",
  grim: "reese",
  pulse: "sub",
  walk: "funk",
  bounce: "funk",
  grind: "reese",
  sub: "sub",
};

export const KEYS_VOICE: Record<KeysId, VoiceId> = {
  dust: "rhodes",
  chop: "piano",
  ice: "bell",
  void: "choir",
  cry: "pad",
  gospel: "organ",
  stab: "piano",
  lift: "pad",
  haze: "choir",
  spark: "bell",
  bells: "bell",
};

export const GUITAR_VOICE: Record<GuitarId, VoiceId> = {
  strum: "pluck",
  riff: "hook",
  mute: "mute",
  chime: "bell",
  hook: "hook",
  wash: "wash",
};
