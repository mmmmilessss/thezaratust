import { NextResponse } from "next/server";
import { getWorkBySlug } from "@/lib/works-content";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

type SoundCloudOEmbedResponse = {
  thumbnail_url?: string;
};

function getOriginalArtworkUrl(thumbnailUrl: string) {
  return thumbnailUrl.replace(/-t\d+x\d+(?=\.[a-z]+$)/i, "-original");
}

async function getSoundCloudArtworkUrl(soundCloudUrl: string) {
  const oEmbedUrl = new URL("https://soundcloud.com/oembed");
  oEmbedUrl.searchParams.set("format", "json");
  oEmbedUrl.searchParams.set("url", soundCloudUrl);

  const response = await fetch(oEmbedUrl, {
    next: {
      revalidate: 86400,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as SoundCloudOEmbedResponse;
  return data.thumbnail_url
    ? getOriginalArtworkUrl(data.thumbnail_url)
    : null;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  const soundCloudUrl = work?.links?.soundcloud;

  if (!soundCloudUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const artworkUrl = await getSoundCloudArtworkUrl(soundCloudUrl);

  if (!artworkUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const imageResponse = await fetch(artworkUrl, {
    cache: "no-store",
  });

  if (!imageResponse.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg";
  const imageBuffer = await imageResponse.arrayBuffer();

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
}
