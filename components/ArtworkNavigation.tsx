import Link from "next/link";

type ArtworkNavigationItem = {
  slug: string;
  title: string;
};

type ArtworkNavigationProps = {
  previous?: ArtworkNavigationItem;
  next?: ArtworkNavigationItem;
};

export default function ArtworkNavigation({
  previous,
  next,
}: ArtworkNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Artwork navigation"
      className="mt-20 grid grid-cols-2 gap-6 border-t border-white/20 pt-6 sm:mt-28"
    >
      <div>
        {previous ? (
          <Link
            href={`/artwork/${previous.slug}`}
            className="group inline-flex max-w-full flex-col gap-2 transition hover:opacity-60"
          >
            <span className="text-[0.65rem] font-gotham-medium opacity-60 sm:text-xs">
              ← PREVIOUS
            </span>
            <span className="truncate text-xs font-gotham-bold sm:text-sm">
              {previous.title}
            </span>
          </Link>
        ) : null}
      </div>

      <div className="text-right">
        {next ? (
          <Link
            href={`/artwork/${next.slug}`}
            className="group inline-flex max-w-full flex-col items-end gap-2 transition hover:opacity-60"
          >
            <span className="text-[0.65rem] font-gotham-medium opacity-60 sm:text-xs">
              NEXT →
            </span>
            <span className="max-w-full truncate text-xs font-gotham-bold sm:text-sm">
              {next.title}
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
