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
  metadataBase: new URL("https://www.zaratust.com"),
  title: {
    default: "ZARATUST",
    template: "%s | ZARATUST",
  },
  description: "Music, photography, video, and visual work by CRYSTYN, with film by PARK GEON WOO.",
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
