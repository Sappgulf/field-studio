import { useSynth } from "@/lib/synth/store";

function Lane({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-fg">{Math.round(value * 100)}</span>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-8 w-full accent-primary"
      />
    </label>
  );
}

export function Mixer() {
  const drumGain = useSynth((s) => s.drumGain);
  const bassGain = useSynth((s) => s.bassGain);
  const keysGain = useSynth((s) => s.keysGain);
  const setDrumGain = useSynth((s) => s.setDrumGain);
  const setBassGain = useSynth((s) => s.setBassGain);
  const setKeysGain = useSynth((s) => s.setKeysGain);

  return (
    <div className="grid grid-cols-3 gap-3">
      <Lane label="Drums" value={drumGain} onChange={setDrumGain} />
      <Lane label="Bass" value={bassGain} onChange={setBassGain} />
      <Lane label="Keys" value={keysGain} onChange={setKeysGain} />
    </div>
  );
}
