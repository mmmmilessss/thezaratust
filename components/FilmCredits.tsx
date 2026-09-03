type FilmCreditRow = {
  role: string;
  value: string;
};

type FilmCreditGroup = {
  title: string;
  rows: FilmCreditRow[];
};

function parseFilmCredits(credits: string) {
  const groups: FilmCreditGroup[] = [];
  let currentGroup: FilmCreditGroup | null = null;

  for (const line of credits.split("\n").map((item) => item.trim()).filter(Boolean)) {
    if (!line.includes("|")) {
      currentGroup = { title: line, rows: [] };
      groups.push(currentGroup);
      continue;
    }

    const [role, ...valueParts] = line.split("|");
    if (!currentGroup) {
      currentGroup = { title: "Production", rows: [] };
      groups.push(currentGroup);
    }
    currentGroup.rows.push({ role: role.trim(), value: valueParts.join("|").trim() });
  }

  return groups.filter((group) => group.rows.length);
}

export default function FilmCredits({ credits }: { credits: string }) {
  const groups = parseFilmCredits(credits);
  if (!groups.length) return null;

  return (
    <section className="border-t border-white/15 pt-8 sm:pt-10" aria-labelledby="film-credits-heading">
      <h2 id="film-credits-heading" className="mb-4 text-xs tracking-[0.2em] font-gotham-bold sm:mb-6 sm:text-sm">
        CREDITS
      </h2>

      <div className="divide-y divide-white/15 border-y border-white/15">
        {groups.map((group) => (
          <div key={group.title} className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(12rem,0.55fr)_minmax(0,1.45fr)] lg:gap-16">
            <h3 className="text-[10px] tracking-[0.16em] font-gotham-bold sm:text-xs">{group.title}</h3>
            <dl className="space-y-3 text-[10px] leading-4 font-gotham-medium sm:text-xs sm:leading-5">
              {group.rows.map((row, index) => (
                <div key={`${row.role}-${row.value}-${index}`} className="grid gap-1 sm:grid-cols-[minmax(11rem,0.7fr)_minmax(0,1.3fr)] sm:gap-8">
                  <dt className="opacity-45">{row.role}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
