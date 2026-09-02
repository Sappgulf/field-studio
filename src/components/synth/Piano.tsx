import { useMemo } from "react";
import {
  COMPUTER_KEY_HINTS,
  COMPUTER_KEY_OFFSETS,
  isBlackKey,
  keyboardRange,
  midiToName,
} from "@/lib/synth/notes";
import { useSynth } from "@/lib/synth/store";
import { cn } from "@/lib/utils";

function blackOffsetPercent(midi: number, whites: number[]): number {
  const prevWhite = [...whites].reverse().find((w) => w < midi);
  if (prevWhite === undefined) return 0;
  const index = whites.indexOf(prevWhite);
  const slot = 100 / whites.length;
  return (index + 1) * slot;
}

function capturePointer(el: HTMLElement, pointerId: number) {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    /* untrusted / already released */
  }
}

export function Piano() {
  const octave = useSynth((s) => s.octave);
  const pressNote = useSynth((s) => s.pressNote);
  const liftNote = useSynth((s) => s.liftNote);
  const holds = useSynth((s) => s.holds);
  const notes = useMemo(() => keyboardRange(octave), [octave]);
  const whites = notes.filter((n) => !isBlackKey(n));
  const blacks = notes.filter((n) => isBlackKey(n));
  const start = notes[0] ?? 48;

  const hintFor = (midi: number) => {
    const offset = midi - start;
    const code = Object.entries(COMPUTER_KEY_OFFSETS).find(([, v]) => v === offset)?.[0];
    return code ? COMPUTER_KEY_HINTS[code] : "";
  };

  const down = (midi: number, pointerId: number, el: HTMLElement) => {
    capturePointer(el, pointerId);
    pressNote(midi, `ptr-${pointerId}`);
  };

  return (
    <div className="relative w-full select-none touch-none">
      <div className="flex gap-px">
        {whites.map((midi) => {
          const on = Boolean(holds[midi]);
          return (
            <button
              key={midi}
              type="button"
              data-active={on}
              aria-label={midiToName(midi)}
              className={cn(
                "piano-white relative h-40 flex-1 rounded-b-md sm:h-48",
                "transition-transform duration-75",
              )}
              onPointerDown={(e) => {
                e.preventDefault();
                down(midi, e.pointerId, e.currentTarget);
              }}
              onPointerUp={(e) => liftNote(midi, `ptr-${e.pointerId}`)}
              onPointerCancel={(e) => liftNote(midi, `ptr-${e.pointerId}`)}
            >
              <span className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-key-fg/45">
                  {hintFor(midi)}
                </span>
                {midi % 12 === 0 && (
                  <span className="font-mono text-[10px] text-key-fg/70">{midiToName(midi)}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-0">
        {blacks.map((midi) => {
          const on = Boolean(holds[midi]);
          return (
            <button
              key={midi}
              type="button"
              data-active={on}
              aria-label={midiToName(midi)}
              style={{ left: `${blackOffsetPercent(midi, whites)}%` }}
              className={cn(
                "piano-black pointer-events-auto absolute top-0 z-10 h-[58%] w-[4.8%] -translate-x-1/2 rounded-b-sm",
                "transition-transform duration-75",
              )}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                down(midi, e.pointerId, e.currentTarget);
              }}
              onPointerUp={(e) => liftNote(midi, `ptr-${e.pointerId}`)}
              onPointerCancel={(e) => liftNote(midi, `ptr-${e.pointerId}`)}
            >
              <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-mono text-[9px] text-muted">
                {hintFor(midi)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
