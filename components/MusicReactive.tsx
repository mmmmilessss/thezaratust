"use client";

import { useEffect, useRef } from "react";
import { PLAYBACK_EVENT, type PlaybackState } from "@/lib/playback";

type GlowColor = { red: number; green: number; blue: number };

function enhanceExtractedColor({ red, green, blue }: GlowColor): GlowColor {
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  if (maximum - minimum >= 24) return { red, green, blue };

  if (blue >= red) {
    return { red: red * 0.55, green: green * 0.82, blue: Math.min(210, blue * 1.08) };
  }
  return { red: Math.min(210, red * 1.08), green: green * 0.72, blue: blue * 0.58 };
}

function brightenGlowColor(color: GlowColor): GlowColor {
  const maximum = Math.max(color.red, color.green, color.blue);
  const scale = maximum > 0 && maximum < 180 ? 180 / maximum : 1;
  return {
    red: Math.min(225, color.red * scale),
    green: Math.min(225, color.green * scale),
    blue: Math.min(225, color.blue * scale),
  };
}

async function extractGlowColor(source: string): Promise<GlowColor> {
  const image = new Image();
  image.decoding = "async";
  image.src = source;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(image, 0, 0, 32, 32);

  const pixels = context.getImageData(0, 0, 32, 32).data;
  let red = 0; let green = 0; let blue = 0; let totalWeight = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const pixelRed = pixels[index];
    const pixelGreen = pixels[index + 1];
    const pixelBlue = pixels[index + 2];
    const lightness = (pixelRed + pixelGreen + pixelBlue) / 3;
    if (lightness < 24 || lightness > 232) continue;
    const saturation = Math.max(pixelRed, pixelGreen, pixelBlue) - Math.min(pixelRed, pixelGreen, pixelBlue);
    const weight = 0.25 + saturation / 64;
    red += pixelRed * weight;
    green += pixelGreen * weight;
    blue += pixelBlue * weight;
    totalWeight += weight;
  }

  if (!totalWeight) return brightenGlowColor({ red: 82, green: 128, blue: 148 });
  return brightenGlowColor(enhanceExtractedColor({ red: red / totalWeight, green: green / totalWeight, blue: blue / totalWeight }));
}

export default function MusicReactive({ envelope, colorSource, children, className = "" }: { envelope?: string; colorSource?: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!envelope || !element) return;
    let values: number[] = []; let state: PlaybackState | null = null; let raf = 0; let level = 0;
    let color: GlowColor = { red: 82, green: 128, blue: 148 };
    const renderGlow = (energy: number) => {
      if (energy < 0.004) {
        element.style.filter = "none";
        return;
      }
      const alpha = energy * 0.4;
      const blur = 10 + energy * 20;
      element.style.filter = `drop-shadow(0 0 ${blur.toFixed(1)}px rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${alpha.toFixed(3)})) drop-shadow(0 0 ${(blur * 1.55).toFixed(1)}px rgba(${Math.round(color.red)}, ${Math.round(color.green)}, ${Math.round(color.blue)}, ${(energy * 0.14).toFixed(3)}))`;
    };
    renderGlow(0);
    if (colorSource) void extractGlowColor(colorSource).then((value) => { color = value; renderGlow(0); }).catch(() => undefined);
    const tick = () => {
      if (!state) return;
      const position = state.positionMs + (state.isPlaying ? performance.now() - state.updatedAt : 0);
      const target = state.isPlaying && !state.isBuffering ? values[Math.min(values.length - 1, Math.floor(position / 25))] ?? 0 : 0;
      level += (target - level) * (target > level ? 0.26 : 0.15);
      renderGlow(Math.pow(Math.max(0, level), 0.65));
      if (state.isPlaying || level > .002) raf = requestAnimationFrame(tick);
    };
    const onPlayback = async (event: Event) => { state = (event as CustomEvent<PlaybackState>).detail; if (!values.length) values = (await fetch(envelope).then((r) => r.json())).values ?? []; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    addEventListener(PLAYBACK_EVENT, onPlayback); return () => { removeEventListener(PLAYBACK_EVENT, onPlayback); cancelAnimationFrame(raf); element.style.filter = "none"; };
  }, [colorSource, envelope]);
  return <div ref={ref} className={className}>{children}</div>;
}
