import Link from "next/link";
import WorkGrid from "@/components/WorkGrid";
import { getAllWorks } from "@/lib/works-content";
import { groupWorksByProject, slugifyProjectName, sortWorks } from "@/lib/works";
import { notFound } from "next/navigation";

type ProjectDetailPageProps = {
  params: Promise<{
    project: string;
  }>;
};

export function generateStaticParams() {
  return Object.keys(groupWorksByProject(getAllWorks())).map((projectName) => ({
    project: slugifyProjectName(projectName),
  }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { project } = await params;
  const projectGroups = Object.entries(groupWorksByProject(getAllWorks()));
  const selectedProjectGroup = projectGroups.find(
    ([projectName]) => slugifyProjectName(projectName) === project,
  );

  if (!selectedProjectGroup) {
    notFound();
  }

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
      <section>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-base font-gotham-bold sm:text-lg">{selectedProjectGroup[0]}</h1>
          <Link href="/projects" className="text-xs font-gotham-medium opacity-70 hover:opacity-100 sm:text-sm">
            ALL PROJECTS
          </Link>
        </div>
        <WorkGrid
          works={sortWorks(selectedProjectGroup[1], "newest")}
          className="lg:grid-cols-3"
        />
      </section>
    </main>
  );
}
