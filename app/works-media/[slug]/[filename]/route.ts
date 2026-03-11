import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getWorkFolderNameBySlug } from "@/lib/works-content";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type RouteProps = {
  params: Promise<{
    slug: string;
    filename: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug, filename } = await params;
  const folderName = getWorkFolderNameBySlug(slug);

  if (!folderName) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "content", "works", folderName, filename);
  const extension = path.extname(filename).toLowerCase();

  if (!existsSync(filePath) || !MIME_TYPES[extension]) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = readFileSync(filePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": MIME_TYPES[extension],
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
