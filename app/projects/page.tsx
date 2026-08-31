import Link from "next/link";
import { getAllWorks } from "@/lib/works-content";
import { groupWorksByProject, slugifyProjectName } from "@/lib/works";

const projectDetails: Record<string, { meta: string; premise: string }> = {
  ACROBATIC: {
    meta: "ONGOING SERIES · 2026—",
    premise: "An ongoing portrait study of movement, tension, and the body in space.",
  },
};

export default function ProjectsPage() {
  const projectGroups = Object.entries(groupWorksByProject(getAllWorks())).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
      <section className="mb-10 max-w-3xl">
        <h1 className="text-xl sm:text-2xl">PROJECTS</h1>
      </section>

      <nav className="flex max-w-4xl flex-col">
        {projectGroups.map(([projectName]) => {
          const details = projectDetails[projectName];

          return (
            <Link
              key={projectName}
              href={`/projects/${slugifyProjectName(projectName)}`}
              className="group py-5 transition hover:opacity-60"
            >
              <span className="block text-lg tracking-[0.18em] font-gotham-bold sm:text-2xl">
                {projectName}
              </span>
              {details ? (
                <span className="mt-3 block max-w-xl space-y-1.5">
                  <span className="block text-[0.6rem] tracking-[0.14em] font-gotham-medium opacity-60 sm:text-[0.7rem]">
                    {details.meta}
                  </span>
                  <span className="block text-[0.65rem] leading-5 tracking-[0.02em] font-gotham-medium normal-case opacity-75 sm:text-xs">
                    {details.premise}
                  </span>
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
