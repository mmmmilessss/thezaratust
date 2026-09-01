import NavigationLinks from "@/components/NavigationLinks";
import WorkGrid from "@/components/WorkGrid";
import { getAllWorks } from "@/lib/works-content";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "ZARATUST — A Study of Aesthetics",
  description: "ZARATUST is the multidisciplinary creative practice of PARK GEON WOO, spanning sound, moving image, photography, and related forms.",
  path: "/",
  absoluteTitle: true,
});

const SELECTED_WORK_SLUGS = [
  "tiny-thoughts-club",
  "film-the-free-trial",
  "film-thuglife",
  "acrobatic-001",
  "light003",
  "winter-vacation",
] as const;

export default function HomePage() {
  const allWorks = getAllWorks();
  const selectedWorks = SELECTED_WORK_SLUGS.flatMap((slug) => {
    const work = allWorks.find((item) => item.slug === slug);
    return work ? [work] : [];
  });

  return (
    <main>
      <section id="home-hero" className="relative -mt-24 sm:-mt-28">
        <div className="pointer-events-none absolute right-[3%] top-[75%] z-20 hidden -translate-y-1/2 md:block">
          <Image
            src="/logo.png"
            alt="thezaratust"
            width={320}
            height={128}
            priority
            className="h-auto w-[27rem] object-contain brightness-0 invert [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.5))] lg:w-[30rem]"
          />
        </div>

        <div className="hidden md:block">
          <Image
            src="/images/hero-desktop.jpg"
            alt="thezaratust hero"
            width={1800}
            height={1200}
            priority
            className="h-auto w-full"
          />
        </div>
        <div className="md:hidden">
          <Image
            src="/images/hero-mobile.jpg"
            alt="thezaratust hero"
            width={1400}
            height={1000}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>

      <div className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
        <section id="home-navigation" className="mb-24 lg:mb-32">
          <NavigationLinks
            className="grid grid-cols-6 items-center gap-x-4 gap-y-6 text-center text-sm tracking-wide [&_a:nth-child(-n+3)]:col-span-2 [&_a:nth-child(n+4)]:col-span-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-12 sm:text-base"
            linkClassName="hover:opacity-60 transition"
          />
        </section>

        <section>
          <div className="mb-12">
            <h2 className="text-sm font-gotham-bold sm:text-lg">SELECTED WORKS</h2>
          </div>
          <WorkGrid
            works={selectedWorks}
            mode="hover"
            className="md:grid-cols-3 lg:grid-cols-3"
          />
          <div className="mt-10 flex justify-end">
            <Link href="/archive" className="inline-flex items-center gap-2 text-[0.65rem] tracking-wide transition hover:opacity-60 sm:text-sm">
              VIEW FULL ARCHIVE
              <ArrowRight aria-hidden="true" size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
