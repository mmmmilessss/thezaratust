import Link from "next/link";
import Image from "next/image";
import type { Work } from "@/types/work";

type WorkCardProps = {
  work: Work;
  mode?: "hover" | "static";
  eager?: boolean;
  sizes?: string;
  dimOnHover?: boolean;
};

export default function WorkCard({
  work,
  mode = "static",
  eager = false,
  sizes = "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 33vw",
  dimOnHover = false,
}: WorkCardProps) {
  const isHoverMode = mode === "hover";

  return (
    <Link href={`/artwork/${work.slug}`} className="block">
      <article className={isHoverMode || dimOnHover ? "group" : undefined}>
        <div className="relative overflow-hidden">
          <Image
            src={work.thumbnail}
            alt={`${work.title} thumbnail`}
            width={work.thumbnailWidth}
            height={work.thumbnailHeight}
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
            className={`block h-auto w-full ${dimOnHover ? "transition-opacity group-hover:opacity-60" : ""}`}
          />

          {isHoverMode ? (
            <div className="absolute inset-0 flex flex-col justify-end bg-black/0 p-4 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
              <p className="text-xs font-gotham-bold sm:text-sm">{work.title}</p>
              <p className="text-xs font-gotham-medium opacity-60 sm:text-sm">
                {work.type.toUpperCase()} · {work.displayDate}
              </p>
            </div>
          ) : null}
        </div>

        {isHoverMode ? null : (
          <div className="pt-3">
            <p className="text-xs font-gotham-bold sm:text-sm">{work.title}</p>
            <p className="text-xs font-gotham-medium opacity-60 sm:text-sm">
              {work.type.toUpperCase()} · {work.displayDate}
            </p>
          </div>
        )}
      </article>
    </Link>
  );
}
