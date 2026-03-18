import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { transliterate } from "transliteration";

const CONTENT_ROOT = path.join(process.cwd(), "content", "works");
const DEFAULT_DATE = "2026.01.01";

function extractYouTubeVideoId(urlString) {
  const url = new URL(urlString);

  if (url.hostname === "youtu.be") {
    return url.pathname.replace(/^\/+/, "");
  }

  if (url.hostname.includes("youtube.com")) {
    return url.searchParams.get("v");
  }

  throw new Error(`Unsupported YouTube URL: ${urlString}`);
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchYouTubeTitle(urlString) {
  const response = await fetch(urlString, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch YouTube page: ${urlString}`);
  }

  const html = await response.text();
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);

  if (ogTitleMatch?.[1]) {
    return decodeHtmlEntities(ogTitleMatch[1]);
  }

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);

  if (titleMatch?.[1]) {
    return decodeHtmlEntities(titleMatch[1].replace(/\s*-\s*YouTube$/i, "").trim());
  }

  throw new Error(`Could not extract YouTube title: ${urlString}`);
}

function slugifyTitle(title) {
  return transliterate(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getUniqueFolderName(baseFolderName) {
  let folderName = baseFolderName;
  let suffix = 2;

  while (existsSync(path.join(CONTENT_ROOT, folderName))) {
    folderName = `${baseFolderName}-${suffix}`;
    suffix += 1;
  }

  return folderName;
}

function buildYaml({ title, youtubeUrl }) {
  const escapedTitle = JSON.stringify(title);

  return [
    "type: video",
    `title: ${escapedTitle}`,
    `date: ${DEFAULT_DATE}`,
    'description: ""',
    "",
    "links:",
    `  youtube: ${youtubeUrl}`,
    "",
  ].join("\n");
}

async function createVideoArtwork(urlString) {
  const youtubeVideoId = extractYouTubeVideoId(urlString);
  const canonicalUrl = `https://youtu.be/${youtubeVideoId}`;
  const title = await fetchYouTubeTitle(canonicalUrl);
  const readableSlug = slugifyTitle(title);
  const baseFolderName = `film-${readableSlug}`;
  const folderName = getUniqueFolderName(baseFolderName);
  const folderPath = path.join(CONTENT_ROOT, folderName);

  mkdirSync(folderPath, { recursive: true });
  writeFileSync(
    path.join(folderPath, "data.yaml"),
    buildYaml({ title, youtubeUrl: canonicalUrl }),
    "utf8",
  );

  return {
    folderName,
    title,
    canonicalUrl,
  };
}

async function main() {
  const urlArguments = process.argv.slice(2);

  if (urlArguments.length === 0) {
    console.error("Usage: node scripts/generate-video-artworks.mjs <youtube-url> [...]");
    process.exit(1);
  }

  if (!existsSync(CONTENT_ROOT)) {
    mkdirSync(CONTENT_ROOT, { recursive: true });
  }

  const results = [];

  for (const urlString of urlArguments) {
    const result = await createVideoArtwork(urlString);
    results.push(result);
  }

  for (const result of results) {
    console.log(`${result.folderName}: ${result.title}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
