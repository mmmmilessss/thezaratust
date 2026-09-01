"use client";

import { useState } from "react";
import Image from "next/image";
import type { WorkLinks } from "@/types/work";
import MusicReactive from "@/components/MusicReactive";

type MusicArtworkLaunchProps = {
  image: string;
  imageWidth: number;
  imageHeight: number;
  title: string;
  links: WorkLinks;
  audioEnvelope?: string;
};

const platformLabels = [
  ["spotify", "Spotify"],
  ["apple", "Apple Music"],
  ["youtube", "YouTube"],
  ["soundcloud", "SoundCloud"],
] as const;

export default function MusicArtworkLaunch({
  image,
  imageWidth,
  imageHeight,
  title,
  links,
  audioEnvelope,
}: MusicArtworkLaunchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const availableLinks = platformLabels.filter(([key]) => links[key]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group relative block w-full max-w-[80vh] text-left"
        aria-expanded={isOpen}
        aria-label={`Open listening platforms for ${title}`}
      >
        <MusicReactive envelope={audioEnvelope}><Image
          src={image}
          alt={title}
          width={imageWidth}
          height={imageHeight}
          quality={90}
          sizes="(max-width: 767px) calc(100vw - 3rem), min(50vw, 80vh)"
          loading="eager"
          className="block h-auto w-full"
        /></MusicReactive>
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
              className="transition-opacity hover:opacity-60"
            >
              {label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
