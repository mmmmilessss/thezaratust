import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://open.spotify.com https://w.soundcloud.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""} https://open.spotify.com https://api-partners.spotify.com https://w.soundcloud.com https://api.soundcloud.com`,
  "frame-src https://www.youtube.com https://open.spotify.com https://w.soundcloud.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
    ];
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
