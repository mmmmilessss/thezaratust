import Link from "next/link";
import { getAllWorks } from "@/lib/works-content";
import { groupWorksByProject, slugifyProjectName } from "@/lib/works";
import { getProjectDetails } from "@/lib/project-details";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Projects",
  description: "Ongoing and completed multidisciplinary projects by ZARATUST.",
  path: "/projects",
});

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
          const details = getProjectDetails(projectName);

          return (
            <Link
              key={projectName}
              href={`/projects/${slugifyProjectName(projectName)}`}
              className="group py-5 transition-opacity hover:opacity-70"
              data-cursor-label="ENTER"
            >
              {details ? (
                <span className="grid max-w-2xl">
                  <span className="[grid-area:1/1] transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
                    <span className="block text-lg tracking-[0.18em] font-gotham-bold sm:text-2xl">
                      {projectName}
                    </span>
                    <span className="mt-3 block text-xs tracking-[0.12em] font-gotham-medium opacity-65 sm:text-sm">
                      {details.meta}
                    </span>
                  </span>
                  <span className="flex [grid-area:1/1] items-center text-xs leading-6 tracking-[0.06em] font-gotham-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:text-sm">
                    {details.premise}
                  </span>
                </span>
              ) : (
                <span className="block text-lg tracking-[0.18em] font-gotham-bold transition-opacity hover:opacity-60 sm:text-2xl">
                  {projectName}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
