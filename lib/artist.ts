export const SITE_URL = "https://zaratust.com";
export const ARTIST_URL = `${SITE_URL}/crystyn`;
export const ARTIST_ID = `${ARTIST_URL}#artist`;
export const ARTIST_DESCRIPTION = "CRYSTYN is an artist and producer based in Seoul, South Korea. Explore music releases, collaborations, and official listening links.";

// Profile links from the existing About page. Apple artist ID corrected against
// the official Situation release page on 2026-09-07.
export const officialProfiles = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/changwonthesoloist/",
    iconSrc: "/icons/instagram.svg",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@shawnabloh",
    iconSrc: "/icons/youtube.svg",
  },
  {
    label: "SoundCloud",
    href: "https://soundcloud.com/crystalcrystyn",
    iconSrc: "/icons/soundcloud.svg",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/artist/0q9uxky197tAZpHJycwB2J",
    iconSrc: "/icons/spotify.svg",
  },
  {
    label: "Apple Music",
    href: "https://music.apple.com/kr/artist/crystyn/6807604953",
    iconSrc: "/icons/applemusic.svg",
  },
  {
    label: "Melon",
    href: "https://www.melon.com/artist/timeline.htm?artistId=4823567",
    iconSrc: "/icons/melon.png",
  },
] as const;
