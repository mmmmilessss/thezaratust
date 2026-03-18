import Link from "next/link";
import { getAllWorks } from "@/lib/works-content";
import { groupWorksByProject, slugifyProjectName } from "@/lib/works";

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
        {projectGroups.map(([projectName]) => (
          <Link
            key={projectName}
            href={`/projects/${slugifyProjectName(projectName)}`}
            className="py-4 text-lg tracking-[0.18em] font-gotham-bold transition hover:opacity-60 sm:text-2xl"
          >
            {projectName}
          </Link>
        ))}
      </nav>
    </main>
  );
}
