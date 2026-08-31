export type ProjectDetails = {
  meta: string;
  premise: string;
};

const PROJECT_DETAILS: Record<string, ProjectDetails> = {
  ACROBATIC: {
    meta: "ONGOING SERIES · 2026—",
    premise: "An ongoing portrait study of movement, tension, and the body in space.",
  },
  "TINY THOUGHTS CLUB": {
    meta: "MUSIC CAPSULE · 2026",
    premise:
      "A musical study of youth caught between nostalgia, nightlife, desire, and digital overstimulation.",
  },
};

export function getProjectDetails(projectName: string) {
  return PROJECT_DETAILS[projectName];
}
