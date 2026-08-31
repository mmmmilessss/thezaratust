import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getWorkBySlug, getWorkFolderNameBySlug } from "@/lib/works-content";

export const runtime = "nodejs";

type RouteProps = { params: Promise<{ slug: string }> };

async function getThumbnailBuffer(request: Request, thumbnail: string, workSlug: string) {
  if (thumbnail.startsWith("/works-media/")) {
    const relativePath = decodeURIComponent(thumbnail.slice("/works-media/".length));
    const [, ...fileParts] = relativePath.split("/");
    const folderName = getWorkFolderNameBySlug(workSlug);
    if (!folderName) throw new Error("Artwork folder not found");
    return readFile(path.join(process.cwd(), "content", "works", folderName, ...fileParts)).catch(async () => {
      const response = await fetch(new URL(thumbnail, request.url));
      if (!response.ok) throw new Error("Thumbnail not found");
      return Buffer.from(await response.arrayBuffer());
    });
  }

  const response = await fetch(new URL(thumbnail, request.url));
  if (!response.ok) throw new Error("Thumbnail not found");
  return Buffer.from(await response.arrayBuffer());
}

export async function GET(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) return new NextResponse("Not found", { status: 404 });

  try {
    const source = await getThumbnailBuffer(request, work.thumbnail, work.slug);
    const image = await sharp(source)
      .rotate()
      .resize(1200, 630, { fit: "cover", position: "centre" })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    const body = image.buffer.slice(image.byteOffset, image.byteOffset + image.byteLength) as ArrayBuffer;
    return new NextResponse(body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
