import Link from "next/link";
import WorkGrid from "@/components/WorkGrid";
import { getAllWorks } from "@/lib/works-content";
import { groupWorksByProject, sortWorks } from "@/lib/works";

type ProjectsPageProps = {
  searchParams: Promise<{
    project?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { project } = await searchParams;
  const projectGroups = Object.entries(groupWorksByProject(getAllWorks())).sort(
    ([left], [right]) => left.localeCompare(right),
  );
  const selectedProjectGroup = projectGroups.find(([projectName]) => projectName === project);

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
      <section className="mb-10 max-w-3xl">
        <h1 className="text-xl sm:text-2xl">PROJECTS</h1>
      </section>

      {selectedProjectGroup ? (
        <section>
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-base font-gotham-bold sm:text-lg">{selectedProjectGroup[0]}</h2>
            <Link href="/projects" className="text-xs font-gotham-medium opacity-70 hover:opacity-100 sm:text-sm">
              ALL PROJECTS
            </Link>
          </div>
          <WorkGrid
            works={sortWorks(selectedProjectGroup[1], "newest")}
            className="lg:grid-cols-3"
          />
        </section>
      ) : (
        <nav className="flex max-w-4xl flex-col">
          {projectGroups.map(([projectName]) => (
            <Link
              key={projectName}
              href={`/projects?project=${encodeURIComponent(projectName)}`}
              className="py-4 text-lg tracking-[0.18em] font-gotham-bold transition hover:opacity-60 sm:text-2xl"
            >
              {projectName}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
