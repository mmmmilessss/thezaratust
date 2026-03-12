import Image from "next/image";
import Link from "next/link";

const socialLinks = [
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
    href: "https://soundcloud.com/milessszaratust",
    iconSrc: "/icons/soundcloud.svg",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/artist/3BauZYcHO8tEcLKjj75InQ",
    iconSrc: "/icons/spotify.svg",
  },
  {
    label: "Apple Music",
    href: "https://music.apple.com/kr/artist/miles-zaratust/1879705589",
    iconSrc: "/icons/applemusic.svg",
  },
  {
    label: "Melon",
    href: "https://www.melon.com/artist/timeline.htm?artistId=4823567",
    iconSrc: "/icons/melon.png",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
      <section className="max-w-3xl">
        <div className="mb-14 space-y-2">
          <p className="text-xl font-gotham-bold sm:text-2xl">EXPLORING BEAUTY.</p>
          <p lang="ko" className="font-gotham-medium">
            미에 대한 탐구.
          </p>
        </div>

        <div className="space-y-5">
          {socialLinks.map((item) => {
            return (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:opacity-60"
              >
                <Image
                  src={item.iconSrc}
                  alt={item.label}
                  width={22}
                  height={22}
                  className={`h-[22px] w-[22px] object-contain ${
                    item.label === "Melon" ? "brightness-0 invert" : "invert"
                  }`}
                />
                <span className="font-gotham-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
