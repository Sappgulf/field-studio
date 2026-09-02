export type VoiceId =
  | "808"
  | "reese"
  | "sub"
  | "funk"
  | "rhodes"
  | "piano"
  | "organ"
  | "bell"
  | "pad"
  | "choir"
  | "pluck"
  | "hook"
  | "wash"
  | "mute";

function env(gain: GainNode, when: number, peak: number, attack: number, body: number) {
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(peak, when + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + body);
}

function stopAt(nodes: AudioScheduledSourceNode[], when: number) {
  for (const n of nodes) n.stop(when);
}

export function playVoice(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  when: number,
  gate: number,
  voice: VoiceId,
  slide = false,
) {
  switch (voice) {
    case "808":
      return play808(ctx, dest, freq, when, gate, slide);
    case "reese":
      return playReese(ctx, dest, freq, when, gate);
    case "sub":
      return playSub(ctx, dest, freq, when, gate, slide);
    case "funk":
      return playFunk(ctx, dest, freq, when, gate);
    case "rhodes":
      return playRhodes(ctx, dest, freq, when, gate);
    case "piano":
      return playPiano(ctx, dest, freq, when, gate);
    case "organ":
      return playOrgan(ctx, dest, freq, when, gate);
    case "bell":
      return playBell(ctx, dest, freq, when, gate);
    case "pad":
      return playPad(ctx, dest, freq, when, gate);
    case "choir":
      return playChoir(ctx, dest, freq, when, gate);
    case "pluck":
      return playGuitar(ctx, dest, freq, when, gate, 0.42, 0.012);
    case "hook":
      return playGuitar(ctx, dest, freq, when, gate, 0.5, 0.008);
    case "wash":
      return playWash(ctx, dest, freq, when, gate);
    case "mute":
      return playGuitar(ctx, dest, freq, when, Math.min(gate, 0.09), 0.28, 0.006);
  }
}

function play808(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number, slide: boolean) {
  const osc = ctx.createOscillator();
  const click = ctx.createOscillator();
  const out = ctx.createGain();
  const cg = ctx.createGain();
  osc.type = "sine";
  const start = slide ? freq * 1.85 : freq * 1.15;
  osc.frequency.setValueAtTime(start, when);
  osc.frequency.exponentialRampToValueAtTime(freq, when + 0.08);
  click.type = "sine";
  click.frequency.value = 90;
  cg.gain.setValueAtTime(0.35, when);
  cg.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
  const body = Math.max(0.35, Math.min(gate, 0.9));
  env(out, when, 0.95, 0.004, body);
  osc.connect(out);
  click.connect(cg);
  cg.connect(dest);
  out.connect(dest);
  osc.start(when);
  click.start(when);
  stopAt([osc, click], when + body + 0.04);
}

function playReese(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const a = ctx.createOscillator();
  const b = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const out = ctx.createGain();
  a.type = "sawtooth";
  b.type = "sawtooth";
  a.frequency.value = freq;
  b.frequency.value = freq;
  a.detune.value = -12;
  b.detune.value = 14;
  filter.type = "lowpass";
  filter.frequency.value = 280;
  filter.Q.value = 4;
  const body = Math.max(0.2, gate);
  env(out, when, 0.42, 0.02, body);
  a.connect(filter);
  b.connect(filter);
  filter.connect(out);
  out.connect(dest);
  a.start(when);
  b.start(when);
  stopAt([a, b], when + body + 0.04);
}

function playSub(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number, slide: boolean) {
  const osc = ctx.createOscillator();
  const out = ctx.createGain();
  osc.type = "sine";
  if (slide) {
    osc.frequency.setValueAtTime(freq * 1.5, when);
    osc.frequency.exponentialRampToValueAtTime(freq, when + 0.1);
  } else {
    osc.frequency.value = freq;
  }
  const body = Math.max(0.28, gate);
  env(out, when, 0.9, 0.01, body);
  osc.connect(out);
  out.connect(dest);
  osc.start(when);
  osc.stop(when + body + 0.03);
}

function playFunk(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const out = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, when);
  filter.frequency.exponentialRampToValueAtTime(180, when + 0.12);
  filter.Q.value = 6;
  const body = Math.max(0.12, Math.min(gate, 0.28));
  env(out, when, 0.38, 0.003, body);
  osc.connect(filter);
  filter.connect(out);
  out.connect(dest);
  osc.start(when);
  osc.stop(when + body + 0.03);
}

export function playRhodes(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const car = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const out = ctx.createGain();
  const tone = ctx.createBiquadFilter();
  car.type = "sine";
  mod.type = "sine";
  car.frequency.value = freq;
  mod.frequency.value = freq * 2;
  modGain.gain.setValueAtTime(freq * 1.6, when);
  modGain.gain.exponentialRampToValueAtTime(8, when + Math.min(0.35, gate));
  tone.type = "lowpass";
  tone.frequency.value = 2800;
  const body = Math.max(0.16, Math.min(gate, 0.7));
  env(out, when, 0.32, 0.006, body);
  mod.connect(modGain);
  modGain.connect(car.frequency);
  car.connect(tone);
  tone.connect(out);
  out.connect(dest);
  car.start(when);
  mod.start(when);
  stopAt([car, mod], when + body + 0.03);
}

