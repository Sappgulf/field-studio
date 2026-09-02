import type { ReactNode } from "react";
import { BASS_LOOPS, GUITAR_LOOPS, KEYS_LOOPS, SCENES } from "@/lib/synth/loops";
import { PATTERNS } from "@/lib/synth/patterns";
import { useSynth } from "@/lib/synth/store";
import { cn } from "@/lib/utils";

function Cell({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 min-w-0 rounded-md px-1.5 font-mono text-[10px] uppercase tracking-wide",
        active ? "bg-primary text-primary-fg" : "border border-border bg-raised text-muted",
      )}
    >
      {label}
    </button>
  );
}

function Lane({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{name}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function LoopRack() {
  const patternId = useSynth((s) => s.patternId);
  const bassId = useSynth((s) => s.bassId);
  const keysId = useSynth((s) => s.keysId);
  const guitarId = useSynth((s) => s.guitarId);
  const drumsOn = useSynth((s) => s.drumsOn);
  const loadPattern = useSynth((s) => s.loadPattern);
  const setBassId = useSynth((s) => s.setBassId);
  const setKeysId = useSynth((s) => s.setKeysId);
  const setGuitarId = useSynth((s) => s.setGuitarId);
  const setDrumsOn = useSynth((s) => s.setDrumsOn);
  const sceneId = useSynth((s) => s.sceneId);
  const loadScene = useSynth((s) => s.loadScene);

  return (
    <div className="space-y-3">
      <Lane name="Scene">
        {SCENES.map((item) => (
          <Cell key={item.id} label={item.label} active={sceneId === item.id} onClick={() => loadScene(item.id)} />
        ))}
      </Lane>
      <Lane name="Drums">
        {PATTERNS.filter((p) => p.id !== "boom").map((item) => (
          <Cell key={item.id} label={item.label} active={drumsOn && patternId === item.id} onClick={() => loadPattern(item.id)} />
        ))}
        <Cell label="Off" active={!drumsOn} onClick={() => setDrumsOn(false)} />
      </Lane>
      <Lane name="Bass">
        {BASS_LOOPS.slice(0, 6).map((item) => (
          <Cell key={item.id} label={item.label} active={bassId === item.id} onClick={() => setBassId(item.id)} />
        ))}
        <Cell label="Off" active={bassId === null} onClick={() => setBassId(null)} />
      </Lane>
      <Lane name="Keys">
        {KEYS_LOOPS.slice(0, 6).map((item) => (
          <Cell key={item.id} label={item.label} active={keysId === item.id} onClick={() => setKeysId(item.id)} />
        ))}
        <Cell label="Off" active={keysId === null} onClick={() => setKeysId(null)} />
      </Lane>
      <Lane name="Guitar">
        {GUITAR_LOOPS.map((item) => (
          <Cell key={item.id} label={item.label} active={guitarId === item.id} onClick={() => setGuitarId(item.id)} />
        ))}
        <Cell label="Off" active={guitarId === null} onClick={() => setGuitarId(null)} />
      </Lane>
    </div>
  );
}
