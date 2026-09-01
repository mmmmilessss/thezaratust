"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = { src: string; alt: string; width: number; height: number; sizes: string; eager: boolean; previews?: string[] };

export default function InteractiveWorkMedia({ src, alt, width, height, sizes, eager, previews = [] }: Props) {
  const [active, setActive] = useState(-1);
  const [enabled, setEnabled] = useState(false);
  const reducedMotion = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const target = useRef(0);
  const displayed = useRef(0);
  const lastTime = useRef(0);
  const currentIndex = useRef(-1);
  useEffect(() => {
    const media = matchMedia("(hover:hover) and (pointer:fine)");
    const reduced = matchMedia("(prefers-reduced-motion:reduce)");
    const update = () => { reducedMotion.current = reduced.matches; setEnabled(media.matches && previews.length > 1); };
    media.addEventListener("change", update);
    reduced.addEventListener("change", update);
    const timer = setTimeout(update, 0);
    return () => { clearTimeout(timer); media.removeEventListener("change", update); reduced.removeEventListener("change", update); };
  }, [previews.length]);
  useEffect(() => {
    if (!enabled || !container.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      for (const source of previews) {
        const image = new window.Image();
        image.src = source;
        void image.decode().catch(() => undefined);
      }
      observer.disconnect();
    }, { rootMargin: "500px" });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [enabled, previews]);
  const tick = (time: number) => {
    const delta = lastTime.current ? Math.min(50, time - lastTime.current) : 16.67;
    lastTime.current = time;
    const smoothing = 1 - Math.pow(0.8, delta / 16.67);
    displayed.current += (target.current - displayed.current) * smoothing;
    const next = Math.round(displayed.current * (previews.length - 1));
    if (next !== currentIndex.current) { currentIndex.current = next; setActive(next); }
    if (Math.abs(target.current - displayed.current) > 0.001) frame.current = requestAnimationFrame(tick);
    else frame.current = null;
  };
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    target.current = Math.min(1, Math.max(0, (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.clientWidth));
    if (reducedMotion.current) { const next = Math.round(target.current * (previews.length - 1)); if (next !== currentIndex.current) { currentIndex.current = next; setActive(next); } return; }
    if (!frame.current) frame.current = requestAnimationFrame(tick);
  };
  const enter = (event: React.PointerEvent<HTMLDivElement>) => { if (!enabled) return; target.current = Math.min(1, Math.max(0, (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.clientWidth)); displayed.current = target.current; currentIndex.current = Math.round(target.current * (previews.length - 1)); setActive(currentIndex.current); };
  const leave = () => { if (frame.current) cancelAnimationFrame(frame.current); frame.current = null; lastTime.current = 0; currentIndex.current = -1; setActive(-1); };
  return (
    <div ref={container} className="relative bg-black" style={{ aspectRatio: `${width}/${height}` }} onPointerEnter={enter} onPointerMove={move} onPointerLeave={leave}>
      <Image src={src} alt="" fill sizes="24px" aria-hidden className={`object-cover [image-rendering:pixelated] transition-opacity duration-200 ${loaded ? "opacity-0" : "opacity-70"}`} />
      <Image src={src} alt={alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} onLoad={() => setTimeout(() => setLoaded(true), 180)} className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`} />
      {enabled && active >= 0 ? previews.map((preview, index) => (
        // Generated previews are already 1200px / JPEG 86; using their exact URL also makes the near-viewport decode cache effective.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={preview} src={preview} alt="" aria-hidden loading="eager" className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-100 ${index === active ? "opacity-100" : "opacity-0"}`} />
      )) : null}
    </div>
  );
}