function playPiano(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const a = ctx.createOscillator();
  const b = ctx.createOscillator();
  const hammer = ctx.createOscillator();
  const out = ctx.createGain();
  const hg = ctx.createGain();
  a.type = "sine";
  b.type = "triangle";
  hammer.type = "square";
  a.frequency.value = freq;
  b.frequency.value = freq * 2;
  hammer.frequency.value = freq * 6;
  b.detune.value = 3;
  hg.gain.setValueAtTime(0.08, when);
  hg.gain.exponentialRampToValueAtTime(0.0001, when + 0.02);
  const body = Math.max(0.2, Math.min(gate, 0.8));
  env(out, when, 0.36, 0.004, body);
  a.connect(out);
  b.connect(out);
  hammer.connect(hg);
  hg.connect(dest);
  out.connect(dest);
  a.start(when);
  b.start(when);
  hammer.start(when);
  stopAt([a, b, hammer], when + body + 0.03);
}

function playOrgan(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const out = ctx.createGain();
  const nodes: OscillatorNode[] = [];
  const partials = [1, 2, 3, 4];
  const mixes = [0.4, 0.22, 0.14, 0.08];
  for (let i = 0; i < partials.length; i++) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * partials[i]!;
    g.gain.value = mixes[i]!;
    osc.connect(g);
    g.connect(out);
    osc.start(when);
    nodes.push(osc);
  }
  const body = Math.max(0.18, gate);
  env(out, when, 0.34, 0.01, body);
  out.connect(dest);
  stopAt(nodes, when + body + 0.03);
}

function playBell(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const car = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const mg = ctx.createGain();
  const out = ctx.createGain();
  car.type = "sine";
  mod.type = "sine";
  car.frequency.value = freq * 2;
  mod.frequency.value = freq * 7.2;
  mg.gain.setValueAtTime(freq * 1.2, when);
  mg.gain.exponentialRampToValueAtTime(4, when + 0.3);
  const body = Math.max(0.25, Math.min(gate + 0.2, 0.9));
  env(out, when, 0.22, 0.003, body);
  mod.connect(mg);
  mg.connect(car.frequency);
  car.connect(out);
  out.connect(dest);
  car.start(when);
  mod.start(when);
  stopAt([car, mod], when + body + 0.03);
}

function playPad(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const a = ctx.createOscillator();
  const b = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const out = ctx.createGain();
  a.type = "triangle";
  b.type = "sine";
  a.frequency.value = freq;
  b.frequency.value = freq;
  a.detune.value = -8;
  b.detune.value = 9;
  filter.type = "lowpass";
  filter.frequency.value = 1600;
  const body = Math.max(0.45, gate);
  env(out, when, 0.22, 0.08, body);
  a.connect(filter);
  b.connect(filter);
  filter.connect(out);
  out.connect(dest);
  a.start(when);
  b.start(when);
  stopAt([a, b], when + body + 0.04);
}

function playChoir(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const a = ctx.createOscillator();
  const b = ctx.createOscillator();
  const form = ctx.createBiquadFilter();
  const out = ctx.createGain();
  a.type = "sawtooth";
  b.type = "sawtooth";
  a.frequency.value = freq;
  b.frequency.value = freq * 1.005;
  form.type = "bandpass";
  form.frequency.value = 780;
  form.Q.value = 2.4;
  const body = Math.max(0.4, gate);
  env(out, when, 0.16, 0.06, body);
  a.connect(form);
  b.connect(form);
  form.connect(out);
  out.connect(dest);
  a.start(when);
  b.start(when);
  stopAt([a, b], when + body + 0.04);
}

function playGuitar(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  when: number,
  gate: number,
  peak = 0.42,
  noise = 0.012,
) {
  const burstLen = Math.max(32, Math.floor(ctx.sampleRate * noise));
  const burst = ctx.createBuffer(1, burstLen, ctx.sampleRate);
  const data = burst.getChannelData(0);
  for (let i = 0; i < burstLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / burstLen);
  const src = ctx.createBufferSource();
  src.buffer = burst;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = 11;
  const bodyOsc = ctx.createOscillator();
  bodyOsc.type = "triangle";
  bodyOsc.frequency.value = freq;
  const bodyMix = ctx.createGain();
  bodyMix.gain.value = 0.28;
  const out = ctx.createGain();
  const body = Math.max(0.1, Math.min(gate, 0.6));
  env(out, when, peak, 0.004, body);
  src.connect(filter);
  filter.connect(out);
  bodyOsc.connect(bodyMix);
  bodyMix.connect(out);
  out.connect(dest);
  src.start(when);
  bodyOsc.start(when);
  stopAt([src, bodyOsc], when + body + 0.03);
}

function playWash(ctx: AudioContext, dest: AudioNode, freq: number, when: number, gate: number) {
  const a = ctx.createOscillator();
  const b = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const out = ctx.createGain();
  a.type = "triangle";
  b.type = "sine";
  a.frequency.value = freq;
  b.frequency.value = freq;
  a.detune.value = -18;
  b.detune.value = 16;
  filter.type = "lowpass";
  filter.frequency.value = 2200;
  const body = Math.max(0.5, gate);
  env(out, when, 0.24, 0.05, body);
  a.connect(filter);
  b.connect(filter);
  filter.connect(out);
  out.connect(dest);
  a.start(when);
  b.start(when);
  stopAt([a, b], when + body + 0.04);
}
