export type TrackCredit = {
  role: string;
  name: string;
};

export type Track = {
  number: string;
  title: string;
  credits: TrackCredit[];
};

const TRACKS_BY_WORK_SLUG: Record<string, Track[]> = {
  "tiny-thoughts-club": [
    {
      number: "01",
      title: "DON’T TRUST US",
      credits: [
        { role: "Vocals", name: "RexCudy" },
        { role: "Vocals", name: "CRYSTYN" },
        { role: "Vocals", name: "Park Hyunjun" },
        { role: "Lyrics, Composer", name: "RexCudy" },
        { role: "Composer, Arranger", name: "CRYSTYN" },
        { role: "Mixing Engineer, Mastering Engineer, Recording Engineer", name: "CRYSTYN" },
      ],
    },
    {
      number: "02",
      title: "TILL I MET U",
      credits: [
        { role: "Vocals", name: "RexCudy" },
        { role: "Vocals", name: "CRYSTYN" },
        { role: "Lyrics, Composer", name: "RexCudy" },
        { role: "Lyrics, Composer, Arranger", name: "CRYSTYN" },
        { role: "Mixing Engineer, Mastering Engineer, Recording Engineer", name: "CRYSTYN" },
      ],
    },
    {
      number: "03",
      title: "TINY PARTY PROBLEMS",
      credits: [
        { role: "Vocals", name: "CRYSTYN" },
        { role: "Vocals", name: "RexCudy" },
        { role: "Vocals", name: "Zino" },
        { role: "Lyrics, Composer, Arranger", name: "CRYSTYN" },
        { role: "Lyrics, Composer", name: "RexCudy" },
        { role: "Mixing Engineer, Mastering Engineer, Recording Engineer", name: "CRYSTYN" },
      ],
    },
    {
      number: "04",
      title: "CHASTE",
      credits: [
        { role: "Vocals", name: "CRYSTYN" },
        { role: "Vocals", name: "RexCudy" },
        { role: "Vocals", name: "Zino" },
        { role: "Lyrics, Composer", name: "RexCudy" },
        { role: "Lyrics, Composer, Arranger", name: "CRYSTYN" },
        { role: "Mixing Engineer, Mastering Engineer, Recording Engineer", name: "CRYSTYN" },
      ],
    },
    {
      number: "05",
      title: "NEURAL DRIFT",
      credits: [
        { role: "Vocals", name: "CRYSTYN" },
        { role: "Lyrics, Composer, Arranger", name: "CRYSTYN" },
        { role: "Lyrics", name: "RexCudy" },
        { role: "Mixing Engineer, Mastering Engineer, Recording Engineer", name: "CRYSTYN" },
      ],
    },
  ],
};

export function getTrackCredits(workSlug: string) {
  return TRACKS_BY_WORK_SLUG[workSlug] ?? [];
}
