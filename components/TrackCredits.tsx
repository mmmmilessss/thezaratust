import type { Track } from "@/lib/track-credits";

type TrackCreditsProps = {
  tracks: Track[];
  defaultCredit?: {
    role: string;
    name: string;
  };
};

export default function TrackCredits({ tracks, defaultCredit }: TrackCreditsProps) {
  if (!tracks.length && !defaultCredit) return null;

  return (
    <section className="mt-20 border-t border-white/15 pt-8 sm:mt-28 sm:pt-10" aria-labelledby="credits-heading">
      <div className="mb-4 flex items-baseline justify-between gap-6 sm:mb-6">
        <h2 id="credits-heading" className="text-xs tracking-[0.2em] font-gotham-bold sm:text-sm">
          CREDITS
        </h2>
        {tracks.length ? <p className="text-[9px] tracking-[0.16em] opacity-40 sm:text-xs">{String(tracks.length).padStart(2, "0")} TRACKS</p> : null}
      </div>

      {tracks.length ? (
        <ol className="divide-y divide-white/15 border-y border-white/15">
          {tracks.map((track) => (
            <li key={track.number} className="grid gap-7 py-8 sm:py-10 lg:grid-cols-[minmax(16rem,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
              <div className="flex items-baseline gap-4 sm:gap-6">
                <span className="text-[10px] tracking-[0.18em] opacity-35 sm:text-xs">{track.number}</span>
                <h3 className="text-sm tracking-[0.1em] font-gotham-bold sm:text-base">{track.title}</h3>
              </div>

              <dl className="space-y-3 text-[10px] leading-4 font-gotham-medium sm:text-xs sm:leading-5">
                {track.credits.map((credit, index) => (
                  <div key={`${credit.role}-${credit.name}-${index}`} className="grid gap-1 sm:grid-cols-[minmax(13rem,1fr)_minmax(7rem,0.65fr)] sm:gap-8">
                    <dt className="opacity-45">{credit.role}</dt>
                    <dd>{credit.name}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      ) : (
        <div className="border-y border-white/15 py-8 sm:py-10">
          <p className="text-[10px] leading-5 tracking-[0.08em] font-gotham-medium sm:text-xs sm:leading-6">
            <span className="opacity-45">{defaultCredit?.role}</span>{" "}
            <span>{defaultCredit?.name}</span>
          </p>
        </div>
      )}
    </section>
  );
}
