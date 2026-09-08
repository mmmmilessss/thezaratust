import Link from "next/link";
import portrait from "@/public/images/crystyn-artist.jpg";
import JsonLd from "@/components/JsonLd";
import { ARTIST_DESCRIPTION, ARTIST_ID, ARTIST_URL, SITE_URL, officialProfiles } from "@/lib/artist";
import { createPageMetadata } from "@/lib/metadata";
import { sortWorks } from "@/lib/works";
import { getAllWorks } from "@/lib/works-content";
import { isCrystynRelease, musicEntityId, musicArtists } from "@/lib/music-seo";
import ProgressiveImage from "@/components/ProgressiveImage";

export const metadata = createPageMetadata({
  title: "CRYSTYN — Artist & Producer", absoluteTitle: true,
  description: ARTIST_DESCRIPTION, path: "/crystyn",
  image: { url: "/images/crystyn-artist.jpg", width: portrait.width, height: portrait.height, alt: "CRYSTYN artist portrait" },
});

export default function CrystynPage() {
  const releases = sortWorks(getAllWorks().filter(isCrystynRelease), "newest");
  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "MusicGroup", "@id": ARTIST_ID, name: "CRYSTYN", url: ARTIST_URL,
          description: ARTIST_DESCRIPTION, image: `${SITE_URL}/images/crystyn-artist.jpg`,
          location: { "@type": "Place", name: "Seoul, South Korea" },
          sameAs: officialProfiles.map((profile) => profile.href),
          member: { "@id": `${SITE_URL}/#person` },
          album: releases.filter((work) => work.format !== "single").map((work) => ({ "@id": musicEntityId(work) })),
          track: releases.filter((work) => work.format === "single").map((work) => ({ "@id": musicEntityId(work) })),
        },
        { "@type": "WebPage", "@id": `${ARTIST_URL}#page`, url: ARTIST_URL, name: "CRYSTYN — Artist & Producer",
          mainEntity: { "@id": ARTIST_ID }, isPartOf: { "@id": `${SITE_URL}/#website` } },
      ] }} />
      <div className="grid max-w-5xl gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
        <div>
          <h1 className="mb-5 text-2xl font-gotham-bold sm:text-3xl">CRYSTYN</h1>
          <div className="mb-8 max-w-sm text-xs leading-6 normal-case tracking-[0.02em] sm:text-sm">
            <p>CRYSTYN is an artist and producer based in Seoul, South Korea.</p>
            <p className="mt-4">CRYSTYN — Artist / Producer</p>
            <p>Artist Email: <a href="mailto:mmmmilessss@gmail.com" className="transition-opacity hover:opacity-60">mmmmilessss@gmail.com</a></p>
          </div>
          <ProgressiveImage src={portrait} alt="CRYSTYN artist portrait" sizes="(max-width: 767px) calc(100vw - 3rem), 400px" wrapperClassName="block w-full max-w-sm" className="h-auto w-full" />
        </div>
        <div className="space-y-12">
          <section aria-labelledby="discography">
            <h2 id="discography" className="mb-6 text-sm font-gotham-bold">Discography</h2>
            <ul className="space-y-5">
              {releases.map((work) => <li key={work.slug}>
                <Link href={`/artwork/${encodeURIComponent(work.slug)}`} className="block transition-opacity hover:opacity-60">
                  <h3 className="text-sm">{work.title}</h3>
                  <p className="mt-1 text-[10px] opacity-60">{musicArtists(work)} · {work.format} · {work.year}</p>
                </Link>
              </li>)}
            </ul>
          </section>
          <section aria-labelledby="official-platforms">
            <h2 id="official-platforms" className="mb-5 text-sm font-gotham-bold">Official music &amp; profiles</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-xs">
              {officialProfiles.map((profile) => <li key={profile.label}><a href={profile.href} target="_blank" rel="noreferrer" className="transition-opacity hover:opacity-60">{profile.label}</a></li>)}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
