import { synth } from "./engine";
import { DRUM_IDS } from "./drums";
import { bassSteps, BASS_VOICE, guitarSteps, GUITAR_VOICE, keysSteps, KEYS_VOICE } from "./loops";
import { useSynth } from "./store";

let timer = 0;
let nextTime = 0;
let step = 0;

const LOOKAHEAD = 0.12;
const TICK_MS = 25;

function stepLen(bpm: number) {
  return 60 / bpm / 4;
}

function tick() {
  const state = useSynth.getState();
  if (!state.playing) return;
  synth.unlock();
  const now = synth.now();
  if (now <= 0) {
    synth.resumeIfNeeded();
    return;
  }
  const dur = stepLen(state.bpm);
  const bass = bassSteps(state.bassId);
  const keys = keysSteps(state.keysId);
  const guitar = guitarSteps(state.guitarId);
  if (nextTime === 0 || nextTime < now - dur) nextTime = now;
  let guard = 0;
  while (nextTime < now + LOOKAHEAD && guard < 6) {
    guard += 1;
    const current = step;
    const swingDelay = current % 2 === 1 ? dur * state.swing * 0.48 : 0;
    const when = nextTime + swingDelay;
    for (const id of DRUM_IDS) {
      if (state.drumsOn && state.pattern[id][current]) synth.hitDrum(id, when);
    }
    if (state.drumsOn && state.pattern.kick[current]) synth.duckBass(when);
    if (bass && state.bassId) {
      const voice = BASS_VOICE[state.bassId];
      for (const hit of bass[current] ?? []) {
        synth.fireLoopNote(hit.midi, when, hit.gate, "bass", hit.slide, voice);
      }
    }
    if (keys && state.keysId) {
      const voice = KEYS_VOICE[state.keysId];
      for (const hit of keys[current] ?? []) {
        synth.fireLoopNote(hit.midi, when, hit.gate, "keys", false, voice);
      }
    }
    if (guitar && state.guitarId) {
      const voice = GUITAR_VOICE[state.guitarId];
      for (const hit of guitar[current] ?? []) {
        synth.fireLoopNote(hit.midi, when, hit.gate, "guitar", false, voice);
      }
    }
    useSynth.setState({ playhead: current });
    nextTime += dur;
    step = (step + 1) % 16;
  }
}

export function startClock() {
  synth.unlock();
  synth.resumeIfNeeded();
  const now = synth.now();
  nextTime = now > 0 ? now + 0.05 : 0;
  step = 0;
  useSynth.setState({ playhead: 0 });
  window.clearInterval(timer);
  timer = window.setInterval(tick, TICK_MS);
  tick();
}

export function resyncClock() {
  const now = synth.now();
  nextTime = now > 0 ? now + 0.04 : 0;
  step = 0;
}

export function stopClock() {
  window.clearInterval(timer);
  timer = 0;
  useSynth.setState({ playhead: -1 });
}
