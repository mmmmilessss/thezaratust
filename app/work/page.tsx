import Link from "next/link";
import { WORK_CATEGORIES } from "@/types/work";

export default function WorkPage() {
  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20">
      <section className="mb-10">
        <h1 className="mb-3 text-sm font-gotham-medium sm:text-lg">WORK</h1>
      </section>

      <section className="flex max-w-4xl flex-col">
        {WORK_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/work/${category}`}
            className="py-4 text-lg tracking-[0.18em] font-gotham-bold transition hover:opacity-60 sm:text-2xl"
          >
            {category.toUpperCase()}
          </Link>
        ))}
      </section>
    </main>
  );
}
