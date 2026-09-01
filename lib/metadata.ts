import type { Metadata } from "next";

const DEFAULT_SHARE_IMAGE = {
  url: "/images/hero-desktop.jpg",
  width: 1800,
  height: 1200,
  alt: "ZARATUST",
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ZARATUST`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: "ZARATUST",
      type: "website",
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [DEFAULT_SHARE_IMAGE.url],
    },
  };
}
