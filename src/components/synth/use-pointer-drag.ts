import { useCallback, type PointerEvent as ReactPointerEvent } from "react";

export function usePointerDrag(onDelta: (dy: number, dx: number) => void) {
  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      let lastY = event.clientY;
      let lastX = event.clientX;

      const move = (e: PointerEvent) => {
        onDelta(e.clientY - lastY, e.clientX - lastX);
        lastY = e.clientY;
        lastX = e.clientX;
      };
      const up = () => {
        target.releasePointerCapture(event.pointerId);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [onDelta],
  );

  return { onPointerDown };
}
