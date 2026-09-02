import { useEffect } from "react";
import { startClock, stopClock } from "@/lib/synth/clock";
import { useSynth } from "@/lib/synth/store";

export function useLoopClock() {
  const playing = useSynth((s) => s.playing);
  useEffect(() => {
    if (playing) startClock();
    else stopClock();
    return () => stopClock();
  }, [playing]);
}
