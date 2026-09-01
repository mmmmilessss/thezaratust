"use client";

import { useEffect, useMemo, useState } from "react";
import ArchiveSortControls from "@/components/ArchiveSortControls";
import WorkGrid from "@/components/WorkGrid";
import { groupWorksByYear, sortWorks } from "@/lib/works";
import type { ArchiveSort, Work } from "@/types/work";

type ArchiveClientProps = {
  works: Work[];
};

export default function ArchiveClient({ works }: ArchiveClientProps) {
  const [sort, setSort] = useState<ArchiveSort>("newest");
  const [groupByYear, setGroupByYear] = useState(true);
  const [randomSeed, setRandomSeed] = useState(0);
  useEffect(() => {
    const saved = sessionStorage.getItem("zaratust:archive-options");
    const timer = setTimeout(() => { if (saved) { try { const value = JSON.parse(saved); setSort(value.sort ?? "newest"); setGroupByYear(value.groupByYear ?? true); } catch {} } }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { sessionStorage.setItem("zaratust:archive-options", JSON.stringify({ sort, groupByYear })); }, [sort, groupByYear]);
  const sortedWorks = useMemo(() => {
    if (sort === "random") {
      void randomSeed;
    }

    return sortWorks(works, sort);
  }, [randomSeed, sort, works]);
  const worksByYear = groupWorksByYear(sortedWorks);
  const yearEntries = Object.entries(worksByYear).sort(([leftYear], [rightYear]) => {
    if (sort === "oldest") {
      return Number(leftYear) - Number(rightYear);
    }

    return Number(rightYear) - Number(leftYear);
  });

  const handleSortChange = (nextSort: ArchiveSort) => {
    if (nextSort === "random") {
      setRandomSeed(Math.random());
    }

    setSort(nextSort);
  };

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-base sm:text-xl">ARCHIVE</h1>
        <button
          type="button"
          onClick={() => setGroupByYear((current) => !current)}
          className="text-xs font-gotham-medium opacity-70 transition hover:opacity-100 sm:text-sm"
        >
          {groupByYear ? "GROUPED BY YEAR" : "FLAT GRID"}
        </button>
      </div>

      <ArchiveSortControls sort={sort} onChange={handleSortChange} />

      {groupByYear ? (
        <div className="space-y-14">
          {yearEntries.map(([year, groupedWorks]) => (
            <section key={year}>
              <h2 className="mb-6 flex items-baseline gap-2 text-base sm:text-lg">
                <span>{year}</span>
                <span className="text-[0.55rem] font-gotham-medium opacity-40 sm:text-[0.65rem]">
                  {String(groupedWorks.length).padStart(2, "0")}
                </span>
              </h2>
              <WorkGrid works={groupedWorks} layout="grid" mode="static" dimOnHover />
            </section>
          ))}
        </div>
      ) : (
        <WorkGrid works={sortedWorks} layout="grid" mode="static" dimOnHover />
      )}
    </main>
  );
}
