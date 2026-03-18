import { getAllWorkSlugs, getWorkBySlug } from "@/lib/works-content";
import MusicArtworkLaunch from "@/components/MusicArtworkLaunch";
import PhotographyArtworkLayout from "@/components/PhotographyArtworkLayout";
import { isAssignedProject, slugifyProjectName } from "@/lib/works";
import Link from "next/link";
import { notFound } from "next/navigation";

/* eslint-disable @next/next/no-img-element */

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

function getArtworkMetaLabel(displayDate: string) {
  return displayDate;
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

    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundCloudUrl)}`;
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

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  const availableImages = Array.isArray(work.images) && work.images.length > 0 ? work.images : [work.thumbnail];
  const mainImage = availableImages[0] ?? work.thumbnail;
  const detailImages = availableImages.slice(1);
  const availableLinks = platformLabels.filter(([key]) => work.links?.[key]);
  const isMusicWork = work.type === "music" && availableLinks.length > 0;
  const isPhotographyWork = work.type === "photography";
  const isVideoWork = work.type === "video" || work.type === "film";
  const spotifyEmbedUrl = getSpotifyEmbedUrl(work.links?.spotify);
  const soundCloudEmbedUrl = spotifyEmbedUrl ? null : getSoundCloudEmbedUrl(work.links?.soundcloud);
  const youTubeEmbedUrl = getYouTubeEmbedUrl(work.links?.youtube);
  const projectName = isAssignedProject(work.project) ? work.project : null;
  const projectHref = projectName ? `/projects/${slugifyProjectName(projectName)}` : null;
  const baseMetaLabel =
    work.type === "music"
      ? getMusicMetaLabel(work.format, work.displayDate)
      : getArtworkMetaLabel(work.displayDate);
  const metadataLine = (
    <>
      <span>{baseMetaLabel}</span>
      {projectName && projectHref ? (
        <>
          <span> · </span>
          <Link href={projectHref} className="hover:opacity-100">
            {projectName}
          </Link>
        </>
      ) : null}
    </>
  );

  if (isPhotographyWork) {
    return (
      <PhotographyArtworkLayout
        type={work.type}
        title={work.title}
        metadata={metadataLine}
        description={work.description}
        images={availableImages}
      />
    );
  }

  if (isVideoWork) {
    return (
      <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-20">
        <div className="space-y-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.24em] font-gotham-medium opacity-50 sm:text-sm">
              {work.type.toUpperCase()}
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
                height="720"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="block w-full border-0"
              />
            </div>
          ) : null}

          {work.description ? (
            <p className="max-w-3xl whitespace-pre-line text-xs leading-6 font-gotham-medium sm:text-sm sm:leading-7">
              {work.description}
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-20">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-6">
          {isMusicWork ? (
            <MusicArtworkLaunch
              image={mainImage}
              title={work.title}
              links={work.links ?? {}}
            />
          ) : (
            <img
              src={mainImage}
              alt={work.title}
              className="block max-h-[80vh] h-auto w-auto max-w-full"
            />
          )}

          {detailImages.length > 0
            ? detailImages.map((image, index) => (
                <img
                  key={`${work.slug}-${index}`}
                  src={image}
                  alt={`${work.title} image ${index + 2}`}
                  className="block max-h-[80vh] h-auto w-auto max-w-full"
                />
              ))
            : null}
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.24em] font-gotham-medium opacity-50 sm:text-sm">
            {work.type}
          </p>
          <h1 className="mb-4 text-lg font-gotham-bold sm:text-xl">{work.title}</h1>
          <div className="mb-8 text-xs font-gotham-medium opacity-60 sm:text-sm">{metadataLine}</div>
          {work.description ? (
            <p className="max-w-xl whitespace-pre-line text-xs leading-6 font-gotham-medium sm:text-sm sm:leading-7">
              {work.description}
            </p>
          ) : null}

          {spotifyEmbedUrl || soundCloudEmbedUrl ? (
            <div className="mt-10 w-full max-w-xl">
              <iframe
                src={spotifyEmbedUrl ?? soundCloudEmbedUrl ?? undefined}
                title={`${work.title} audio player`}
                width="100%"
                height={spotifyEmbedUrl ? "380" : "166"}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full border-0"
              />
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
                  className="hover:opacity-60"
                >
                  {label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
