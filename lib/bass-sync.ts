import type { PlaybackState } from "./playback";

export type KickEnvelope = { intervalMs: number; durationMs: number; trackIds: string[]; values: number[] };

// Never apply an album/video timeline to an unidentified track or a preview excerpt.
export function sampleKick(data: KickEnvelope | null, state: PlaybackState, now: number): number {
  if (!data || !state.isPlaying || state.isBuffering || now - state.updatedAt > 1500) return 0;
  if (!data.trackIds?.includes(state.trackId) || Math.abs(data.durationMs - state.durationMs) > 1000) return 0;
  const position = state.positionMs + Math.max(0, now - state.updatedAt) * state.playbackRate;
  if (position < 0 || position >= data.durationMs) return 0;
  return data.values[Math.floor(position / data.intervalMs)] ?? 0;
}
