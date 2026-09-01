"use client";

import type { ArchiveSort } from "@/types/work";

type ArchiveSortControlsProps = {
  sort: ArchiveSort;
  onChange: (sort: ArchiveSort) => void;
};

const sortOptions: ArchiveSort[] = ["newest", "oldest", "random"];

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
            aria-pressed={isActive}
            className={`text-xs tracking-wide transition-opacity hover:opacity-50 sm:text-sm ${
              isActive ? "text-white" : "text-gray-500"
            }`}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
