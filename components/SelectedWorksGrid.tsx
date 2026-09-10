import WorkCard from "@/components/WorkCard";
import type { Work } from "@/types/work";

type SelectedWorksGridProps = {
  works: Work[];
};

const FEATURED_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw";
const SUPPORTING_SIZES = "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw";

export default function SelectedWorksGrid({ works }: SelectedWorksGridProps) {
  const [featuredWork, ...supportingWorks] = works;

  if (!featuredWork) return null;

  const topWorks = supportingWorks.slice(0, 4);
  const bottomWorks = supportingWorks.slice(4);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-2">
        <div className="col-span-2 lg:col-span-1 lg:row-span-2">
          <WorkCard
            work={featuredWork}
            mode="hover"
            eager
            sizes={FEATURED_SIZES}
          />
        </div>

        {topWorks.map((work) => (
          <WorkCard
            key={work.slug}
            work={work}
            mode="hover"
            sizes={SUPPORTING_SIZES}
          />
        ))}
      </div>

      {bottomWorks.length ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {bottomWorks.map((work) => (
            <WorkCard
              key={work.slug}
              work={work}
              mode="hover"
              sizes="(max-width: 639px) 50vw, 50vw"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
