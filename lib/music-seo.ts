import type { Work } from "@/types/work";
import { ARTIST_ID, SITE_URL } from "@/lib/artist";

export function isCrystynRelease(work: Work) {
  return work.type === "music" && Boolean(work.artists?.includes("CRYSTYN"));
}
export function musicArtists(work: Work) {
  return work.artists?.join(" & ");
}
export function musicDescription(work: Work) {
  const format = work.format === "ep" ? "an EP" : work.format === "album" ? "an album" : `a ${work.format ?? "music release"}`;
  return `${work.title} is ${format} by ${musicArtists(work)}, released ${work.date.replaceAll(".", "-")}.${work.description ? ` ${work.description}` : ""}`;
}
export function musicEntityId(work: Work) {
  return `${SITE_URL}/artwork/${encodeURIComponent(work.slug)}#release`;
}
function duration(value?: string) {
  const match = value?.match(/^(\d+):([0-5]\d)$/);
  return match ? `PT${Number(match[1])}M${Number(match[2])}S` : undefined;
}
export function musicSchema(work: Work) {
  if (work.type !== "music" || !work.artists?.length) return undefined;
  const album = work.format === "ep" || work.format === "album" || work.format === "double single";
  const url = `${SITE_URL}/artwork/${encodeURIComponent(work.slug)}`;
  const byArtist = work.artists.map((name) => name === "CRYSTYN"
    ? { "@id": ARTIST_ID }
    : { "@type": "MusicGroup", name });
  const count = Number(work.colophon?.tracks);
  return {
    "@context": "https://schema.org",
    "@type": album ? "MusicAlbum" : "MusicRecording",
    "@id": musicEntityId(work),
    name: work.title, url, byArtist,
    description: musicDescription(work),
    datePublished: work.date.replaceAll(".", "-"),
    image: new URL(work.thumbnail, SITE_URL).href,
    ...(album ? {
      ...(Number.isInteger(count) && count > 0 ? { numTracks: count } : {}),
      ...(work.lyrics?.length ? { track: work.lyrics.map((track, index) => ({
        "@type": "MusicRecording", "@id": `${url}#track-${index + 1}`,
        name: track.title, byArtist, inAlbum: { "@id": musicEntityId(work) },
      })) } : {}),
    } : { ...(duration(work.colophon?.runtime) ? { duration: duration(work.colophon?.runtime) } : {}) }),
  };
}
