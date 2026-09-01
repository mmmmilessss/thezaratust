import Image from "next/image";
import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About",
  description: "About ZARATUST, the Seoul-based multidisciplinary creative practice of PARK GEON WOO. Music is released as CRYSTYN.",
  path: "/about",
});

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
    href: "https://soundcloud.com/crystalcrystyn",
    iconSrc: "/icons/soundcloud.svg",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/artist/3BauZYcHO8tEcLKjj75InQ",
    iconSrc: "/icons/spotify.svg",
  },
  {
    label: "Apple Music",
    href: "https://music.apple.com/kr/artist/crystyn/1879705589",
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
        <div className="mb-8 space-y-2">
          <p className="text-2xl font-gotham-bold sm:text-3xl">A STUDY OF AESTHETICS.</p>
          <p lang="ko" className="!text-[20px] font-gotham-medium">
            미에 대한 탐구.
          </p>
        </div>

        <div className="mb-14 max-w-2xl space-y-8 text-[calc(0.65rem+1px)] leading-5 font-gotham-medium sm:text-[13px] sm:leading-6">
          <div className="space-y-4 normal-case tracking-[0.02em]">
            <p>
              ZARATUST is the multidisciplinary creative practice of PARK GEON
              WOO,
              <br />
              spanning sound, moving image, photography, and related forms.
            </p>
            <p>Music is released under the name CRYSTYN.</p>
            <p>Based in Seoul, South Korea.</p>
          </div>

          <div lang="ko" className="space-y-4 [&_p]:!text-[12px] [&_p]:leading-5 sm:[&_p]:!text-[13px]">
            <p>
              ZARATUST는 박건우의 여러 매체를 넘나드는 창작 활동으로,
              <br />
              사운드, 영상, 사진을 비롯한 다양한 시각·청각 작업을 전개한다.
            </p>
            <p>음악은 CRYSTYN이라는 이름으로 활동한다.</p>
            <p>대한민국 서울을 기반으로 활동한다.</p>
          </div>
        </div>

        <div className="space-y-5">
          {socialLinks.map((item) => {
            return (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 transition-opacity hover:opacity-60"
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
