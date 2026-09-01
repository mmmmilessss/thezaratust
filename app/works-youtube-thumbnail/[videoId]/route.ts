import { NextResponse } from "next/server";
import { fetchRemoteImage } from "@/lib/remote-image";

type RouteProps = {
  params: Promise<{
    videoId: string;
  }>;
};

async function fetchThumbnail(url: string) {
  try {
    const image = await fetchRemoteImage(url, {
      allowedHost: (hostname) => hostname === "img.youtube.com",
      revalidate: 86400,
    });
    // YouTube's unavailable maxres thumbnail is often a tiny placeholder image.
    return image.buffer.byteLength < 1200 ? null : image;
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: RouteProps) {
  const { videoId } = await params;
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const searchParams = new URL(request.url).searchParams;
  if ([...searchParams.keys()].some((key) => key !== "frame") || searchParams.getAll("frame").length > 1) {
    return new NextResponse("Not found", { status: 404 });
  }
  const requestedFrame = searchParams.get("frame");
  const frame = requestedFrame !== null && /^[0-3]$/.test(requestedFrame) ? requestedFrame : null;
  if (requestedFrame !== null && frame === null) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (frame !== null) {
    const response = await fetchThumbnail(`https://img.youtube.com/vi/${videoId}/${frame}.jpg`);
    if (response) return new NextResponse(response.buffer, { headers: { "Content-Type": response.contentType, "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400" } });
  }
  const maxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const imageResponse =
    (await fetchThumbnail(maxResUrl)) ??
    (await fetchThumbnail(hqUrl));

  if (!imageResponse) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(imageResponse.buffer, {
    headers: {
      "Content-Type": imageResponse.contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
}
