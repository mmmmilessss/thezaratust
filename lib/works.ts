import type { ArchiveSort, Work } from "@/types/work";

export function isAssignedProject(project?: string) {
  return Boolean(project && project.toLowerCase() !== "none");
}

export function slugifyProjectName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
    if (!isAssignedProject(work.project)) {
      return groups;
    }

    const projectName = work.project!;

    if (!groups[projectName]) {
      groups[projectName] = [];
    }

    groups[projectName].push(work);

    return groups;
  }, {});
}
