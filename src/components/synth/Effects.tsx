import { useSynth } from "@/lib/synth/store";

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-fg">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-8 w-full accent-primary"
      />
    </label>
  );
}

export function Effects() {
  const delay = useSynth((s) => s.delay);
  const reverb = useSynth((s) => s.reverb);
  const swing = useSynth((s) => s.swing);
  const volume = useSynth((s) => s.volume);
  const setDelay = useSynth((s) => s.setDelay);
  const setReverb = useSynth((s) => s.setReverb);
  const setSwing = useSynth((s) => s.setSwing);
  const setVolume = useSynth((s) => s.setVolume);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      <Slider label="Reverb" value={reverb} min={0} max={1} step={0.01} display={`${Math.round(reverb * 100)}`} onChange={setReverb} />
      <Slider label="Delay" value={delay} min={0} max={1} step={0.01} display={`${Math.round(delay * 100)}`} onChange={setDelay} />
      <Slider label="Swing" value={swing} min={0} max={1} step={0.01} display={`${Math.round(swing * 100)}`} onChange={setSwing} />
      <Slider label="Level" value={volume} min={0} max={1} step={0.01} display={`${Math.round(volume * 100)}`} onChange={setVolume} />
    </div>
  );
}
