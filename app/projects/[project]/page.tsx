import Link from "next/link";
import WorkGrid from "@/components/WorkGrid";
import { getAllWorks } from "@/lib/works-content";
import { groupWorksByProject, slugifyProjectName, sortWorks } from "@/lib/works";
import { getProjectDetails } from "@/lib/project-details";
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

  const projectName = selectedProjectGroup[0];
  const details = getProjectDetails(projectName);

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
      <section>
        <div className="mb-10 flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="text-2xl tracking-[0.12em] font-gotham-bold sm:text-3xl">{projectName}</h1>
            {details ? (
              <div className="mt-4 space-y-3 font-gotham-medium">
                <p className="text-xs tracking-[0.12em] opacity-60 sm:text-sm">{details.meta}</p>
                <p className="max-w-2xl text-xs leading-6 tracking-[0.06em] opacity-80 sm:text-sm">{details.premise}</p>
              </div>
            ) : null}
          </div>
          <Link href="/projects" className="text-xs font-gotham-medium opacity-70 transition-opacity hover:opacity-40 sm:text-sm">
            ALL PROJECTS
          </Link>
        </div>
        <WorkGrid
          works={sortWorks(selectedProjectGroup[1], "newest")}
          className="lg:grid-cols-3"
          eagerFirst
          dimOnHover
        />
      </section>
    </main>
  );
}
