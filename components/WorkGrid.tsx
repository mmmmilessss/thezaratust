import type { Work } from "@/types/work";
import MasonryGrid from "@/components/MasonryGrid";
import WorkCard from "@/components/WorkCard";

type WorkGridProps = {
  works: Work[];
  className?: string;
  layout?: "masonry" | "grid";
  mode?: "hover" | "static";
};

export default function WorkGrid({
  works,
  className,
  layout = "masonry",
  mode = "static",
}: WorkGridProps) {
  const cards = works.map((work) => (
    <WorkCard
      key={work.slug}
      work={work}
      mode={mode}
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
