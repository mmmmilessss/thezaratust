export type PlaybackState = { platform: "soundcloud" | "spotify"; trackId: string; isPlaying: boolean; isBuffering: boolean; positionMs: number; durationMs: number; playbackRate: number; updatedAt: number };
export const PLAYBACK_EVENT = "zaratust:playback";
export function publishPlayback(state: Omit<PlaybackState, "updatedAt">) {
  window.dispatchEvent(new CustomEvent<PlaybackState>(PLAYBACK_EVENT, { detail: { ...state, updatedAt: performance.now() } }));
}
