export type KitId = "tight" | "808" | "room" | "dusty" | "trap";

export const KITS: { id: KitId; label: string }[] = [
  { id: "dusty", label: "Dusty" },
  { id: "trap", label: "Trap" },
  { id: "808", label: "808" },
  { id: "room", label: "Room" },
];

export const DRUM_IDS = ["kick", "snare", "hat", "open", "clap", "tom", "perc", "rim"] as const;
export type DrumId = (typeof DRUM_IDS)[number];

export const DRUM_META: { id: DrumId; label: string; key: string }[] = [
  { id: "kick", label: "Kick", key: "1" },
  { id: "snare", label: "Snare", key: "2" },
  { id: "hat", label: "Hat", key: "3" },
  { id: "open", label: "Open", key: "4" },
  { id: "clap", label: "Clap", key: "5" },
  { id: "tom", label: "Tom", key: "6" },
  { id: "perc", label: "Perc", key: "7" },
  { id: "rim", label: "Rim", key: "8" },
];

export function emptyPattern(): Record<DrumId, boolean[]> {
  return {
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hat: Array(16).fill(false),
    open: Array(16).fill(false),
    clap: Array(16).fill(false),
    tom: Array(16).fill(false),
    perc: Array(16).fill(false),
    rim: Array(16).fill(false),
  };
}

export function starterPattern(): Record<DrumId, boolean[]> {
  const p = emptyPattern();
  p.kick = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
  p.snare = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
  p.hat = [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false];
  p.clap = [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, true];
  return p;
}

export function triggerDrum(
  ctx: AudioContext,
  dest: AudioNode,
  id: DrumId,
  when: number,
  noiseBuffer: AudioBuffer,
  kit: KitId = "tight",
) {
  const k = kit === "808" ? 1 : kit === "room" ? 2 : kit === "dusty" ? 3 : kit === "trap" ? 4 : 0;
  switch (id) {
    case "kick":
      return kick(ctx, dest, when, k);
    case "snare":
      return snare(ctx, dest, when, noiseBuffer, k);
    case "hat":
      return hat(ctx, dest, when, noiseBuffer, k === 1 ? 0.03 : k === 4 ? 0.022 : k === 2 ? 0.07 : k === 3 ? 0.055 : 0.045, k === 1 || k === 4 ? 12000 : k === 3 ? 6200 : 9000);
    case "open":
      return hat(ctx, dest, when, noiseBuffer, k === 1 ? 0.32 : 0.22, 7000);
    case "clap":
      return clap(ctx, dest, when, noiseBuffer);
    case "tom":
      return tom(ctx, dest, when, k);
    case "perc":
      return perc(ctx, dest, when, noiseBuffer);
    case "rim":
      return rim(ctx, dest, when, noiseBuffer);
  }
}

function kick(ctx: AudioContext, dest: AudioNode, when: number, kit: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  const start = kit === 1 || kit === 4 ? 78 : kit === 3 ? 118 : 160;
  const end = kit === 1 || kit === 4 ? 26 : kit === 3 ? 48 : 42;
  const dur = kit === 4 ? 0.72 : kit === 1 ? 0.55 : kit === 2 ? 0.4 : kit === 3 ? 0.3 : 0.32;
  osc.frequency.setValueAtTime(start, when);
  osc.frequency.exponentialRampToValueAtTime(end, when + (kit === 1 ? 0.18 : 0.11));
  gain.gain.setValueAtTime(kit === 1 ? 1.15 : 1, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(when);
  osc.stop(when + dur + 0.02);

  const click = ctx.createOscillator();
  const cg = ctx.createGain();
  click.type = "square";
  click.frequency.value = kit === 1 ? 80 : 240;
  cg.gain.setValueAtTime(0.22, when);
  cg.gain.exponentialRampToValueAtTime(0.0001, when + 0.018);
  click.connect(cg);
  cg.connect(dest);
  click.start(when);
  click.stop(when + 0.02);
}

function snare(ctx: AudioContext, dest: AudioNode, when: number, noiseBuffer: AudioBuffer, kit: number) {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = kit === 1 ? 900 : 1800;
  bp.Q.value = 0.9;
  const ng = ctx.createGain();
  const noiseDur = kit === 2 ? 0.24 : kit === 1 ? 0.2 : 0.16;
  ng.gain.setValueAtTime(kit === 1 ? 0.55 : 0.7, when);
  ng.gain.exponentialRampToValueAtTime(0.0001, when + noiseDur);
  noise.connect(bp);
  bp.connect(ng);
  ng.connect(dest);
  noise.start(when);
  noise.stop(when + noiseDur + 0.02);

  const osc = ctx.createOscillator();
  const og = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = kit === 1 ? 120 : 180;
  og.gain.setValueAtTime(0.45, when);
  og.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
  osc.connect(og);
  og.connect(dest);
  osc.start(when);
  osc.stop(when + 0.1);
}

function hat(ctx: AudioContext, dest: AudioNode, when: number, noiseBuffer: AudioBuffer, dur: number, freq: number) {
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.28, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  noise.connect(hp);
  hp.connect(g);
  g.connect(dest);
  noise.start(when);
  noise.stop(when + dur + 0.02);
}

function clap(ctx: AudioContext, dest: AudioNode, when: number, noiseBuffer: AudioBuffer) {
  for (let i = 0; i < 3; i++) {
    const t = when + i * 0.012;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    noise.connect(bp);
    bp.connect(g);
    g.connect(dest);
    noise.start(t);
    noise.stop(t + 0.1);
  }
}

function tom(ctx: AudioContext, dest: AudioNode, when: number, kit: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(kit === 1 ? 180 : 240, when);
  osc.frequency.exponentialRampToValueAtTime(kit === 1 ? 70 : 110, when + 0.16);
  g.gain.setValueAtTime(0.85, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
  osc.connect(g);
  g.connect(dest);
  osc.start(when);
  osc.stop(when + 0.24);
}

function perc(ctx: AudioContext, dest: AudioNode, when: number, noiseBuffer: AudioBuffer) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 845;
  g.gain.setValueAtTime(0.4, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);
  osc.connect(g);
  g.connect(dest);
  osc.start(when);
  osc.stop(when + 0.1);

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 4000;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.18, when);
  ng.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
  noise.connect(hp);
  hp.connect(ng);
  ng.connect(dest);
  noise.start(when);
  noise.stop(when + 0.06);
}

function rim(ctx: AudioContext, dest: AudioNode, when: number, noiseBuffer: AudioBuffer) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 420;
  g.gain.setValueAtTime(0.22, when);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.04);
  osc.connect(g);
  g.connect(dest);
  osc.start(when);
  osc.stop(when + 0.05);

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2500;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.35, when);
  ng.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
  noise.connect(bp);
  bp.connect(ng);
  ng.connect(dest);
  noise.start(when);
  noise.stop(when + 0.06);
}
