import { useEffect, useRef } from "react";
import { synth } from "@/lib/synth/engine";

export function Scope({ armed }: { armed: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const buffer = new Uint8Array(1024);

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const { width, height } = canvas;
      ctx.fillStyle = "#101014";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(200,204,212,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (!armed || !synth.fillWaveform(buffer)) {
        ctx.strokeStyle = "rgba(200,204,212,0.28)";
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      ctx.beginPath();
      ctx.strokeStyle = "#d4d8de";
      ctx.lineWidth = 1.5;
      const step = Math.max(1, Math.floor(buffer.length / width));
      for (let x = 0; x < width; x++) {
        const sample = buffer[x * step] ?? 128;
        const y = (sample / 255) * height;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [armed]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={120}
      className="h-[72px] w-full rounded-md bg-bg sm:h-[88px]"
      aria-hidden="true"
    />
  );
}

export function LevelMeter({ armed }: { armed: boolean }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const el = barRef.current;
      if (!el) return;
      const level = armed ? synth.getLevel() : 0;
      el.style.transform = `scaleY(${Math.max(0.02, level)})`;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [armed]);

  return (
    <div
      className="flex h-[72px] w-3 items-end overflow-hidden rounded-full bg-bg sm:h-[88px] sm:w-3.5"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-bottom rounded-full bg-primary"
        style={{ transform: "scaleY(0.02)" }}
      />
    </div>
  );
}
