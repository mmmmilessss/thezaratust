"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import MasonryGrid from "@/components/MasonryGrid";
import type { WorkImage } from "@/types/work";

type Props = { category: ReactNode; title: string; metadata: ReactNode; description?: string; images: WorkImage[]; colophon?: ReactNode; navigation?: ReactNode };

export default function PhotographyArtworkLayout({ category, title, metadata, description, images, colophon, navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((current) => current === null ? null : (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveIndex((current) => current === null ? null : (current + 1) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length]);

  const imageButton = (image: WorkImage, index: number, eager = false) => (
    <button key={image.src} type="button" onClick={() => setActiveIndex(index)} className="group block w-full cursor-zoom-in text-left" aria-label={`${title} image ${index + 1} 원본 보기`}>
      <Image
        src={image.src}
        alt={`${title} image ${index + 1}`}
        width={image.width}
        height={image.height}
        quality={88}
        sizes={index === 0 ? "(max-width: 767px) calc(100vw - 3rem), 50vw" : "(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"}
        loading={eager ? "eager" : "lazy"}
        className="block h-auto w-full transition-opacity duration-200 group-hover:opacity-90"
      />
    </button>
  );

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-20">
      <section className="mb-10 grid gap-8 md:grid-cols-2 md:items-start md:gap-16">
        <div className="max-w-xl">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] font-gotham-medium opacity-50 sm:text-sm">{category}</p>
          <h1 className="mb-4 text-lg font-gotham-bold sm:text-xl">{title}</h1>
          <div className="mb-8 text-xs font-gotham-medium opacity-60 sm:text-sm">{metadata}</div>
          {description ? <p className="max-w-xl whitespace-pre-line text-xs leading-6 font-gotham-medium sm:text-sm sm:leading-7">{description}</p> : null}
        </div>
        {images[0] ? imageButton(images[0], 0, true) : null}
      </section>

      {images.length > 1 ? <MasonryGrid items={images.slice(1).map((image, index) => imageButton(image, index + 1))} className="grid grid-cols-2 items-start gap-4 sm:gap-6 lg:grid-cols-3" /> : null}
      {colophon}
      {navigation}

      {activeImage && activeIndex !== null ? (
        <div role="dialog" aria-modal="true" aria-label={`${title} 원본 이미지`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-8" onClick={() => setActiveIndex(null)}>
          {/* The untouched original is intentionally requested only after opening the lightbox. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeImage.src} alt={`${title} image ${activeIndex + 1} original`} className="max-h-full max-w-full object-contain" onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={() => setActiveIndex(null)} className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/80" aria-label="원본 닫기"><X size={24} /></button>
          {images.length > 1 ? <>
            <button type="button" onClick={(event) => { event.stopPropagation(); setActiveIndex((activeIndex - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-white [filter:drop-shadow(0_2px_5px_rgba(0,0,0,0.95))] transition-opacity hover:opacity-60 sm:left-6 sm:rounded-full sm:bg-black/50 sm:p-2 sm:hover:bg-black/80" aria-label="이전 이미지"><ChevronLeft size={30} /></button>
            <button type="button" onClick={(event) => { event.stopPropagation(); setActiveIndex((activeIndex + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white [filter:drop-shadow(0_2px_5px_rgba(0,0,0,0.95))] transition-opacity hover:opacity-60 sm:right-6 sm:rounded-full sm:bg-black/50 sm:p-2 sm:hover:bg-black/80" aria-label="다음 이미지"><ChevronRight size={30} /></button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70">{activeIndex + 1} / {images.length}</p>
          </> : null}
        </div>
      ) : null}
    </main>
  );
}
