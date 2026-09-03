export const WORK_CATEGORIES = [
  "music",
  "film",
  "photography",
  "video",
] as const;

export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export type WorkLinks = Partial<{
  spotify: string;
  apple: string;
  youtube: string;
  soundcloud: string;
}>;

export type MusicFormat = "album" | "ep" | "single" | "double single";

export type TrackLyrics = {
  title: string;
  lyrics: string;
};

export type WorkImage = {
  src: string;
  width: number;
  height: number;
};

export type ProjectColophonData = Partial<{
  format: string;
  runtime: string;
  aspectRatio: string;
  resolution: string;
  camera: string;
  location: string;
  imageCount: string;
  tracks: string;
  material: string;
  dimensions: string;
  pieces: string;
}>;

export type Work = {
  title: string;
  year: number;
  date: string;
  displayDate: string;
  type: WorkCategory;
  format?: MusicFormat;
  slug: string;
  archiveId: string;
  colophon?: ProjectColophonData;
  project?: string;
  thumbnail: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  description?: string;
  displayType?: string;
  duration?: string;
  credits?: string;
  images?: WorkImage[];
  previewImages?: string[];
  audioEnvelope?: string;
  links?: WorkLinks;
  lyrics?: TrackLyrics[];
  sortDateValue: number;
  sortOrder: number;
};

export type ArchiveSort = "random" | "newest" | "oldest";
