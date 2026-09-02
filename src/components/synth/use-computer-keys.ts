import { useEffect } from "react";
import { DRUM_META } from "@/lib/synth/drums";
import { midiFromComputerKey } from "@/lib/synth/notes";
import { useSynth } from "@/lib/synth/store";

const DIGIT_DRUM: Record<string, (typeof DRUM_META)[number]["id"]> = Object.fromEntries(
  DRUM_META.map((d) => [`Digit${d.key}`, d.id]),
);

export function useComputerKeys() {
  const pressNote = useSynth((s) => s.pressNote);
  const liftNote = useSynth((s) => s.liftNote);
  const setOctave = useSynth((s) => s.setOctave);
  const liftAll = useSynth((s) => s.liftAll);
  const hitPad = useSynth((s) => s.hitPad);
  const togglePlay = useSynth((s) => s.togglePlay);

  useEffect(() => {
    const down = new Set<string>();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;

      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) togglePlay();
        return;
      }

      const drum = DIGIT_DRUM[event.code];
      if (drum) {
        event.preventDefault();
        if (!event.repeat) hitPad(drum);
        return;
      }

      if (event.code === "KeyZ") {
        event.preventDefault();
        setOctave(useSynth.getState().octave - 1);
        return;
      }
      if (event.code === "KeyX") {
        event.preventDefault();
        setOctave(useSynth.getState().octave + 1);
        return;
      }

      const midi = midiFromComputerKey(event.code, useSynth.getState().octave);
      if (midi === null) return;
      event.preventDefault();
      if (event.repeat || down.has(event.code)) return;
      down.add(event.code);
      pressNote(midi, `kb-${event.code}`);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const midi = midiFromComputerKey(event.code, useSynth.getState().octave);
      if (midi === null) return;
      down.delete(event.code);
      liftNote(midi, `kb-${event.code}`);
    };

    const blur = () => {
      down.clear();
      liftAll();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", blur);
    };
  }, [pressNote, liftNote, liftAll, setOctave, hitPad, togglePlay]);
}
