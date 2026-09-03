import {
  getAllWorkSlugs,
  getWorkBySlug,
  getWorksByCategory,
} from "@/lib/works-content";
import ArtworkNavigation from "@/components/ArtworkNavigation";
import MusicArtworkLaunch from "@/components/MusicArtworkLaunch";
import PhotographyArtworkLayout from "@/components/PhotographyArtworkLayout";
import { isAssignedProject, slugifyProjectName } from "@/lib/works";
import Link from "next/link";
import Image from "next/image";
import AudioEmbed from "@/components/AudioEmbed";
import MusicReactive from "@/components/MusicReactive";
import TrackCredits from "@/components/TrackCredits";
import { getTrackCredits } from "@/lib/track-credits";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ArtworkPageProps = {
  params: Promise<{ slug: string }>;
};

const platformLabels = [
  ["spotify", "Spotify"],
  ["apple", "Apple Music"],
  ["youtube", "YouTube"],
  ["soundcloud", "SoundCloud"],
] as const;

function getMusicMetaLabel(format: string | undefined, displayDate: string) {
  return format ? `${format.toUpperCase()} · ${displayDate}` : displayDate;
}

function getArtworkMetaLabel(work: { displayDate: string; displayType?: string; year: number; duration?: string }) {
  if (!work.displayType) return work.displayDate;
  return [work.displayType, String(work.year), work.duration].filter(Boolean).join(" · ");
}

function getSpotifyEmbedUrl(spotifyUrl?: string) {
  if (!spotifyUrl) {
    return null;
  }

  try {
    const url = new URL(spotifyUrl);

    if (!url.hostname.includes("spotify.com")) {
      return null;
    }

    const [, resourceType, resourceId] = url.pathname.split("/");

    if (!resourceType || !resourceId) {
      return null;
    }

    return `https://open.spotify.com/embed/${resourceType}/${resourceId}`;
  } catch {
    return null;
  }
}

