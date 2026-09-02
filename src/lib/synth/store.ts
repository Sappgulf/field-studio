import { create } from "zustand";
import { resyncClock } from "./clock";
import { type DrumId, type KitId, starterPattern } from "./drums";
import { synth, type SynthParams, type Waveform } from "./engine";
import { PATTERNS, type PatternId } from "./patterns";
import { PRESETS, type PresetId } from "./presets";
import { SCENES, type BassId, type GuitarId, type KeysId, type SceneId } from "./loops";

export type Panel = "play" | "loop";
export type PlayMode = "keys" | "drums";

type SynthState = SynthParams & {
  octave: number;
  armed: boolean;
  preset: PresetId;
  holds: Record<number, string[]>;
  mode: PlayMode;
  panel: Panel;
  bpm: number;
  playing: boolean;
  playhead: number;
  record: boolean;
  pattern: Record<DrumId, boolean[]>;
  toneOpen: boolean;
  kit: KitId;
  patternId: PatternId;
  reverb: number;
  swing: number;
  bassId: BassId | null;
  keysId: KeysId | null;
  guitarId: GuitarId | null;
  drumsOn: boolean;
  gridOpen: boolean;
  mixOpen: boolean;
  liveVoice: "synth" | "rhodes" | "guitar";
  sceneId: SceneId;
  drumGain: number;
  bassGain: number;
  keysGain: number;
  arm: () => void;
  setWaveform: (waveform: Waveform) => void;
  setCutoff: (cutoff: number) => void;
  setResonance: (resonance: number) => void;
  setAttack: (attack: number) => void;
  setDecay: (decay: number) => void;
  setSustain: (sustain: number) => void;
  setReleaseTime: (release: number) => void;
  setVolume: (volume: number) => void;
  setDetune: (detune: number) => void;
  setDelay: (delay: number) => void;
  setDrive: (drive: number) => void;
  setOctave: (octave: number) => void;
  applyPreset: (id: PresetId) => void;
  setMode: (mode: PlayMode) => void;
  setPanel: (panel: Panel) => void;
  setBpm: (bpm: number) => void;
  togglePlay: () => void;
  setRecord: (record: boolean) => void;
  toggleStep: (id: DrumId, step: number) => void;
  clearPattern: () => void;
  loadStarter: () => void;
  hitPad: (id: DrumId) => void;
  setToneOpen: (open: boolean) => void;
  setKit: (kit: KitId) => void;
  loadPattern: (id: PatternId) => void;
  setReverb: (reverb: number) => void;
  setSwing: (swing: number) => void;
  setBassId: (id: BassId | null) => void;
  setKeysId: (id: KeysId | null) => void;
  setGuitarId: (id: GuitarId | null) => void;
  setGridOpen: (open: boolean) => void;
  setMixOpen: (open: boolean) => void;
  setLiveVoice: (voice: "synth" | "rhodes" | "guitar") => void;
  setDrumsOn: (on: boolean) => void;
  loadScene: (id: SceneId) => void;
  setDrumGain: (v: number) => void;
  setBassGain: (v: number) => void;
  setKeysGain: (v: number) => void;
  pressNote: (midi: number, source: string) => void;
  liftNote: (midi: number, source: string) => void;
  liftAll: () => void;
};

const LEAD = PRESETS[0]!.params;

function hush() {
  const s = useSynth.getState();
  synth.panic({ drums: s.drumGain, bass: s.bassGain, keys: s.keysGain });
  resyncClock();
}

function applyEngineParams(s: SynthParams) {
  synth.setParams({
    waveform: s.waveform,
    osc2Wave: s.osc2Wave,
    cutoff: s.cutoff,
    resonance: s.resonance,
    attack: s.attack,
    decay: s.decay,
    sustain: s.sustain,
    release: s.release,
    volume: s.volume,
    detune: s.detune,
    osc2Mix: s.osc2Mix,
    subMix: s.subMix,
    noiseMix: s.noiseMix,
    delay: s.delay,
    drive: s.drive,
  });
}

