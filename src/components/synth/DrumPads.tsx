import { DRUM_META } from "@/lib/synth/drums";
import { useSynth } from "@/lib/synth/store";
import { cn } from "@/lib/utils";

export function DrumPads() {
  const hitPad = useSynth((s) => s.hitPad);
  const playhead = useSynth((s) => s.playhead);
  const pattern = useSynth((s) => s.pattern);

  return (
    <div className="grid grid-cols-4 gap-2">
      {DRUM_META.map((drum) => {
        const live = playhead >= 0 && pattern[drum.id][playhead];
        return (
          <button
            key={drum.id}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              hitPad(drum.id);
            }}
            className={cn(
              "flex h-[72px] flex-col items-start justify-between rounded-lg border px-3 py-2 text-left",
              live ? "border-primary bg-primary text-primary-fg" : "border-border bg-raised text-fg",
            )}
          >
            <span className="font-mono text-[10px] text-muted">{drum.key}</span>
            <span className="text-sm font-medium">{drum.label}</span>
          </button>
        );
      })}
    </div>
  );
}
