import Link from "next/link";
import type { Work } from "@/types/work";

/* eslint-disable @next/next/no-img-element */

type WorkCardProps = {
  work: Work;
  mode?: "hover" | "static";
};

export default function WorkCard({
  work,
  mode = "static",
}: WorkCardProps) {
  const isHoverMode = mode === "hover";

  return (
    <Link href={`/artwork/${work.slug}`} className="block">
      <article className={isHoverMode ? "group" : undefined}>
        <div className="relative overflow-hidden">
          <img
            src={work.thumbnail}
            alt={`${work.title} thumbnail`}
            className="block h-full w-full object-cover"
          />

          {isHoverMode ? (
            <div className="absolute inset-0 flex flex-col justify-end bg-black/0 p-4 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
              <p className="text-xs font-gotham-bold sm:text-sm">{work.title}</p>
              <p className="text-xs font-gotham-medium opacity-60 sm:text-sm">{work.displayDate}</p>
            </div>
          ) : null}
        </div>

        {isHoverMode ? null : (
          <div className="pt-3">
            <p className="text-xs font-gotham-bold sm:text-sm">{work.title}</p>
            <p className="text-xs font-gotham-medium opacity-60 sm:text-sm">{work.displayDate}</p>
          </div>
        )}
      </article>
    </Link>
  );
}
