import WorkGrid from "@/components/WorkGrid";
import { getWorksByCategory } from "@/lib/works-content";
import { WORK_CATEGORIES, type WorkCategory } from "@/types/work";
import { notFound } from "next/navigation";

type WorkCategoryPageProps = {
  params: Promise<{ category: string }>;
};

function isWorkCategory(value: string): value is WorkCategory {
  return WORK_CATEGORIES.includes(value as WorkCategory);
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

      <WorkGrid works={works} className="lg:grid-cols-3" />
    </main>
  );
}
