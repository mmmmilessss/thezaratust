import type { Work } from "@/types/work";
import MasonryGrid from "@/components/MasonryGrid";
import WorkCard from "@/components/WorkCard";

type WorkGridProps = {
  works: Work[];
  className?: string;
  layout?: "masonry" | "grid";
  mode?: "hover" | "static";
  eagerFirst?: boolean;
  dimOnHover?: boolean;
};

export default function WorkGrid({
  works,
  className,
  layout = "masonry",
  mode = "static",
  eagerFirst = false,
  dimOnHover = false,
}: WorkGridProps) {
  const sizes = layout === "grid"
    ? "(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
    : "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 33vw";
  const cards = works.map((work, index) => (
    <WorkCard
      key={work.slug}
      work={work}
      mode={mode}
      eager={eagerFirst && index === 0}
      sizes={sizes}
      dimOnHover={dimOnHover}
    />
  ));

  if (layout === "grid") {
    const layoutClassName = className
      ? `grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 lg:grid-cols-4 ${className}`
      : "grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 lg:grid-cols-4";

    return <div className={layoutClassName}>{cards}</div>;
  }

  const masonryClassName = className
    ? `grid grid-cols-2 items-start gap-4 sm:gap-6 lg:grid-cols-3 ${className}`
    : "grid grid-cols-2 items-start gap-4 sm:gap-6 lg:grid-cols-3";

  return (
    <MasonryGrid
      items={cards}
      className={masonryClassName}
    />
  );
}
