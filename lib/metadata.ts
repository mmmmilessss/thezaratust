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
  image?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
};

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  image,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ZARATUST`;
  const socialImage = image ?? DEFAULT_SHARE_IMAGE;

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
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage.url],
    },
  };
}
