import { useRef } from "react";
import { usePointerDrag } from "./use-pointer-drag";
import { cn } from "@/lib/utils";

type KnobProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function Knob({
  label,
  value,
  min,
  max,
  step = 0.01,
  format,
  onChange,
  disabled,
}: KnobProps) {
  const ratio = (value - min) / (max - min);
  const angle = -135 + ratio * 270;
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const bind = usePointerDrag((dy, dx) => {
    if (disabled) return;
    const span = max - min;
    const next = Math.min(max, Math.max(min, valueRef.current + (-dy + dx * 0.35) * span * 0.005));
    const snapped = Math.round(next / step) * step;
    onChangeRef.current(Number(snapped.toFixed(4)));
  });

  return (
    <div className="flex w-16 flex-col items-center gap-2 sm:w-[4.5rem]">
      <button
        type="button"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        disabled={disabled}
        className={cn(
          "relative grid size-14 place-items-center rounded-full border border-border bg-raised sm:size-16",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_16px_rgba(0,0,0,0.35)]",
          "touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          disabled && "opacity-50",
        )}
        {...bind}
      >
        <span className="absolute inset-1.5 rounded-full border border-border/80 bg-surface" />
        <span
          className="absolute left-1/2 top-1/2 h-[42%] w-0.5 origin-bottom rounded-full bg-primary"
          style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
        />
        <span className="relative size-1.5 rounded-full bg-subtle" />
      </button>
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
        <p className="font-mono text-xs tabular-nums text-fg">
          {format ? format(value) : value.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
