import type { Track } from "@/lib/track-credits";

export default function TrackCredits({ tracks }: { tracks: Track[] }) {
  if (!tracks.length) return null;

  return (
    <ol className="divide-y divide-white/15 border-y border-white/15">
      {tracks.map((track) => (
        <li key={track.number} className="grid gap-6 py-7 sm:py-8 xl:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.3fr)] xl:gap-12">
          <div className="flex items-baseline gap-4 sm:gap-5">
            <span className="text-[9px] tracking-[0.18em] opacity-35 sm:text-[10px]">{track.number}</span>
            <h3 className="text-xs tracking-[0.1em] font-gotham-bold sm:text-sm">{track.title}</h3>
          </div>

          <dl className="space-y-2.5 text-[10px] leading-4 font-gotham-medium sm:text-xs sm:leading-5">
            {track.credits.map((credit, index) => (
              <div key={`${credit.role}-${credit.name}-${index}`} className="grid grid-cols-[minmax(0,1fr)_minmax(5.5rem,0.45fr)] gap-4 sm:grid-cols-[minmax(13rem,1fr)_minmax(7rem,0.65fr)] sm:gap-8">
                <dt className="opacity-45">{credit.role}</dt>
                <dd>{credit.name}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ol>
  );
}
