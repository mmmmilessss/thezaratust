import { NextResponse } from "next/server";
import { getWorkBySlug } from "@/lib/works-content";
import sharp from "sharp";
import { fetchRemoteImage } from "@/lib/remote-image";

export const runtime = "nodejs";

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
    signal: AbortSignal.timeout(10_000),
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

export async function GET(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const searchParams = new URL(request.url).searchParams;
  if ([...searchParams.keys()].some((key) => key !== "v") || (searchParams.has("v") && searchParams.get("v") !== "3")) {
    return new NextResponse("Not found", { status: 404 });
  }
  const work = getWorkBySlug(slug);
  const soundCloudUrl = work?.links?.soundcloud;

  if (!soundCloudUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const artworkUrl = await getSoundCloudArtworkUrl(soundCloudUrl);

  if (!artworkUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  let remoteImage;
  try {
    remoteImage = await fetchRemoteImage(artworkUrl, {
      allowedHost: (hostname) => hostname === "sndcdn.com" || hostname.endsWith(".sndcdn.com"),
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const imageBuffer = await sharp(remoteImage.buffer, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  const body = imageBuffer.buffer.slice(imageBuffer.byteOffset, imageBuffer.byteOffset + imageBuffer.byteLength) as ArrayBuffer;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
    },
  });
}
