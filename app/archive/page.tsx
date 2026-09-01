import ArchiveClient from "@/app/archive/ArchiveClient";
import { getAllWorks } from "@/lib/works-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Archive",
  description: "Browse the complete ZARATUST archive across music, film, photography, and video.",
  path: "/archive",
});

export default function ArchivePage() {
  return <ArchiveClient works={getAllWorks()} />;
}
