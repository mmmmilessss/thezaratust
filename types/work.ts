export const WORK_CATEGORIES = [
  "music",
  "film",
  "photography",
  "video",
  "others",
] as const;

export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export type WorkLinks = Partial<{
  spotify: string;
  apple: string;
  youtube: string;
  soundcloud: string;
}>;

export type MusicFormat = "album" | "ep" | "single";

export type WorkImage = {
  src: string;
  width: number;
  height: number;
};

export type Work = {
  title: string;
  year: number;
  date: string;
  displayDate: string;
  type: WorkCategory;
  format?: MusicFormat;
  slug: string;
  project?: string;
  thumbnail: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  description?: string;
  displayType?: string;
  duration?: string;
  credits?: string;
  images?: WorkImage[];
  links?: WorkLinks;
  sortDateValue: number;
  sortOrder: number;
};

export type ArchiveSort = "random" | "newest" | "oldest";
