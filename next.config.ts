import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/logo.png",
      },
      {
        pathname: "/images/**",
      },
      {
        pathname: "/works-media/**",
      },
      {
        pathname: "/works-apple-cover/**",
      },
      {
        pathname: "/works-soundcloud-cover/**",
        search: "?v=2",
      },
      {
        pathname: "/works-youtube-thumbnail/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source:
          "/artwork/film-tiny-thougts-club-full-ep-listening-experience",
        destination:
          "/artwork/film-tiny-thoughts-club-full-ep-listening-experience",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
