import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  WORK_CATEGORIES,
  type MusicFormat,
  type ProjectColophonData,
  type Work,
  type WorkCategory,
  type WorkImage,
  type WorkLinks,
  type TrackLyrics,
} from "@/types/work";
import { sortWorks } from "@/lib/works";

const CONTENT_ROOT = path.join(process.cwd(), "content", "works");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const COVER_FILE_NAMES = ["cover.jpg", "cover.jpeg", "cover.png", "cover.webp"] as const;
const COLOPHON_KEYS = new Set<keyof ProjectColophonData>([
  "format",
  "runtime",
  "aspectRatio",
  "resolution",
  "camera",
  "location",
  "imageCount",
  "tracks",
  "material",
  "dimensions",
  "pieces",
]);
const ARCHIVE_ID_PATTERN = /^ZRST-(\d{3})-(\d{3})$/;
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
  return value === "album" || value === "ep" || value === "single" || value === "double single";
}

function getTrackLyrics(folderPath: string): TrackLyrics[] | undefined {
  const lyricsPath = path.join(folderPath, "lyrics");
  if (!existsSync(lyricsPath)) return undefined;

  const tracks = readdirSync(lyricsPath)
    .filter((fileName) => fileName.toLowerCase().endsWith(".txt"))
    .sort((left, right) => left.localeCompare(right))
    .flatMap((fileName) => {
      const [titleLine = "", ...bodyLines] = readFileSync(path.join(lyricsPath, fileName), "utf8").split(/\r?\n/);
      const title = titleLine.trim();
      const lyrics = bodyLines.join("\n").trim();
      return title && lyrics ? [{ title, lyrics }] : [];
    });

  return tracks.length ? tracks : undefined;
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

function getJpegDimensions(filePath: string) {
  const file = readFileSync(filePath);

  if (file.length < 4 || file[0] !== 0xff || file[1] !== 0xd8) {
    return null;
  }

  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
    0xcf,
  ]);
  let offset = 2;

  while (offset + 8 < file.length) {
    if (file[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = file[offset + 1];

    if (startOfFrameMarkers.has(marker)) {
      return {
        height: file.readUInt16BE(offset + 5),
        width: file.readUInt16BE(offset + 7),
      };
    }

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const segmentLength = file.readUInt16BE(offset + 2);

    if (segmentLength < 2) {
      break;
    }

    offset += segmentLength + 2;
  }

  return null;
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
    displayType?: string;
    duration?: string;
    archiveId?: string;
    colophon?: ProjectColophonData;
    credits?: string;
    links?: WorkLinks;
  } = {};
  let currentSection: "links" | "colophon" | "description" | "credits" | null = null;
  let descriptionIndent: number | null = null;
  const descriptionLines: string[] = [];
  const creditsLines: string[] = [];

  for (const rawLine of lines) {
    const indent = rawLine.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = rawLine.trim();

    if (currentSection === "description" || currentSection === "credits") {
      const section = currentSection;
      const sectionLines = section === "description" ? descriptionLines : creditsLines;
      if (!trimmed) {
        sectionLines.push("");
        continue;
      }

      if (indent > 0) {
        const nextIndent: number = descriptionIndent ?? indent;
        descriptionIndent = nextIndent;
        sectionLines.push(rawLine.slice(nextIndent));
        continue;
      }

      result[section] = sectionLines.join("\n");
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

        if (key === "colophon") {
          result.colophon = {};
          currentSection = "colophon";
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

      if ((key === "description" || key === "credits") && value === "|") {
        currentSection = key;
        (key === "description" ? descriptionLines : creditsLines).length = 0;
        descriptionIndent = null;
        result[key] = "";
        continue;
      }

      if (key === "displayType" || key === "duration") {
        result[key] = value;
        currentSection = null;
        continue;
      }

      if (key === "archiveId") {
        result.archiveId = value;
        currentSection = null;
        continue;
      }

      if (key === "type" || key === "title" || key === "date" || key === "description" || key === "credits") {
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

    if (currentSection === "colophon") {
      const separatorIndex = trimmed.indexOf(":");

      if (separatorIndex === -1 || !result.colophon) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim() as keyof ProjectColophonData;
      const value = parseScalar(trimmed.slice(separatorIndex + 1));

      if (COLOPHON_KEYS.has(key) && value) {
        result.colophon[key] = value;
      }

      continue;
    }
  }

  if (currentSection === "description" || currentSection === "credits") {
    result[currentSection] = (currentSection === "description" ? descriptionLines : creditsLines).join("\n");
  }

  return result;
}

function getArtworkImages(slug: string, folderPath: string, files: string[]) {
  return files.map((fileName) => {
    const dimensions = getJpegDimensions(path.join(folderPath, fileName)) ?? {
      width: 1600,
      height: 1600,
    };

    return {
      src: `/works-media/${slug}/${fileName}`,
      ...dimensions,
    } satisfies WorkImage;
  });
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

function getPreviewImages(type: WorkCategory, slug: string, images: WorkImage[], youtubeUrl?: string) {
  if (type === "photography") {
    const count = Math.min(20, images.length);
    const generated = Array.from({ length: count }, (_, index) => `/generated/hover-previews/${slug}/photo-${String(index).padStart(2, "0")}.jpg`);
    if (generated.every((source) => existsSync(path.join(process.cwd(), "public", source)))) return generated.map((source) => `${source}?v=2`);
    return Array.from({ length: count }, (_, index) => images[Math.round(index * (images.length - 1) / Math.max(1, count - 1))].src);
  }

  if (type === "video" || type === "film") {
    const generated = Array.from({ length: 20 }, (_, index) => `/generated/hover-previews/${slug}/frame-${String(index).padStart(2, "0")}.jpg`);
    if (generated.every((source) => existsSync(path.join(process.cwd(), "public", source)))) return generated.map((source) => `${source}?v=${slug === "film-thuglife" ? 3 : 2}`);
    const videoId = getYouTubeVideoId(youtubeUrl);
    return videoId
      ? [0, 1, 2, 3].map((frame) => `/works-youtube-thumbnail/${videoId}?frame=${frame}`)
      : undefined;
  }

  return undefined;
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
    return `/works-apple-cover/${slug}?v=2`;
  }

  if (soundCloudUrl) {
    return `/works-soundcloud-cover/${slug}?v=3`;
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

  if (!parsed.title || !parsed.type || !parsed.date || !parsed.archiveId || !isWorkCategory(parsed.type)) {
    throw new Error(`Invalid data.yaml for artwork "${slug}".`);
  }

  const archiveIdMatch = parsed.archiveId.match(ARCHIVE_ID_PATTERN);
  if (!archiveIdMatch || archiveIdMatch[2] === "000") {
    throw new Error(`Invalid archive ID "${parsed.archiveId}" for artwork "${slug}".`);
  }

  const imageFiles = getArtworkImageFileNames(folderPath);
  const images = getArtworkImages(slug, folderPath, imageFiles);
  const localCoverFileName = getLocalCoverFileName(imageFiles);
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
  const archiveYear = String(parsedDate.year).slice(-3).padStart(3, "0");
  if (archiveIdMatch[1] !== archiveYear) {
    throw new Error(`Archive ID "${parsed.archiveId}" does not match artwork year ${parsedDate.year}.`);
  }
  const audioEnvelopePath = path.join(process.cwd(), "public", "bass-envelopes", `${slug}.json`);
  const localThumbnailDimensions = localCoverFileName
    ? getJpegDimensions(path.join(folderPath, localCoverFileName))
    : null;
  const fallbackThumbnailDimensions =
    parsed.type === "video" || parsed.type === "film"
      ? { width: 1280, height: 720 }
      : { width: 1000, height: 1000 };
  const thumbnailDimensions =
    localThumbnailDimensions ?? fallbackThumbnailDimensions;

  return {
    slug,
    title: parsed.title,
    type: parsed.type,
    format: parsed.format,
    archiveId: parsed.archiveId,
    colophon: parsed.colophon,
    date: String(parsed.date),
    displayDate: parsedDate.displayDate,
    year: parsedDate.year,
    project: parsed.project,
    description: parsed.description,
    displayType: parsed.displayType,
    duration: parsed.duration,
    credits: parsed.credits,
    thumbnail: thumbnail ?? "",
    thumbnailWidth: thumbnailDimensions.width,
    thumbnailHeight: thumbnailDimensions.height,
    images,
    previewImages: getPreviewImages(parsed.type, slug, images, parsed.links?.youtube),
    audioEnvelope: existsSync(audioEnvelopePath) ? `/bass-envelopes/${slug}.json` : undefined,
    links: parsed.links,
    lyrics: getTrackLyrics(folderPath),
    sortDateValue: parsedDate.sortDateValue,
    sortOrder,
  } satisfies Work;
}

export function getAllWorks() {
  if (!existsSync(CONTENT_ROOT)) {
    return [];
  }

  const works = readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry, index) => parseWorkFolder(entry.name, index));

  const archiveIds = new Set<string>();
  const sequencesByYear = new Map<string, number[]>();
  for (const work of works) {
    if (archiveIds.has(work.archiveId)) {
      throw new Error(`Duplicate archive ID "${work.archiveId}".`);
    }
    archiveIds.add(work.archiveId);
    const [, archiveYear, sequence] = work.archiveId.match(ARCHIVE_ID_PATTERN)!;
    const yearSequences = sequencesByYear.get(archiveYear) ?? [];
    yearSequences.push(Number(sequence));
    sequencesByYear.set(archiveYear, yearSequences);
  }

  for (const [archiveYear, sequences] of sequencesByYear) {
    sequences.sort((left, right) => left - right);
    sequences.forEach((sequence, index) => {
      if (sequence !== index + 1) {
        throw new Error(`Archive IDs for year ${archiveYear} must be contiguous from 001.`);
      }
    });
  }

  return works;
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
