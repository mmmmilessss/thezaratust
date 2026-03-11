import MasonryGrid from "@/components/MasonryGrid";

/* eslint-disable @next/next/no-img-element */

type PhotographyArtworkLayoutProps = {
  type: string;
  title: string;
  date: string;
  description?: string;
  images: string[];
};

export default function PhotographyArtworkLayout({
  type,
  title,
  date,
  description,
  images,
}: PhotographyArtworkLayoutProps) {
  const heroImage = images[0];
  const galleryImages = images.slice(1);

  return (
    <main className="px-6 py-16 sm:px-10 sm:py-20 lg:px-20">
      <section className="mb-10 grid gap-8 md:grid-cols-2 md:items-start md:gap-16">
        <div className="max-w-xl">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] font-gotham-medium opacity-50 sm:text-sm">
            {type}
          </p>
          <h1 className="mb-4 text-lg font-gotham-bold sm:text-xl">{title}</h1>
          <p className="mb-8 text-xs font-gotham-medium opacity-60 sm:text-sm">{date}</p>
          {description ? (
            <p className="max-w-xl whitespace-pre-line text-xs leading-6 font-gotham-medium sm:text-sm sm:leading-7">
              {description}
            </p>
          ) : null}
        </div>

        {heroImage ? (
          <div>
            <img
              src={heroImage}
              alt={`${title} image 1`}
              className="block h-auto w-full"
            />
          </div>
        ) : null}
      </section>

      {galleryImages.length ? (
        <MasonryGrid
          items={galleryImages.map((image, index) => (
            <img
              key={`${title}-gallery-${index}`}
              src={image}
              alt={`${title} image ${index + 2}`}
              className="block h-auto w-full"
            />
          ))}
          className="grid grid-cols-2 items-start gap-4 sm:gap-6 lg:grid-cols-3"
        />
      ) : null}
    </main>
  );
}
