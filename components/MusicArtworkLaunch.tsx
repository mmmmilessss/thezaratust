"use client";

import { useState } from "react";
import type { WorkLinks } from "@/types/work";

/* eslint-disable @next/next/no-img-element */

type MusicArtworkLaunchProps = {
  image: string;
  title: string;
  links: WorkLinks;
};

const platformLabels = [
  ["spotify", "Spotify"],
  ["apple", "Apple Music"],
  ["youtube", "YouTube"],
  ["soundcloud", "SoundCloud"],
] as const;

export default function MusicArtworkLaunch({
  image,
  title,
  links,
}: MusicArtworkLaunchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const availableLinks = platformLabels.filter(([key]) => links[key]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group relative block text-left"
        aria-expanded={isOpen}
        aria-label={`Open listening platforms for ${title}`}
      >
        <img
          src={image}
          alt={title}
          className="block h-auto max-h-[80vh] w-auto max-w-full"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-gotham-bold opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
          GO LISTEN
        </span>
      </button>

      {isOpen ? (
        <div className="flex flex-col gap-3 text-xs font-gotham-medium sm:flex-row sm:flex-wrap sm:gap-6 sm:text-sm">
          {availableLinks.map(([key, label]) => (
            <a
              key={key}
              href={links[key]}
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-60"
            >
              {label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
