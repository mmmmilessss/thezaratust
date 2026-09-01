import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 86, 88, 90],
    localPatterns: [
      {
        pathname: "/logo.png",
      },
      {
        pathname: "/images/**",
      },
      {
        pathname: "/icons/**",
      },
      {
        pathname: "/works-media/**",
      },
      {
        pathname: "/works-apple-cover/**",
        search: "?v=2",
      },
      {
        pathname: "/works-soundcloud-cover/**",
        search: "?v=3",
      },
      {
        pathname: "/works-youtube-thumbnail/**",
      },
      {
        pathname: "/generated/hover-previews/**",
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
      {
        source: "/projects/tiny-thougts-club",
        destination: "/projects/tiny-thoughts-club",
        statusCode: 301,
      },
      {
        source: "/work/others",
        destination: "/work",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
