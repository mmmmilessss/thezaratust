import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/artist";
import { getAllWorks } from "@/lib/works-content";
import { groupWorksByProject, slugifyProjectName } from "@/lib/works";
import { WORK_CATEGORIES } from "@/types/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const works = getAllWorks();
  const paths = ["/", "/crystyn", "/about", "/contact", "/work", "/projects", "/archive",
    ...WORK_CATEGORIES.map((category) => `/work/${category}`),
    ...works.map((work) => `/artwork/${encodeURIComponent(work.slug)}`),
    ...Object.keys(groupWorksByProject(works)).map((name) => `/projects/${slugifyProjectName(name)}`),
  ];
  return [...new Set(paths)].map((path) => ({ url: `${SITE_URL}${path}` }));
}
