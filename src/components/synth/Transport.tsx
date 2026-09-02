import { Pause, Play, RotateCcw } from "lucide-react";
import { useSynth } from "@/lib/synth/store";

export function Transport() {
  const playing = useSynth((s) => s.playing);
  const bpm = useSynth((s) => s.bpm);
  const record = useSynth((s) => s.record);
  const togglePlay = useSynth((s) => s.togglePlay);
  const setBpm = useSynth((s) => s.setBpm);
  const setRecord = useSynth((s) => s.setRecord);
  const loadStarter = useSynth((s) => s.loadStarter);
  const clearPattern = useSynth((s) => s.clearPattern);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          togglePlay();
        }}
        aria-label={playing ? "Stop loop" : "Play loop"}
        className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-primary-fg"
      >
        {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-px" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Tempo</span>
          <span className="font-mono text-sm tabular-nums text-fg">{bpm}</span>
        </div>
        <input
          type="range"
          min={70}
          max={180}
          value={bpm}
          aria-label="Tempo"
          onChange={(e) => setBpm(Number(e.target.value))}
          className="mt-1 h-8 w-full accent-primary"
        />
      </div>
      <button
        type="button"
        onClick={() => setRecord(!record)}
        className={
          record
            ? "h-11 rounded-full bg-fg px-3 font-mono text-[11px] uppercase tracking-wider text-bg"
            : "h-11 rounded-full border border-border px-3 font-mono text-[11px] uppercase tracking-wider text-muted"
        }
      >
        Rec
      </button>
      <button
        type="button"
        aria-label="Reset beat"
        onClick={loadStarter}
        className="grid size-11 place-items-center rounded-full border border-border text-muted"
      >
        <RotateCcw className="size-4" />
      </button>
      <button
        type="button"
        onClick={clearPattern}
        className="hidden h-11 rounded-full border border-border px-3 font-mono text-[11px] uppercase tracking-wider text-muted sm:inline-flex sm:items-center"
      >
        Clear
      </button>
    </div>
  );
}
