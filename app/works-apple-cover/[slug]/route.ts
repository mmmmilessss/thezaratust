import { NextResponse } from "next/server";
import { getWorkBySlug } from "@/lib/works-content";

type RouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

type AppleLookupResponse = {
  results?: Array<{
    artworkUrl100?: string;
    artworkUrl512?: string;
    artworkUrl600?: string;
  }>;
};

function extractAppleMusicId(appleMusicUrl: string) {
  try {
    const url = new URL(appleMusicUrl);

    if (!url.hostname.includes("music.apple.com")) {
      return null;
    }

    const trackId = url.searchParams.get("i");

    if (trackId) {
      return trackId;
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments.at(-1);

    return lastSegment?.match(/^\d+$/)?.[0] ?? null;
  } catch {
    return null;
  }
}

function getHighResolutionArtworkUrl(artworkUrl: string) {
  return artworkUrl.replace(/\/\d+x\d+bb(?=\.)/, "/3000x3000bb");
}

async function getAppleArtworkUrl(appleMusicUrl: string) {
  const appleMusicId = extractAppleMusicId(appleMusicUrl);

  if (!appleMusicId) {
    return null;
  }

  const lookupUrl = new URL("https://itunes.apple.com/lookup");
  lookupUrl.searchParams.set("id", appleMusicId);

  const response = await fetch(lookupUrl, {
    next: {
      revalidate: 86400,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AppleLookupResponse;
  const artworkUrl =
    data.results?.[0]?.artworkUrl600 ??
    data.results?.[0]?.artworkUrl512 ??
    data.results?.[0]?.artworkUrl100;

  return artworkUrl ? getHighResolutionArtworkUrl(artworkUrl) : null;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  const appleMusicUrl = work?.links?.apple;

  if (!appleMusicUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const artworkUrl = await getAppleArtworkUrl(appleMusicUrl);

  if (!artworkUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const imageResponse = await fetch(artworkUrl, {
    next: {
      revalidate: 86400,
    },
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
