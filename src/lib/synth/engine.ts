import { triggerDrum, type DrumId, type KitId } from "./drums";
import { playVoice, type VoiceId } from "./instruments";

export type Waveform = "sine" | "square" | "sawtooth" | "triangle";

export type SynthParams = {
  waveform: Waveform;
  osc2Wave: Waveform;
  cutoff: number;
  resonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  detune: number;
  osc2Mix: number;
  subMix: number;
  noiseMix: number;
  delay: number;
  drive: number;
};

type Voice = {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  sub: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  midi: number;
};

function makeImpulse(ctx: AudioContext): AudioBuffer {
  const seconds = 1.6;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.4;
    }
  }
  return buffer;
}

function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

function makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function makeDriveCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(n);
  const k = amount * 24;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private shaper: WaveShaperNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private drumsGain: GainNode | null = null;
  private bassBus: GainNode | null = null;
  private keysBus: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private reverb: ConvolverNode | null = null;
  private reverbWet: GainNode | null = null;
  private kit: KitId = "dusty";
  private reverbAmt = 0.22;
  private voices = new Map<number, Voice>();
  private holds = new Map<number, Set<string>>();
  private params: SynthParams = {
    waveform: "sawtooth",
    osc2Wave: "sawtooth",
    cutoff: 3200,
    resonance: 3.2,
    attack: 0.01,
    decay: 0.16,
    sustain: 0.72,
    release: 0.22,
    volume: 0.82,
    detune: 8,
    osc2Mix: 0.55,
    subMix: 0.12,
    noiseMix: 0,
    delay: 0.18,
    drive: 0.22,
  };
  private freqData = new Uint8Array(0);

  get ready(): boolean {
    return this.ctx !== null && this.ctx.state === "running";
  }

  get contextState(): AudioContextState | "idle" {
    return this.ctx?.state ?? "idle";
  }

  unlock(): boolean {
    if (typeof window === "undefined") return false;
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return false;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.buildGraph();
    }
    this.kickContext();
    return true;
  }

  resumeIfNeeded(): void {
    this.kickContext();
  }

  setParams(next: Partial<SynthParams>): void {
    this.params = { ...this.params, ...next };
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    if (next.volume !== undefined) {
      this.master.gain.setTargetAtTime(this.masterGain(), now, 0.03);
    }
    if (next.delay !== undefined && this.delayGain) {
      this.delayGain.gain.setTargetAtTime(this.params.delay * 0.42, now, 0.04);
    }
    if (next.drive !== undefined && this.shaper) {
      this.shaper.curve = makeDriveCurve(this.params.drive);
    }
    for (const voice of this.voices.values()) {
      if (next.waveform) voice.osc1.type = this.params.waveform;
      if (next.osc2Wave) voice.osc2.type = this.params.osc2Wave;
      if (next.cutoff !== undefined) voice.filter.frequency.setTargetAtTime(this.params.cutoff, now, 0.025);
      if (next.resonance !== undefined) voice.filter.Q.setTargetAtTime(this.params.resonance, now, 0.025);
      if (next.detune !== undefined) {
        voice.osc2.detune.setTargetAtTime(this.params.detune, now, 0.02);
        voice.osc1.detune.setTargetAtTime(-this.params.detune * 0.35, now, 0.02);
      }
    }
  }

  noteOn(midi: number, source: string): void {
    this.unlock();
    if (!this.ctx || !this.master) return;
    this.kickContext();
    let holders = this.holds.get(midi);
    if (!holders) {
      holders = new Set();
      this.holds.set(midi, holders);
    }
    if (holders.has(source)) return;
    holders.add(source);
    if (!this.voices.has(midi)) this.startVoice(midi);
  }

  noteOff(midi: number, source: string): void {
    const holders = this.holds.get(midi);
    if (!holders) return;
    holders.delete(source);
    if (holders.size === 0) {
      this.holds.delete(midi);
      this.stopVoice(midi);
    }
  }

  releaseAll(): void {
    this.holds.clear();
    for (const midi of [...this.voices.keys()]) this.stopVoice(midi);
  }

  fillWaveform(out: Uint8Array): boolean {
    if (!this.analyser) return false;
    if (out.length !== this.analyser.fftSize) return false;
    this.analyser.getByteTimeDomainData(out as Uint8Array<ArrayBuffer>);
    return true;
  }

  getLevel(): number {
    if (!this.analyser) return 0;
    this.analyser.getByteFrequencyData(this.freqData as Uint8Array<ArrayBuffer>);
    let sum = 0;
    for (let i = 0; i < this.freqData.length; i++) sum += this.freqData[i]!;
    return Math.min(1, sum / (this.freqData.length * 70));
  }

  now(): number {
    return this.ctx?.currentTime ?? 0;
  }

  hitDrum(id: DrumId, when?: number): void {
    this.unlock();
    const ctx = this.ctx;
    const dest = this.drumsGain;
    if (!ctx || !dest || !this.noiseBuffer) return;
    this.kickContext();
    triggerDrum(ctx, dest, id, when ?? ctx.currentTime, this.noiseBuffer, this.kit);
  }

  duckBass(when: number): void {
    const bus = this.bassBus;
    if (!bus) return;
    const g = bus.gain;
    g.cancelScheduledValues(when);
    g.setValueAtTime(Math.max(0.2, g.value), when);
    g.linearRampToValueAtTime(0.28, when + 0.018);
    g.linearRampToValueAtTime(1, when + 0.16);
  }

  setLaneGain(lane: "drums" | "bass" | "keys", amount: number): void {
    const node = lane === "drums" ? this.drumsGain : lane === "bass" ? this.bassBus : this.keysBus;
    if (!node) return;
    node.gain.setTargetAtTime(Math.max(0.0001, amount), this.ctx?.currentTime ?? 0, 0.03);
  }

  fireLoopNote(midi: number, when: number, gate: number, lane: "bass" | "keys" | "guitar", slide = false, voice?: VoiceId): void {
    this.unlock();
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const dest = lane === "bass" ? this.bassBus ?? master : this.keysBus ?? master;
    const freq = midiToFreq(midi);
    const chosen: VoiceId =
      voice ?? (lane === "guitar" ? "pluck" : lane === "keys" ? "rhodes" : slide ? "808" : "sub");
    playVoice(ctx, dest, freq, when, gate, chosen, slide);
  }

  setKit(kit: KitId): void {
    this.kit = kit;
  }

  setReverb(amount: number): void {
    this.reverbAmt = amount;
    if (this.reverbWet) {
      this.reverbWet.gain.setTargetAtTime(amount * 0.55, this.ctx?.currentTime ?? 0, 0.05);
    }
  }

  panic(restore?: { drums: number; bass: number; keys: number }): void {
    this.releaseAll();
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const buses = [this.drumsGain, this.bassBus, this.keysBus];
    for (const bus of buses) {
      if (!bus) continue;
      const current = Math.max(0.0001, bus.gain.value);
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(current, now);
      bus.gain.linearRampToValueAtTime(0.0001, now + 0.03);
    }
    const levels = restore ?? { drums: 0.95, bass: 0.88, keys: 0.7 };
    window.setTimeout(() => {
      const t = this.ctx?.currentTime ?? 0;
      this.drumsGain?.gain.setTargetAtTime(Math.max(0.0001, levels.drums), t, 0.04);
      this.bassBus?.gain.setTargetAtTime(Math.max(0.0001, levels.bass), t, 0.04);
      this.keysBus?.gain.setTargetAtTime(Math.max(0.0001, levels.keys), t, 0.04);
    }, 80);
  }

  private masterGain(): number {
    return Math.max(0.0001, this.params.volume ** 1.25 * 0.55);
  }

  private startVoice(midi: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const freq = midiToFreq(midi);
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const mix1 = ctx.createGain();
    const mix2 = ctx.createGain();
    const mixSub = ctx.createGain();
    osc1.type = this.params.waveform;
    osc2.type = this.params.osc2Wave;
    sub.type = "sine";
    osc1.frequency.value = freq;
    osc2.frequency.value = freq;
    sub.frequency.value = freq / 2;
    osc1.detune.value = -this.params.detune * 0.35;
    osc2.detune.value = this.params.detune;
    mix1.gain.value = 0.55;
    mix2.gain.value = this.params.osc2Mix;
    mixSub.gain.value = this.params.subMix;
    filter.type = "lowpass";
    filter.frequency.value = this.params.cutoff;
    filter.Q.value = this.params.resonance;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.55, now + Math.max(0.004, this.params.attack));
    osc1.connect(mix1);
    osc2.connect(mix2);
    sub.connect(mixSub);
    mix1.connect(filter);
    mix2.connect(filter);
    mixSub.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc1.start();
    osc2.start();
    sub.start();
    this.voices.set(midi, { osc1, osc2, sub, filter, gain, midi });
  }

  private stopVoice(midi: number): void {
    const voice = this.voices.get(midi);
    if (!voice || !this.ctx) return;
    this.voices.delete(midi);
    const now = this.ctx.currentTime;
    const rel = Math.max(0.05, this.params.release);
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(0.0001, voice.gain.gain.value), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + rel);
    const halt = now + rel + 0.04;
    voice.osc1.stop(halt);
    voice.osc2.stop(halt);
    voice.sub.stop(halt);
  }

  private buildGraph(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    this.master = ctx.createGain();
    this.master.gain.value = this.masterGain();

    this.shaper = ctx.createWaveShaper();
    this.shaper.curve = makeDriveCurve(this.params.drive);
    this.shaper.oversample = "2x";

    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 3.2;
    this.compressor.attack.value = 0.004;
    this.compressor.release.value = 0.12;

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.7;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

    this.delayNode = ctx.createDelay(1.2);
    this.delayNode.delayTime.value = 0.22;
    this.delayGain = ctx.createGain();
    this.delayGain.gain.value = this.params.delay * 0.42;
    this.delayFilter = ctx.createBiquadFilter();
    this.delayFilter.type = "lowpass";
    this.delayFilter.frequency.value = 2400;

    this.noiseBuffer = makeNoiseBuffer(ctx);

    this.drumsGain = ctx.createGain();
    this.drumsGain.gain.value = 0.95;
    this.bassBus = ctx.createGain();
    this.bassBus.gain.value = 0.88;
    this.keysBus = ctx.createGain();
    this.keysBus.gain.value = 0.7;

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -6;
    this.limiter.knee.value = 2;
    this.limiter.ratio.value = 18;
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.08;

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeImpulse(ctx);
    this.reverbWet = ctx.createGain();
    this.reverbWet.gain.value = this.reverbAmt * 0.55;

    this.master.connect(this.shaper);
    this.shaper.connect(this.compressor);
    this.drumsGain.connect(this.compressor);
    this.bassBus.connect(this.compressor);
    this.keysBus.connect(this.compressor);
    this.compressor.connect(this.limiter);
    this.limiter.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    this.limiter.connect(this.reverb);
    this.reverb.connect(this.reverbWet);
    this.reverbWet.connect(ctx.destination);

    this.master.connect(this.delayFilter);
    this.delayFilter.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.compressor);
    this.delayGain.connect(this.delayNode);
  }

  private kickContext(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === "suspended" || ctx.state === "interrupted") {
      void ctx.resume();
    }
  }
}

export const synth = new SynthEngine();
