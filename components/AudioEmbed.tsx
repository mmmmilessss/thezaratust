"use client";

import { useEffect, useRef } from "react";
import { publishPlayback } from "@/lib/playback";

type SoundCloudWidget = { bind: (event: string, callback: (data?: { currentPosition?: number; relativePosition?: number }) => void) => void; getDuration: (callback: (duration: number) => void) => void };
type SoundCloudFactory = ((element: HTMLIFrameElement) => SoundCloudWidget) & { Events: Record<string, string> };
type SpotifyPlayback = { data?: { isPaused?: boolean; isBuffering?: boolean; position?: number; duration?: number } };
type SpotifyController = { addListener: (event: string, callback: (data: SpotifyPlayback) => void) => void };
type SpotifyApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string },
    callback: (controller: SpotifyController) => void,
  ) => void;
};
declare global { interface Window { SC?: { Widget: SoundCloudFactory }; onSpotifyIframeApiReady?: (api: SpotifyApi) => void } }

let spotifyApi: SpotifyApi | undefined;
let spotifyApiPromise: Promise<SpotifyApi> | undefined;

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script"); script.src = src; script.async = true; document.head.appendChild(script);
}

function getSpotifyApi() {
  if (spotifyApi) return Promise.resolve(spotifyApi);
  if (!spotifyApiPromise) {
    spotifyApiPromise = new Promise((resolve) => {
      window.onSpotifyIframeApiReady = (api) => { spotifyApi = api; resolve(api); };
      loadScript("https://open.spotify.com/embed/iframe-api/v1");
    });
  }
  return spotifyApiPromise;
}

export default function AudioEmbed({ platform, src, title, uri }: { platform: "spotify" | "soundcloud"; src: string; title: string; uri?: string }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const spotify = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (platform === "soundcloud") {
      loadScript("https://w.soundcloud.com/player/api.js");
      const timer = setInterval(() => {
        if (!window.SC || !iframe.current) return;
        clearInterval(timer);
        const widget = window.SC.Widget(iframe.current); let duration = 0;
        widget.bind(window.SC.Widget.Events.READY, () => widget.getDuration((value) => duration = value));
        const emit = (playing: boolean, data?: { currentPosition?: number }) => publishPlayback({ platform, trackId: src, isPlaying: playing, isBuffering: false, positionMs: data?.currentPosition ?? 0, durationMs: duration, playbackRate: 1 });
        widget.bind(window.SC.Widget.Events.PLAY, () => emit(true)); widget.bind(window.SC.Widget.Events.PAUSE, () => emit(false)); widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data) => emit(true, data)); widget.bind(window.SC.Widget.Events.SEEK, (data) => emit(true, data)); widget.bind(window.SC.Widget.Events.FINISH, () => emit(false));
      }, 100);
      return () => clearInterval(timer);
    }
    if (!uri || !spotify.current) return;
    let cancelled = false;
    void getSpotifyApi().then((api) => { if (!cancelled && spotify.current) api.createController(spotify.current, { uri }, (controller) => controller.addListener("playback_update", ({ data = {} }) => publishPlayback({ platform, trackId: uri, isPlaying: !data.isPaused, isBuffering: !!data.isBuffering, positionMs: data.position ?? 0, durationMs: data.duration ?? 0, playbackRate: 1 }))); });
    return () => { cancelled = true; };
  }, [platform, src, uri]);
  if (platform === "spotify") return <div ref={spotify} className="min-h-[352px] w-full" aria-label={`${title} Spotify player`} />;
  return <iframe ref={iframe} src={src} title={`${title} SoundCloud player`} width="100%" height="166" allow="autoplay" loading="lazy" className="w-full border-0" />;
}
