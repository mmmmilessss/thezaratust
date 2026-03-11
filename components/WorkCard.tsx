import Link from "next/link";
import type { Work } from "@/types/work";

/* eslint-disable @next/next/no-img-element */

type WorkCardProps = {
  work: Work;
  showMetaOnHover?: boolean;
};

export default function WorkCard({
  work,
  showMetaOnHover = false,
}: WorkCardProps) {
  return (
    <Link href={`/artwork/${work.slug}`} className="block">
      <article className="group">
        <div className="relative">
          <img
            src={work.thumbnail}
            alt={`${work.title} thumbnail`}
            className="block h-auto max-h-[400px] w-auto max-w-full object-contain"
          />

          {showMetaOnHover ? (
            <div className="absolute inset-0 flex flex-col justify-end bg-black/0 p-4 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
              <p className="text-xs font-gotham-bold sm:text-sm">{work.title}</p>
              <p className="text-xs font-gotham-medium opacity-60 sm:text-sm">{work.displayDate}</p>
            </div>
          ) : null}
        </div>

        {showMetaOnHover ? null : (
          <div className="pt-3 transition group-hover:opacity-60">
            <p className="text-xs font-gotham-bold sm:text-sm">{work.title}</p>
            <p className="text-xs font-gotham-medium opacity-60 sm:text-sm">{work.displayDate}</p>
          </div>
        )}
      </article>
    </Link>
  );
}
