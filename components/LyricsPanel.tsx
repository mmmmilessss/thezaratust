"use client";

import { useState } from "react";
import type { TrackLyrics } from "@/types/work";

export default function LyricsPanel({ tracks }: { tracks: TrackLyrics[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="mt-14 max-w-xl border-t border-white/15 pt-6" aria-labelledby="lyrics-heading">
      <h2 id="lyrics-heading" className="mb-5 text-xs tracking-[0.2em] font-gotham-bold sm:text-sm">
        LYRICS
      </h2>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {tracks.map((track, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={track.title}
              type="button"
              aria-expanded={isActive}
              onClick={() => setActiveIndex(isActive ? null : index)}
              className={`cursor-pointer text-left text-[10px] tracking-[0.12em] font-gotham-bold transition-opacity sm:text-xs ${isActive ? "opacity-100" : "opacity-45 hover:opacity-100"}`}
            >
              {String(index + 1).padStart(2, "0")} {track.title}
            </button>
          );
        })}
      </div>

      {activeIndex !== null ? (
        <div className="mt-8 border-t border-white/15 pt-7">
          <h3 className="mb-6 text-xs font-gotham-bold sm:text-sm">{tracks[activeIndex].title}</h3>
          <p className="whitespace-pre-line normal-case text-xs leading-6 font-gotham-medium sm:text-sm sm:leading-7">
            {tracks[activeIndex].lyrics}
          </p>
        </div>
      ) : null}
    </section>
  );
}
