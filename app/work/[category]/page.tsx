import WorkGrid from "@/components/WorkGrid";
import { getWorksByCategory } from "@/lib/works-content";
import { WORK_CATEGORIES, type WorkCategory } from "@/types/work";
import { createPageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";

type WorkCategoryPageProps = {
  params: Promise<{ category: string }>;
};

function isWorkCategory(value: string): value is WorkCategory {
  return WORK_CATEGORIES.includes(value as WorkCategory);
}

const categoryDescriptions: Record<WorkCategory, string> = {
  music: "Music released by CRYSTYN.",
  film: "Short films and moving-image works by PARK GEON WOO.",
  photography: "Photography works and ongoing visual studies by CRYSTYN.",
  video: "Video works, listening experiences, and moving-image projects by CRYSTYN.",
};

export async function generateMetadata({ params }: WorkCategoryPageProps) {
  const { category } = await params;

  if (!isWorkCategory(category)) return {};

  const title = category.charAt(0).toUpperCase() + category.slice(1);
  return createPageMetadata({
    title,
    description: categoryDescriptions[category],
    path: `/work/${category}`,
  });
}

export function generateStaticParams() {
  return WORK_CATEGORIES.map((category) => ({ category }));
}

export default async function WorkCategoryPage({
  params,
}: WorkCategoryPageProps) {
  const { category } = await params;

  if (!isWorkCategory(category)) {
    notFound();
  }

  const works = getWorksByCategory(category);

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20">
      <section className="mb-10">
        <h1 className="text-base sm:text-xl">{category.toUpperCase()}</h1>
      </section>

      <WorkGrid
        works={works}
        layout={category === "video" ? "grid" : "masonry"}
        className="lg:grid-cols-3"
        eagerFirst
        dimOnHover
        showCategory={false}
      />
    </main>
  );
}
