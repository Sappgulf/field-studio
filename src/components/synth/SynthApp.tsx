import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect } from "react";
import { KITS } from "@/lib/synth/drums";
import { synth } from "@/lib/synth/engine";
import { PRESETS } from "@/lib/synth/presets";
import { useSynth } from "@/lib/synth/store";
import { DrumPads } from "./DrumPads";
import { Effects } from "./Effects";
import { Knob } from "./Knob";
import { LoopRack } from "./LoopRack";
import { Mixer } from "./Mixer";
import { Piano } from "./Piano";
import { Scope } from "./Scope";
import { StepGrid } from "./StepGrid";
import { Transport } from "./Transport";
import { useComputerKeys } from "./use-computer-keys";
import { useLoopClock } from "./use-loop-clock";

export function SynthApp() {
  const armed = useSynth((s) => s.armed);
  const arm = useSynth((s) => s.arm);
  const cutoff = useSynth((s) => s.cutoff);
  const resonance = useSynth((s) => s.resonance);
  const attack = useSynth((s) => s.attack);
  const release = useSynth((s) => s.release);
  const octave = useSynth((s) => s.octave);
  const preset = useSynth((s) => s.preset);
  const mode = useSynth((s) => s.mode);
  const toneOpen = useSynth((s) => s.toneOpen);
  const kit = useSynth((s) => s.kit);
  const gridOpen = useSynth((s) => s.gridOpen);
  const mixOpen = useSynth((s) => s.mixOpen);
  const liveVoice = useSynth((s) => s.liveVoice);
  const setCutoff = useSynth((s) => s.setCutoff);
  const setResonance = useSynth((s) => s.setResonance);
  const setAttack = useSynth((s) => s.setAttack);
  const setReleaseTime = useSynth((s) => s.setReleaseTime);
  const setOctave = useSynth((s) => s.setOctave);
  const applyPreset = useSynth((s) => s.applyPreset);
  const setMode = useSynth((s) => s.setMode);
  const setToneOpen = useSynth((s) => s.setToneOpen);
  const setKit = useSynth((s) => s.setKit);
  const setGridOpen = useSynth((s) => s.setGridOpen);
  const setMixOpen = useSynth((s) => s.setMixOpen);
  const setLiveVoice = useSynth((s) => s.setLiveVoice);

  useComputerKeys();
  useLoopClock();

  useEffect(() => {
    const wake = () => synth.resumeIfNeeded();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("focus", wake);
    window.addEventListener("pointerdown", wake);
    return () => {
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("focus", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-3 py-4 sm:px-5 sm:py-6">
      <header className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Studio</p>
          <h1 className="text-3xl font-medium tracking-tight text-fg">Field</h1>
        </div>
        {!armed && (
          <button type="button" onPointerDown={arm} onClick={arm} className="rounded-full bg-primary px-4 py-2 text-sm text-primary-fg">
            Enable sound
          </button>
        )}
      </header>

      <section className="rounded-xl border border-border bg-surface p-3 sm:p-4">
        <Transport />
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-bg p-1.5">
          <Scope armed={armed} />
        </div>
        <button type="button" onClick={() => setMixOpen(!mixOpen)} className="mt-3 text-xs text-muted">
          {mixOpen ? "Hide mix" : "Mix & effects"}
        </button>
        {mixOpen && (
          <div className="mt-3 space-y-3">
            <Mixer />
            <Effects />
          </div>
        )}
      </section>

      <section className="mt-3 rounded-xl border border-border bg-surface p-3 sm:p-4">
        <LoopRack />
        <button type="button" onClick={() => setGridOpen(!gridOpen)} className="mt-3 text-xs text-muted">
          {gridOpen ? "Hide drum grid" : "Edit drum grid"}
        </button>
        {gridOpen && (
          <div className="mt-3">
            <StepGrid />
          </div>
        )}
      </section>

      <section className="mt-3 rounded-xl border border-border bg-surface p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setMode("drums")}
            className={mode === "drums" ? "rounded-full bg-primary px-4 py-2 text-sm text-primary-fg" : "rounded-full border border-border px-4 py-2 text-sm text-muted"}
          >
            Pads
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("keys");
              setLiveVoice("rhodes");
            }}
            className={mode === "keys" && liveVoice === "rhodes" ? "rounded-full bg-primary px-4 py-2 text-sm text-primary-fg" : "rounded-full border border-border px-4 py-2 text-sm text-muted"}
          >
            Rhodes
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("keys");
              setLiveVoice("guitar");
            }}
            className={mode === "keys" && liveVoice === "guitar" ? "rounded-full bg-primary px-4 py-2 text-sm text-primary-fg" : "rounded-full border border-border px-4 py-2 text-sm text-muted"}
          >
            Guitar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("keys");
              setLiveVoice("synth");
            }}
            className={mode === "keys" && liveVoice === "synth" ? "rounded-full bg-primary px-4 py-2 text-sm text-primary-fg" : "rounded-full border border-border px-4 py-2 text-sm text-muted"}
          >
            Synth
          </button>
        </div>

        {mode === "drums" ? (
          <div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {KITS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setKit(item.id)}
                  className={
                    kit === item.id
                      ? "rounded-full bg-fg px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-bg"
                      : "rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
            <DrumPads />
          </div>
        ) : (
          <div>
            {liveVoice === "synth" && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyPreset(item.id)}
                    className={
                      preset === item.id
                        ? "rounded-full bg-fg px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-bg"
                        : "rounded-full border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted"
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <div className="mb-3 flex items-center gap-2">
              <button type="button" aria-label="Octave down" onClick={() => setOctave(octave - 1)} className="grid size-11 place-items-center rounded-lg border border-border">
                <ChevronDown className="size-4" />
              </button>
              <span className="min-w-8 text-center font-mono text-sm tabular-nums">{octave >= 0 ? `+${octave}` : octave}</span>
              <button type="button" aria-label="Octave up" onClick={() => setOctave(octave + 1)} className="grid size-11 place-items-center rounded-lg border border-border">
                <ChevronUp className="size-4" />
              </button>
            </div>
            <Piano />
            {liveVoice === "synth" && (
              <>
                <button type="button" onClick={() => setToneOpen(!toneOpen)} className="mt-3 text-xs text-muted">
                  {toneOpen ? "Hide tone" : "Edit tone"}
                </button>
                {toneOpen && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Knob label="Cutoff" value={cutoff} min={180} max={9000} step={10} format={(v) => `${Math.round(v)}`} onChange={setCutoff} />
                    <Knob label="Reso" value={resonance} min={0.2} max={16} step={0.1} format={(v) => v.toFixed(1)} onChange={setResonance} />
                    <Knob label="Attack" value={attack} min={0.005} max={1.6} step={0.005} format={(v) => v.toFixed(2)} onChange={setAttack} />
                    <Knob label="Release" value={release} min={0.03} max={2.4} step={0.01} format={(v) => v.toFixed(2)} onChange={setReleaseTime} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