export const useSynth = create<SynthState>()((set, get) => ({
  ...LEAD,
  octave: 0,
  armed: false,
  preset: "lead",
  holds: {},
  mode: "drums",
  panel: "loop",
  bpm: 82,
  playing: false,
  playhead: -1,
  record: true,
  pattern: PATTERNS[0]!.steps,
  toneOpen: false,
  kit: "dusty",
  patternId: "lofi",
  reverb: 0.22,
  swing: 0.34,
  bassId: "dust",
  keysId: "dust",
  guitarId: "chime",
  drumsOn: true,
  gridOpen: false,
  mixOpen: false,
  liveVoice: "rhodes",
  sceneId: "lofi",
  drumGain: 0.95,
  bassGain: 0.88,
  keysGain: 0.7,
  arm: () => {
    synth.unlock();
    applyEngineParams(get());
    synth.setKit(get().kit);
    synth.setReverb(get().reverb);
    set({ armed: true });
  },
  setWaveform: (waveform) => {
    synth.setParams({ waveform });
    set({ waveform });
  },
  setCutoff: (cutoff) => {
    synth.setParams({ cutoff });
    set({ cutoff });
  },
  setResonance: (resonance) => {
    synth.setParams({ resonance });
    set({ resonance });
  },
  setAttack: (attack) => {
    synth.setParams({ attack });
    set({ attack });
  },
  setDecay: (decay) => {
    synth.setParams({ decay });
    set({ decay });
  },
  setSustain: (sustain) => {
    synth.setParams({ sustain });
    set({ sustain });
  },
  setReleaseTime: (release) => {
    synth.setParams({ release });
    set({ release });
  },
  setVolume: (volume) => {
    synth.setParams({ volume });
    set({ volume });
  },
  setDetune: (detune) => {
    synth.setParams({ detune });
    set({ detune });
  },
  setDelay: (delay) => {
    synth.setParams({ delay });
    set({ delay });
  },
  setDrive: (drive) => {
    synth.setParams({ drive });
    set({ drive });
  },
  setOctave: (octave) => set({ octave: Math.max(-2, Math.min(2, octave)) }),
  applyPreset: (id) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    synth.setParams(preset.params);
    set({ ...preset.params, preset: id, mode: "keys" });
  },
  setMode: (mode) => set({ mode }),
  setPanel: (panel) => set({ panel }),
  setBpm: (bpm) => {
    set({ bpm: Math.max(70, Math.min(180, Math.round(bpm))) });
    resyncClock();
  },
  togglePlay: () => {
    const next = !get().playing;
    synth.unlock();
    applyEngineParams(get());
    synth.setKit(get().kit);
    synth.setReverb(get().reverb);
    synth.setLaneGain("drums", get().drumGain);
    synth.setLaneGain("bass", get().bassGain);
    synth.setLaneGain("keys", get().keysGain);
    set({ armed: true, playing: next, playhead: next ? 0 : -1 });
  },
  setRecord: (record) => set({ record }),
  toggleStep: (id, index) => {
    set((s) => {
      const row = s.pattern[id].slice();
      row[index] = !row[index];
      return { pattern: { ...s.pattern, [id]: row } };
    });
  },
  clearPattern: () => {
    const blank = starterPattern();
    for (const key of Object.keys(blank) as DrumId[]) blank[key] = Array(16).fill(false);
    set({ pattern: blank });
  },
  loadStarter: () => {
    hush();
    const club = SCENES[0]!;
    const house = PATTERNS.find((p) => p.id === club.drums) ?? PATTERNS[0]!;
    synth.setKit(club.kit);
    set({
      pattern: structuredClone(house.steps),
      patternId: house.id,
      bpm: house.bpm,
      swing: house.swing,
      sceneId: club.id,
      kit: club.kit,
      bassId: club.bass,
      keysId: club.keys,
      guitarId: club.guitar,
      drumsOn: true,
    });
  },
  setKit: (kit) => {
    synth.setKit(kit);
    set({ kit });
  },
  loadPattern: (id) => {
    const found = PATTERNS.find((p) => p.id === id);
    if (!found) return;
    hush();
    set({ pattern: structuredClone(found.steps), patternId: id, bpm: found.bpm, drumsOn: true, swing: found.swing });
  },
  setReverb: (reverb) => {
    synth.setReverb(reverb);
    set({ reverb });
  },
  setSwing: (swing) => set({ swing: Math.max(0, Math.min(1, swing)) }),
  setBassId: (bassId) => {
    hush();
    set({ bassId });
  },
  setKeysId: (keysId) => {
    hush();
    set({ keysId });
  },
  setGuitarId: (guitarId) => {
    hush();
    set({ guitarId });
  },
  setGridOpen: (gridOpen) => set({ gridOpen }),
  setMixOpen: (mixOpen) => set({ mixOpen }),
  setLiveVoice: (liveVoice) => set({ liveVoice }),
  setDrumsOn: (drumsOn) => set({ drumsOn }),
  loadScene: (id) => {
    const scene = SCENES.find((s) => s.id === id);
    if (!scene) return;
    const found = PATTERNS.find((p) => p.id === scene.drums);
    hush();
    synth.setKit(scene.kit);
    synth.setReverb(scene.reverb);
    set({
      sceneId: id,
      kit: scene.kit,
      bassId: scene.bass,
      keysId: scene.keys,
      guitarId: scene.guitar,
      drumsOn: true,
      patternId: scene.drums,
      pattern: found ? structuredClone(found.steps) : get().pattern,
      bpm: found?.bpm ?? get().bpm,
      swing: found?.swing ?? get().swing,
      reverb: scene.reverb,
    });
  },
  setDrumGain: (drumGain) => {
    synth.setLaneGain("drums", drumGain);
    set({ drumGain });
  },
  setBassGain: (bassGain) => {
    synth.setLaneGain("bass", bassGain);
    set({ bassGain });
  },
  setKeysGain: (keysGain) => {
    synth.setLaneGain("keys", keysGain);
    set({ keysGain });
  },
  hitPad: (id) => {
    if (!get().armed) {
      synth.unlock();
      applyEngineParams(get());
      set({ armed: true });
    }
    synth.hitDrum(id);
    const s = get();
    if (s.record && s.playing && s.playhead >= 0) {
      const row = s.pattern[id].slice();
      row[s.playhead] = true;
      set({ pattern: { ...s.pattern, [id]: row } });
    }
  },
  setToneOpen: (toneOpen) => set({ toneOpen }),
  pressNote: (midi, source) => {
    if (!get().armed) {
      synth.unlock();
      applyEngineParams(get());
      set({ armed: true });
    }
    const voice = get().liveVoice;
    if (voice === "rhodes" || voice === "guitar") {
      synth.fireLoopNote(midi, synth.now(), 0.55, voice === "guitar" ? "guitar" : "keys");
    } else {
      synth.noteOn(midi, source);
    }
    set((s) => {
      const current = s.holds[midi] ?? [];
      if (current.includes(source)) return s;
      return { holds: { ...s.holds, [midi]: [...current, source] } };
    });
  },
  liftNote: (midi, source) => {
    synth.noteOff(midi, source);
    set((s) => {
      const current = s.holds[midi] ?? [];
      const next = current.filter((id) => id !== source);
      const holds = { ...s.holds };
      if (next.length === 0) delete holds[midi];
      else holds[midi] = next;
      return { holds };
    });
  },
  liftAll: () => {
    synth.releaseAll();
    set({ holds: {} });
  },
}));
