import { NextResponse } from "next/server";

type RouteProps = {
  params: Promise<{
    videoId: string;
  }>;
};

async function fetchThumbnail(url: string) {
  const response = await fetch(url, {
    next: {
      revalidate: 86400,
    },
  });

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    return null;
  }

  const contentLength = Number(response.headers.get("content-length") ?? "0");

  // YouTube's unavailable maxres thumbnail is often a tiny placeholder image.
  if (contentLength > 0 && contentLength < 1200) {
    return null;
  }

  return response;
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { videoId } = await params;
  const maxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const imageResponse =
    (await fetchThumbnail(maxResUrl)) ??
    (await fetchThumbnail(hqUrl));

  if (!imageResponse) {
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
