import Header from "../components/Header";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "../components/Footer";

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
  title: "thezaratust",
  description: "Artist archive and portfolio built with Next.js",
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
        {children}
        <Footer />
      </body>
    </html>
  );
}
