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
    <div className="divide-y divide-white/15 border-y border-white/15">
      {groups.map((group) => (
        <div key={group.title} className="grid gap-5 py-7 sm:py-8 xl:grid-cols-[minmax(10rem,0.5fr)_minmax(0,1.5fr)] xl:gap-12">
          <h3 className="text-[9px] tracking-[0.16em] font-gotham-bold sm:text-[10px]">{group.title}</h3>
          <dl className="space-y-2.5 text-[10px] leading-4 font-gotham-medium sm:text-xs sm:leading-5">
            {group.rows.map((row, index) => (
              <div key={`${row.role}-${row.value}-${index}`} className="grid grid-cols-[minmax(0,0.85fr)_minmax(6.5rem,1.15fr)] gap-4 sm:grid-cols-[minmax(11rem,0.7fr)_minmax(0,1.3fr)] sm:gap-8">
                <dt className="opacity-45">{row.role}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
