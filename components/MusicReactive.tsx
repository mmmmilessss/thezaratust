"use client";

import { useEffect, useRef } from "react";
import { PLAYBACK_EVENT, type PlaybackState } from "@/lib/playback";

export default function MusicReactive({ envelope, children, className = "" }: { envelope?: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!envelope) return;
    let values: number[] = []; let state: PlaybackState | null = null; let raf = 0; let level = 0;
    const tick = () => { if (!state || !ref.current) return; const position = state.positionMs + (state.isPlaying ? performance.now() - state.updatedAt : 0); const target = values[Math.min(values.length - 1, Math.floor(position / 25))] ?? 0; level += (target - level) * (target > level ? 0.22 : 0.08); ref.current.style.opacity = String(1 - level * 0.22); if (state.isPlaying || level > .005) raf = requestAnimationFrame(tick); };
    const onPlayback = async (event: Event) => { state = (event as CustomEvent<PlaybackState>).detail; if (!values.length) values = (await fetch(envelope).then((r) => r.json())).values ?? []; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    addEventListener(PLAYBACK_EVENT, onPlayback); return () => { removeEventListener(PLAYBACK_EVENT, onPlayback); cancelAnimationFrame(raf); };
  }, [envelope]);
  return <div ref={ref} className={className}>{children}</div>;
}