function getSoundCloudEmbedUrl(soundCloudUrl?: string) {
  if (!soundCloudUrl) {
    return null;
  }

  try {
    const url = new URL(soundCloudUrl);

    if (!url.hostname.includes("soundcloud.com")) {
      return null;
    }

    const embedUrl = new URL("https://w.soundcloud.com/player/");
    embedUrl.searchParams.set("url", soundCloudUrl);
    embedUrl.searchParams.set("color", "#121212");

    return embedUrl.toString();
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(youtubeUrl?: string) {
  if (!youtubeUrl) {
    return null;
  }

  try {
    const url = new URL(youtubeUrl);
    let videoId: string | null = null;

    if (url.hostname === "youtu.be") {
      videoId = url.pathname.replace(/^\/+/, "") || null;
    } else if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/watch")) {
        videoId = url.searchParams.get("v");
      } else if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/")[2] ?? null;
      } else if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2] ?? null;
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?vq=hd1080` : null;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return getAllWorkSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    return {};
  }

  const title = `${work.title} — ZARATUST`;
  const creator = work.type === "film" ? "PARK GEON WOO" : "CRYSTYN";
  const description =
    work.description || `${work.type.toUpperCase()} by ${creator}.`;

  return {
    title: work.title,
    description,
    alternates: {
      canonical: `/artwork/${work.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/artwork/${work.slug}`,
      images: [
        {
          url: `/artwork-og/${work.slug}`,
          width: 1200,
          height: 630,
          alt: work.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/artwork-og/${work.slug}`],
    },
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  const availableImages = Array.isArray(work.images) && work.images.length > 0 ? work.images : [{ src: work.thumbnail, width: work.thumbnailWidth, height: work.thumbnailHeight }];
  const mainImage = availableImages[0] ?? { src: work.thumbnail, width: work.thumbnailWidth, height: work.thumbnailHeight };
  const detailImages = availableImages.slice(1);
  const availableLinks = platformLabels.filter(([key]) => work.links?.[key]);
  const isMusicWork = work.type === "music" && availableLinks.length > 0;
  const isPhotographyWork = work.type === "photography";
  const isVideoWork = work.type === "video" || work.type === "film";
  const spotifyEmbedUrl = getSpotifyEmbedUrl(work.links?.spotify);
  const soundCloudEmbedUrl = spotifyEmbedUrl ? null : getSoundCloudEmbedUrl(work.links?.soundcloud);
  const youTubeEmbedUrl = getYouTubeEmbedUrl(work.links?.youtube);
  const creditRows = work.credits
    ? work.credits.split("\n").filter(Boolean).map((credit) => {
        const [role, ...valueParts] = credit.split("|");
        return { role: role.trim(), value: valueParts.join("|").trim() };
      })
    : [];
  const trackCredits = getTrackCredits(work.slug);
  const projectName = isAssignedProject(work.project) ? work.project : null;
  const projectHref = projectName ? `/projects/${slugifyProjectName(projectName)}` : null;
  const categoryWorks = getWorksByCategory(work.type);
  const categoryIndex = categoryWorks.findIndex(
    (categoryWork) => categoryWork.slug === work.slug,
  );
  const previousWork =
    categoryIndex > 0 ? categoryWorks[categoryIndex - 1] : undefined;
  const nextWork =
    categoryIndex >= 0 && categoryIndex < categoryWorks.length - 1
      ? categoryWorks[categoryIndex + 1]
      : undefined;
  const artworkNavigation = (
    <ArtworkNavigation previous={previousWork} next={nextWork} />
  );
  const categoryLink = (
    <Link
      href={`/work/${work.type}`}
      className="transition-opacity hover:opacity-60"
    >
      {work.type.toUpperCase()}
    </Link>
  );
  const baseMetaLabel =
    work.type === "music"
      ? getMusicMetaLabel(work.format, work.displayDate)
      : getArtworkMetaLabel(work);
  const metadataLine = (
    <>
      <span>{baseMetaLabel}</span>
      {projectName && projectHref ? (
        <>
          <span> · </span>
          <Link href={projectHref} className="transition-opacity hover:opacity-50">
            {projectName}
          </Link>
        </>
      ) : null}
    </>
  );

  if (isPhotographyWork) {
    return (
      <PhotographyArtworkLayout
        category={categoryLink}
        title={work.title}
        metadata={metadataLine}
        description={work.description}
        images={availableImages}
        navigation={artworkNavigation}
      />
    );
  }

  if (isVideoWork) {
    return (
      <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-20">
        <div className="space-y-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.24em] font-gotham-medium opacity-50 sm:text-sm">
              {categoryLink}
            </p>
            <h1 className="mb-4 text-lg font-gotham-bold sm:text-xl">{work.title}</h1>
            <div className="text-xs font-gotham-medium opacity-60 sm:text-sm">{metadataLine}</div>
          </div>

          {youTubeEmbedUrl ? (
            <div className="w-full">
              <iframe
                src={youTubeEmbedUrl}
                title={`${work.title} video player`}
                width="100%"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="block aspect-video w-full border-0"
              />
            </div>
          ) : null}

          {creditRows.length ? (
            <section className="max-w-3xl" aria-labelledby="credits-heading">
              <h2 id="credits-heading" className="mb-6 text-xs tracking-[0.2em] font-gotham-bold sm:text-sm">
                CREDITS
              </h2>
              <dl className="grid grid-cols-[6.5rem_1fr] gap-x-6 gap-y-3 text-xs leading-5 font-gotham-medium sm:grid-cols-[8rem_1fr] sm:text-sm sm:leading-6">
                {creditRows.map((credit, index) => (
                  <div key={`${credit.role}-${credit.value}-${index}`} className="contents">
                    <dt className="opacity-50">{credit.role}</dt>
                    <dd>{credit.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {work.description ? (
            <p className="max-w-3xl whitespace-pre-line text-xs leading-6 font-gotham-medium sm:text-sm sm:leading-7">
              {work.description}
            </p>
          ) : null}
        </div>
        {artworkNavigation}
      </main>
    );
  }

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-20">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-6">
          {isMusicWork ? (
            <MusicArtworkLaunch
              image={mainImage.src}
              imageWidth={work.thumbnailWidth}
              imageHeight={work.thumbnailHeight}
              title={work.title}
              links={work.links ?? {}}
              audioEnvelope={work.audioEnvelope}
            />
          ) : (
            <Image
              src={mainImage.src}
              alt={work.title}
              width={mainImage.width}
              height={mainImage.height}
              quality={88}
              sizes="(max-width: 767px) calc(100vw - 3rem), 50vw"
              loading="eager"
              className="block max-h-[80vh] h-auto w-auto max-w-full"
            />
          )}

          {detailImages.length > 0
              ? detailImages.map((image, index) => (
                <Image
                  key={image.src}
                  src={image.src}
                  alt={`${work.title} image ${index + 2}`}
                  width={image.width}
                  height={image.height}
                  quality={88}
                  sizes="(max-width: 767px) calc(100vw - 3rem), 50vw"
                  loading="lazy"
                  className="block max-h-[80vh] h-auto w-auto max-w-full"
                />
              ))
            : null}
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.24em] font-gotham-medium opacity-50 sm:text-sm">
            {categoryLink}
          </p>
          {isMusicWork ? <MusicReactive envelope={work.audioEnvelope} colorSource={mainImage.src} className="mb-4"><h1 className="text-lg font-gotham-bold sm:text-xl">{work.title}</h1></MusicReactive> : <h1 className="mb-4 text-lg font-gotham-bold sm:text-xl">{work.title}</h1>}
          <div className="mb-8 text-xs font-gotham-medium opacity-60 sm:text-sm">{metadataLine}</div>
          {work.description ? (
            <p className="max-w-xl whitespace-pre-line text-xs leading-6 font-gotham-medium sm:text-sm sm:leading-7">
              {work.description}
            </p>
          ) : null}

          {spotifyEmbedUrl || soundCloudEmbedUrl ? (
            <div className="mt-10 w-full max-w-xl">
              {spotifyEmbedUrl ? <AudioEmbed platform="spotify" src={spotifyEmbedUrl} uri={spotifyEmbedUrl.replace("https://open.spotify.com/embed/", "spotify:").replaceAll("/", ":")} title={work.title} /> : <AudioEmbed platform="soundcloud" src={soundCloudEmbedUrl!} title={work.title} />}
            </div>
          ) : null}

          {availableLinks.length && !isMusicWork ? (
            <div className="mt-10 flex flex-col gap-3 text-xs font-gotham-medium sm:flex-row sm:flex-wrap sm:gap-6 sm:text-sm">
              {availableLinks.map(([key, label]) => (
                <a
                  key={key}
                  href={work.links?.[key]}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-opacity hover:opacity-60"
                >
                  {label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <TrackCredits
        tracks={trackCredits}
        defaultCredit={work.type === "music" ? {
          role: "Written, produced, performed & engineered by",
          name: "CRYSTYN",
        } : undefined}
      />
      {artworkNavigation}
    </main>
  );
}
