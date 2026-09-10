import { SITE_URL } from "@/lib/artist";
import Header from "../components/Header";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "../components/Footer";
import MediaCursor from "@/components/MediaCursor";
import NavigationMemory from "@/components/NavigationMemory";
import { Suspense } from "react";

const gothamBold = localFont({
  src: "../public/fonts/Gotham-Bold.ttf",
  variable: "--font-gotham-bold",
});

const gothamMedium = localFont({
  src: "../public/fonts/Gotham-Medium.ttf",
  variable: "--font-gotham-medium",
});

const appleSdGothicNeoBold = localFont({
  src: "../public/fonts/AppleSDGothicNeoB.ttf",
  variable: "--font-apple-sd-gothic-neo-bold",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ZARATUST",
    template: "%s | ZARATUST",
  },
  description: "Music, photography, video, and visual work by CRYSTYN, with film by PARK GEON WOO.",
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    other: {
      "naver-site-verification": "f8cacc41ecbe67728a38b26c4a6dce4b24d2c804",
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${gothamBold.variable} ${gothamMedium.variable} ${appleSdGothicNeoBold.variable} antialiased`}
      >
        <Header />
        <MediaCursor />
        <Suspense><NavigationMemory /></Suspense>
        {children}
        <Footer />
      </body>
    </html>
  );
}
