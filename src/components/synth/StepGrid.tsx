import { DRUM_META } from "@/lib/synth/drums";
import { useSynth } from "@/lib/synth/store";
import { cn } from "@/lib/utils";

export function StepGrid() {
  const pattern = useSynth((s) => s.pattern);
  const playhead = useSynth((s) => s.playhead);
  const toggleStep = useSynth((s) => s.toggleStep);
  const hitPad = useSynth((s) => s.hitPad);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px] space-y-1.5">
        {DRUM_META.map((drum) => (
          <div key={drum.id} className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                hitPad(drum.id);
              }}
              className="w-12 shrink-0 text-left font-mono text-[10px] uppercase tracking-wider text-muted"
            >
              {drum.label}
            </button>
            <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
              {pattern[drum.id].map((on, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${drum.label} step ${i + 1}`}
                  onClick={() => toggleStep(drum.id, i)}
                  className={cn(
                    "h-8 rounded-sm border",
                    on ? "border-primary bg-primary" : "border-border bg-raised",
                    playhead === i && "ring-2 ring-fg/70",
                    i % 4 === 0 && !on && "bg-surface",
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
