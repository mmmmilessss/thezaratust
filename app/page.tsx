import NavigationLinks from "@/components/NavigationLinks";
import WorkGrid from "@/components/WorkGrid";
import { getLatestWorks } from "@/lib/works-content";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const latestWorks = getLatestWorks(16);

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
            className="flex flex-wrap justify-center gap-6 text-sm tracking-wide sm:gap-12 sm:text-base"
            linkClassName="hover:opacity-60 transition"
          />
        </section>

        <section>
          <div className="mb-12 flex items-center justify-between gap-4">
            <h2 className="text-sm font-gotham-bold sm:text-lg">LATEST WORKS</h2>
            <Link href="/archive" className="ml-auto text-right text-[0.65rem] tracking-wide hover:opacity-60 sm:text-sm">
              VIEW ARCHIVE
            </Link>
          </div>
          <WorkGrid
            works={latestWorks}
            showMetaOnHover
            className="md:grid-cols-3 lg:grid-cols-3"
          />
        </section>
      </div>
    </main>
  );
}
