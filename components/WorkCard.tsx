import Link from "next/link";
import InteractiveWorkMedia from "@/components/InteractiveWorkMedia";
import type { Work } from "@/types/work";

type WorkCardProps = {
  work: Work;
  mode?: "hover" | "static";
  eager?: boolean;
  sizes?: string;
  dimOnHover?: boolean;
  showCategory?: boolean;
};

export default function WorkCard({
  work,
  mode = "static",
  eager = false,
  sizes = "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 33vw",
  dimOnHover = false,
  showCategory = true,
}: WorkCardProps) {
  const isHoverMode = mode === "hover";
  const cursorLabel = work.type === "music" ? "LISTEN" : work.type === "film" || work.type === "video" ? "WATCH" : "VIEW";

  return (
    <Link href={`/artwork/${work.slug}`} className="block" data-cursor-label={cursorLabel}>
      <article className={isHoverMode || dimOnHover ? "group" : undefined}>
        <div className="relative overflow-hidden">
          <InteractiveWorkMedia
            src={work.thumbnail}
            alt={`${work.title} thumbnail`}
            width={work.thumbnailWidth}
            height={work.thumbnailHeight}
            sizes={sizes}
            eager={eager}
            previews={work.previewImages}
          />

          {dimOnHover ? (
            <div className="pointer-events-none absolute inset-0 z-20 bg-black/0 transition-colors duration-150 group-hover:bg-black/40" />
          ) : null}

          {isHoverMode ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-black/0 p-4 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
              <p lang={work.slug === "winter-vacation" ? "ko" : undefined} className={work.slug === "winter-vacation" ? "!text-[14px] font-gotham-bold sm:!text-base" : "text-xs font-gotham-bold sm:text-sm"}>{work.title}</p>
              <p className="text-xs font-gotham-medium opacity-60 sm:text-sm">
                {showCategory ? `${work.type.toUpperCase()} · ` : ""}{work.displayDate}
              </p>
            </div>
          ) : null}
        </div>

        {isHoverMode ? null : (
          <div className="pt-3">
            <p className="text-xs font-gotham-bold sm:text-sm">{work.title}</p>
            <p className="text-xs font-gotham-medium opacity-60 sm:text-sm">
              {showCategory ? `${work.type.toUpperCase()} · ` : ""}{work.displayDate}
            </p>
          </div>
        )}
      </article>
    </Link>
  );
}
