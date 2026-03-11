import type { ArchiveSort, Work } from "@/types/work";

export function sortWorks(items: Work[], sort: ArchiveSort) {
  const nextItems = [...items];

  if (sort === "random") {
    return nextItems.sort(() => Math.random() - 0.5);
  }

  return nextItems.sort((a, b) => {
    const dateDifference =
      sort === "oldest"
        ? a.sortDateValue - b.sortDateValue
        : b.sortDateValue - a.sortDateValue;

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return a.sortOrder - b.sortOrder;
  });
}

export function groupWorksByYear(items: Work[]) {
  return items.reduce<Record<string, Work[]>>((groups, work) => {
    const year = String(work.year);

    if (!groups[year]) {
      groups[year] = [];
    }

    groups[year].push(work);

    return groups;
  }, {});
}

export function groupWorksByProject(items: Work[]) {
  return items.reduce<Record<string, Work[]>>((groups, work) => {
    if (!work.project) {
      return groups;
    }

    if (!groups[work.project]) {
      groups[work.project] = [];
    }

    groups[work.project].push(work);

    return groups;
  }, {});
}
