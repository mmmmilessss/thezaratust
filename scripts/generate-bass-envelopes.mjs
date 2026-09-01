import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["content/works", "public/audio", "public/media"].map((value) => join(process.cwd(), value)).filter(existsSync);
const extensions = new Set([".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"]);
const files = [];
function walk(directory) { for (const entry of readdirSync(directory, { withFileTypes: true })) { const path = join(directory, entry.name); if (entry.isDirectory()) walk(path); else if (extensions.has(extname(entry.name).toLowerCase())) files.push(path); } }
roots.forEach(walk);
if (!files.length) { console.log("No local audio sources; bass envelopes unchanged."); process.exit(0); }
const outDir = join(process.cwd(), "public/bass-envelopes"); mkdirSync(outDir, { recursive: true });
for (const file of files) {
  const output = join(outDir, `${basename(file, extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`);
  if (existsSync(output) && statSync(output).mtimeMs >= statSync(file).mtimeMs) continue;
  const decoded = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-af", "highpass=f=40,lowpass=f=120", "-ac", "1", "-ar", "2000", "-f", "f32le", "pipe:1"], { maxBuffer: 1024 * 1024 * 256 });
  if (decoded.status !== 0) { console.warn(`Skipped ${file}: ffmpeg unavailable or decode failed.`); continue; }
  const samples = new Float32Array(decoded.stdout.buffer, decoded.stdout.byteOffset, Math.floor(decoded.stdout.byteLength / 4));
  const windowSize = 50; const rms = [];
  for (let i = 0; i < samples.length; i += windowSize) { let sum = 0; const end = Math.min(samples.length, i + windowSize); for (let j = i; j < end; j++) sum += samples[j] ** 2; rms.push(Math.sqrt(sum / (end - i))); }
  const sorted = [...rms].sort((a, b) => a - b); const ceiling = sorted[Math.floor(sorted.length * .98)] || 1;
  const values = rms.map((value) => Math.round(Math.min(1, value / ceiling) ** .7 * 255) / 255);
  writeFileSync(output, JSON.stringify({ intervalMs: 25, source: basename(file), values }));
}
