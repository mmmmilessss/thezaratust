import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd(), worksRoot = join(root, "content/works"), cacheRoot = join(root, "public/generated/audio-analysis");
mkdirSync(cacheRoot, { recursive: true });
const scalar = (text, key) => text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim().replace(/^['"]|['"]$/g, "");
const link = (text, key) => text.match(new RegExp(`^\\s{2}${key}:\\s*(.+)$`, "m"))?.[1]?.trim();

for (const folder of readdirSync(worksRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const data = readFileSync(join(worksRoot, folder.name, "data.yaml"), "utf8");
  if (scalar(data, "type") !== "music") continue;
  const slug = folder.name.trim().toLowerCase().replace(/\s+/g, "-");
  const soundcloud = link(data, "soundcloud"), apple = link(data, "apple");
  const usableSoundCloud = soundcloud && new URL(soundcloud).pathname.split("/").filter(Boolean).length >= 2;
  const sourceUrl = usableSoundCloud ? soundcloud : apple;
  if (!sourceUrl) { console.log(`UNRESOLVED ${slug}: no direct public source`); continue; }
  const metadataPath = join(cacheRoot, `${slug}.json`);
  const cached = existsSync(metadataPath) ? JSON.parse(readFileSync(metadataPath, "utf8")) : null;
  const cachedFile = cached?.file ? join(cacheRoot, cached.file) : null;
  if (cached?.sourceUrl === sourceUrl && cachedFile && existsSync(cachedFile)) { console.log(`CACHED ${slug}: ${cached.file}`); continue; }
  let outputFile, resolvedUrl = sourceUrl, sourceType = "soundcloud-full";
  if (usableSoundCloud) {
    const result = spawnSync("yt-dlp", ["--no-playlist", "--no-update", "-f", "bestaudio", "-o", join(cacheRoot, `${slug}.analysis.%(ext)s`), "--print", "after_move:filepath", sourceUrl], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
    if (result.status !== 0) { console.log(`UNRESOLVED ${slug}: SoundCloud download failed`); continue; }
    outputFile = result.stdout.trim().split("\n").at(-1);
  } else {
    const html = await fetch(sourceUrl).then((response) => response.text());
    resolvedUrl = html.match(/https[^" ]+\.m4a[^" ]*/)?.[0]?.replaceAll("&amp;", "&");
    if (!resolvedUrl) { console.log(`UNRESOLVED ${slug}: Apple preview unavailable`); continue; }
    sourceType = "apple-official-preview"; outputFile = join(cacheRoot, `${slug}.analysis.m4a`);
    writeFileSync(outputFile, Buffer.from(await fetch(resolvedUrl).then((response) => response.arrayBuffer())));
  }
  const file = outputFile.split("/").at(-1);
  writeFileSync(metadataPath, JSON.stringify({ slug, sourceUrl, resolvedUrl, sourceType, file, downloadedAt: new Date().toISOString() }, null, 2));
  console.log(`DOWNLOADED ${slug}: ${file}`);
}
