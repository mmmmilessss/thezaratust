"use client";

import type { ArchiveSort } from "@/types/work";

type ArchiveSortControlsProps = {
  sort: ArchiveSort;
  onChange: (sort: ArchiveSort) => void;
};

const sortOptions: ArchiveSort[] = ["random", "newest", "oldest"];

export default function ArchiveSortControls({
  sort,
  onChange,
}: ArchiveSortControlsProps) {
  return (
    <div className="mb-10 flex flex-wrap gap-3 sm:gap-4">
      {sortOptions.map((option) => {
        const isActive = option === sort;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`text-xs tracking-wide transition sm:text-sm ${
              isActive ? "text-gray-400" : "text-gray-400 hover:text-white"
            }`}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
