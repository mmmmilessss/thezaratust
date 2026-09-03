import FilmCredits from "@/components/FilmCredits";
import TrackCredits from "@/components/TrackCredits";
import type { Track } from "@/lib/track-credits";
import type { ProjectColophonData } from "@/types/work";

type ProjectColophonProps = {
  archiveId: string;
  data?: ProjectColophonData;
  credits?: string;
  tracks?: Track[];
};

const FIELD_ORDER: Array<[keyof ProjectColophonData, string]> = [
  ["format", "FORMAT"],
  ["runtime", "RUNTIME"],
  ["tracks", "TRACKS"],
  ["aspectRatio", "ASPECT RATIO"],
  ["resolution", "RESOLUTION"],
  ["camera", "CAMERA"],
  ["imageCount", "IMAGE COUNT"],
  ["material", "MATERIAL"],
  ["dimensions", "DIMENSIONS"],
  ["pieces", "PIECES"],
  ["location", "LOCATION"],
];

function SimpleCredit({ credit }: { credit: string }) {
  const match = credit.match(/^(.*\bby)\s+(.+)$/i);
  if (!match) return <span>{credit}</span>;

  return (
    <>
      <span className="opacity-45">{match[1]}</span>{" "}
      <span>{match[2]}</span>
    </>
  );
}

export default function ProjectColophon({ archiveId, data, credits, tracks = [] }: ProjectColophonProps) {
  const fields = FIELD_ORDER.flatMap(([key, label]) => {
    const value = data?.[key];
    return value ? [{ label, value }] : [];
  });
  const hasCredits = Boolean(credits || tracks.length);

  return (
    <section className="mt-20 sm:mt-28" aria-labelledby="project-colophon-heading">
      <h2 id="project-colophon-heading" className="mb-5 text-xs tracking-[0.2em] font-gotham-bold sm:mb-6 sm:text-sm">
        PROJECT COLOPHON
      </h2>

      <dl className="border-y border-white/15">
        {fields.map((field) => (
          <div key={field.label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-white/15 py-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8 sm:py-6">
            <dt className="text-[9px] tracking-[0.16em] opacity-45 sm:text-[10px]">{field.label}</dt>
            <dd className="text-[10px] leading-5 tracking-[0.08em] font-gotham-medium sm:text-xs sm:leading-6">{field.value}</dd>
          </div>
        ))}

        {hasCredits ? (
          <div className="grid gap-5 border-b border-white/15 py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8 sm:py-8">
            <dt className="text-[9px] tracking-[0.16em] opacity-45 sm:text-[10px]">CREDITS</dt>
            <dd>
              {tracks.length ? <TrackCredits tracks={tracks} /> : credits?.includes("|") ? <FilmCredits credits={credits} /> : credits ? (
                <p className="text-[10px] leading-5 tracking-[0.08em] font-gotham-medium sm:text-xs sm:leading-6"><SimpleCredit credit={credits} /></p>
              ) : null}
            </dd>
          </div>
        ) : null}

        <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8 sm:py-7">
          <dt className="text-[9px] tracking-[0.16em] opacity-45 sm:text-[10px]">ARCHIVE ID</dt>
          <dd className="text-[10px] tracking-[0.16em] font-gotham-bold sm:text-xs">{archiveId}</dd>
        </div>
      </dl>
    </section>
  );
}
