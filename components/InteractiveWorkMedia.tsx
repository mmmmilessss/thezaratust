"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = { src: string; alt: string; width: number; height: number; sizes: string; eager: boolean; previews?: string[]; dim?: boolean };

export default function InteractiveWorkMedia({ src, alt, width, height, sizes, eager, previews = [], dim }: Props) {
  const [active, setActive] = useState(-1);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const frame = useRef<number | null>(null);
  const pending = useRef(0);
  useEffect(() => {
    const media = matchMedia("(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)");
    const update = () => setEnabled(media.matches && previews.length > 1);
    media.addEventListener("change", update);
    const timer = setTimeout(update, 0);
    return () => { clearTimeout(timer); media.removeEventListener("change", update); };
  }, [previews.length]);
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    pending.current = Math.min(0.999, Math.max(0, (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.clientWidth));
    if (!frame.current) frame.current = requestAnimationFrame(() => { setActive(Math.floor(pending.current * previews.length)); frame.current = null; });
  };
  return (
    <div className="relative bg-black" style={{ aspectRatio: `${width}/${height}` }} onPointerEnter={() => enabled && setActive(0)} onPointerMove={move} onPointerLeave={() => setActive(-1)}>
      <Image src={src} alt="" fill sizes="24px" aria-hidden className={`object-cover [image-rendering:pixelated] transition-opacity duration-200 ${loaded ? "opacity-0" : "opacity-70"}`} />
      <Image src={src} alt={alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} onLoad={() => setTimeout(() => setLoaded(true), 180)} className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${dim ? "group-hover:opacity-60" : ""}`} />
      {enabled && active >= 0 ? previews.map((preview, index) => (
        <Image key={preview} src={preview} alt="" fill sizes={sizes} loading="eager" className={`pointer-events-none object-cover transition-opacity duration-100 ${index === active ? "opacity-100" : "opacity-0"} ${dim ? "group-hover:opacity-60" : ""}`} />
      )) : null}
    </div>
  );
}
