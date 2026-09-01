"use client";

import { useEffect, useRef, useState } from "react";

export default function MediaCursor() {
  const [label, setLabel] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;
      if (ref.current) ref.current.style.transform = `translate3d(${current.current.x + 14}px,${current.current.y + 14}px,0)`;
      frame.current = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      target.current = { x: event.clientX, y: event.clientY };
      if (!frame.current) {
        current.current = target.current;
        frame.current = requestAnimationFrame(animate);
      }
      const element = (event.target as Element)?.closest?.<HTMLElement>("[data-cursor-label]");
      setLabel(element?.dataset.cursorLabel ?? "");
    };
    const leave = () => setLabel("");
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return <div ref={ref} aria-hidden className={`pointer-events-none fixed left-0 top-0 z-[100] text-[9px] tracking-[0.08em] text-white [text-shadow:0_2px_5px_rgba(0,0,0,1),0_0_12px_rgba(0,0,0,1)] transition-opacity ${label ? "opacity-100" : "opacity-0"}`}>{label}</div>;
}
