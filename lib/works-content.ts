import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  WORK_CATEGORIES,
  type MusicFormat,
  type Work,
  type WorkCategory,
  type WorkLinks,
} from "@/types/work";
import { sortWorks } from "@/lib/works";

const CONTENT_ROOT = path.join(process.cwd(), "content", "works");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const COVER_FILE_NAMES = ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"] as const;
const MONTH_ABBREVIATIONS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function isWorkCategory(value: string): value is WorkCategory {
  return WORK_CATEGORIES.includes(value as WorkCategory);
}

function isMusicFormat(value: string): value is MusicFormat {
  return value === "album" || value === "ep" || value === "single";
}

function parseScalar(rawValue: string) {
  const value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseArtworkDate(rawDate: string) {
  const match = rawDate.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);

  if (!match) {
    throw new Error(`Invalid artwork date "${rawDate}". Expected YYYY.MM.DD.`);
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const utcTime = Date.UTC(year, month - 1, day);
  const parsedDate = new Date(utcTime);

  if (
    Number.isNaN(utcTime) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw new Error(`Invalid artwork date "${rawDate}".`);
  }

  return {
    year,
    month,
    day,
    sortDateValue: utcTime,
    displayDate: `${MONTH_ABBREVIATIONS[month - 1]} ${year}`,
  };
}

function getArtworkImageFileNames(folderPath: string) {
  return readdirSync(folderPath)
    .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((left, right) => {
      const leftCoverIndex = COVER_FILE_NAMES.indexOf(left.toLowerCase() as (typeof COVER_FILE_NAMES)[number]);
      const rightCoverIndex = COVER_FILE_NAMES.indexOf(right.toLowerCase() as (typeof COVER_FILE_NAMES)[number]);

      if (leftCoverIndex !== -1 || rightCoverIndex !== -1) {
        if (leftCoverIndex === -1) {
          return 1;
        }

        if (rightCoverIndex === -1) {
          return -1;
        }

        return leftCoverIndex - rightCoverIndex;
      }

      return left.localeCompare(right);
    });
}

function getLocalCoverFileName(files: string[]) {
  return COVER_FILE_NAMES.map((coverFileName) =>
    files.find((fileName) => fileName.toLowerCase() === coverFileName),
  ).find(Boolean);
}

function parseYamlFile(filePath: string) {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const result: {
    type?: string;
    format?: MusicFormat;
    title?: string;
    date?: string;
    project?: string;
    description?: string;
    links?: WorkLinks;
  } = {};
  let currentSection: "links" | "description" | null = null;
  let descriptionIndent: number | null = null;
  const descriptionLines: string[] = [];

  for (const rawLine of lines) {
    const indent = rawLine.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = rawLine.trim();

    if (currentSection === "description") {
      if (!trimmed) {
        descriptionLines.push("");
        continue;
      }

      if (indent > 0) {
        const nextIndent: number = descriptionIndent ?? indent;
        descriptionIndent = nextIndent;
        descriptionLines.push(rawLine.slice(nextIndent));
        continue;
      }

      result.description = descriptionLines.join("\n");
      currentSection = null;
      descriptionIndent = null;
    }

    if (!trimmed) {
      continue;
    }

    if (indent === 0) {
      if (trimmed.endsWith(":")) {
        const key = trimmed.slice(0, -1);

        if (key === "links") {
          result.links = {};
          currentSection = "links";
          continue;
        }

        if (key === "tracklist") {
          continue;
        }
      }

      const separatorIndex = trimmed.indexOf(":");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = parseScalar(trimmed.slice(separatorIndex + 1));

      if (key === "project") {
        result.project = value || undefined;
        currentSection = null;
        continue;
      }

      if (key === "format" && isMusicFormat(value)) {
        result.format = value;
        currentSection = null;
        continue;
      }

      if (key === "description" && value === "|") {
        currentSection = "description";
        descriptionLines.length = 0;
        descriptionIndent = null;
        result.description = "";
        continue;
      }

      if (key === "type" || key === "title" || key === "date" || key === "description") {
        result[key] = value;
        currentSection = null;
      }

      continue;
    }

    if (currentSection === "links") {
      const separatorIndex = trimmed.indexOf(":");

      if (separatorIndex === -1 || !result.links) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim() as keyof WorkLinks;
      const value = parseScalar(trimmed.slice(separatorIndex + 1));

      if (value) {
        result.links[key] = value;
      }

      continue;
    }
  }

  if (currentSection === "description") {
    result.description = descriptionLines.join("\n");
  }

  return result;
}

function getArtworkImages(slug: string, files: string[]) {
  return files.map((fileName) => `/works-media/${slug}/${fileName}`);
}

function getYouTubeVideoId(youtubeUrl?: string) {
  if (!youtubeUrl) {
    return null;
  }

  try {
    const url = new URL(youtubeUrl);

    if (url.hostname === "youtu.be") {
      return url.pathname.replace(/^\/+/, "") || null;
    }

    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function getArtworkThumbnail({
  type,
  slug,
  imageFiles,
  appleMusicUrl,
  soundCloudUrl,
  youtubeUrl,
}: {
  type: WorkCategory;
  slug: string;
  imageFiles: string[];
  appleMusicUrl?: string;
  soundCloudUrl?: string;
  youtubeUrl?: string;
}) {
  const localCoverFileName = getLocalCoverFileName(imageFiles);

  if (localCoverFileName) {
    return `/works-media/${slug}/${localCoverFileName}`;
  }

  if (appleMusicUrl) {
    return `/works-apple-cover/${slug}`;
  }

  if (soundCloudUrl) {
    return `/works-soundcloud-cover/${slug}`;
  }

  if (type === "video" || type === "film") {
    const youTubeVideoId = getYouTubeVideoId(youtubeUrl);

    if (youTubeVideoId) {
      return `/works-youtube-thumbnail/${youTubeVideoId}`;
    }
  }

  const firstImage = imageFiles[0];

  return firstImage ? `/works-media/${slug}/${firstImage}` : undefined;
}

function parseWorkFolder(folderName: string, sortOrder: number) {
  const slug = normalizeSlug(folderName);
  const folderPath = path.join(CONTENT_ROOT, folderName);
  const dataPath = path.join(folderPath, "data.yaml");
  const parsed = parseYamlFile(dataPath);

  if (!parsed.title || !parsed.type || !parsed.date || !isWorkCategory(parsed.type)) {
    throw new Error(`Invalid data.yaml for artwork "${slug}".`);
  }

  const imageFiles = getArtworkImageFileNames(folderPath);
  const images = getArtworkImages(slug, imageFiles);
  const thumbnail = getArtworkThumbnail({
    type: parsed.type,
    slug,
    imageFiles,
    appleMusicUrl: parsed.links?.apple,
    soundCloudUrl: parsed.links?.soundcloud,
    youtubeUrl: parsed.links?.youtube,
  });

  if (!thumbnail && parsed.type !== "video" && parsed.type !== "film") {
    throw new Error(`Artwork "${slug}" must contain a cover image.`);
  }

  const parsedDate = parseArtworkDate(parsed.date);

  return {
    slug,
    title: parsed.title,
    type: parsed.type,
    format: parsed.format,
    date: String(parsed.date),
    displayDate: parsedDate.displayDate,
    year: parsedDate.year,
    project: parsed.project,
    description: parsed.description,
    thumbnail: thumbnail ?? "",
    images,
    links: parsed.links,
    sortDateValue: parsedDate.sortDateValue,
    sortOrder,
  } satisfies Work;
}

export function getAllWorks() {
  if (!existsSync(CONTENT_ROOT)) {
    return [];
  }

  return readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry, index) => parseWorkFolder(entry.name, index));
}

export function getWorkFolderNameBySlug(slug: string) {
  if (!existsSync(CONTENT_ROOT)) {
    return null;
  }

  const match = readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .find((entry) => normalizeSlug(entry.name) === slug);

  return match?.name ?? null;
}

export function getAllWorkSlugs() {
  return getAllWorks().map((work) => work.slug);
}

export function getWorkBySlug(slug: string) {
  return getAllWorks().find((work) => work.slug === slug);
}

export function getLatestWorks(limit = 6) {
  return sortWorks(getAllWorks(), "newest").slice(0, limit);
}

export function getWorksByCategory(category: WorkCategory) {
  return sortWorks(
    getAllWorks().filter((work) => work.type === category),
    "newest",
  );
}
