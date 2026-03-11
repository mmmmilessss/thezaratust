import ArchiveClient from "@/app/archive/ArchiveClient";
import { getAllWorks } from "@/lib/works-content";

export default function ArchivePage() {
  return <ArchiveClient works={getAllWorks()} />;
}
