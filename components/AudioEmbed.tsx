"use client";

import { useEffect, useRef, useState } from "react";
import { publishPlayback } from "@/lib/playback";

type SoundCloudWidget = { bind: (event: string, callback: (data?: { currentPosition?: number; relativePosition?: number }) => void) => void; unbind: (event: string) => void; getPosition: (callback: (position: number) => void) => void; isPaused: (callback: (paused: boolean) => void) => void; getCurrentSound: (callback: (sound: { permalink_url?: string }) => void) => void; getDuration: (callback: (duration: number) => void) => void };
type SoundCloudFactory = ((element: HTMLIFrameElement) => SoundCloudWidget) & { Events: Record<string, string> };
type SpotifyPlayback = { data?: { playingURI?: string; isPaused?: boolean; isBuffering?: boolean; position?: number; duration?: number } };
type SpotifyController = { destroy: () => void; addListener: (event: string, callback: (data: SpotifyPlayback) => void) => void };
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
  const [spotifyReady, setSpotifyReady] = useState(false);
  const [spotifyFallback, setSpotifyFallback] = useState(false);
  useEffect(() => {
    if (platform === "soundcloud") {
      loadScript("https://w.soundcloud.com/player/api.js");
      let cancelled = false;
      let widget: SoundCloudWidget | undefined;
      let poll: ReturnType<typeof setInterval> | undefined;
      let position = 0, duration = 0, playing = false, trackId = "";
      let revision = 0;
      let lastPosition = 0, lastAdvance = 0;
      const emit = () => {
        if (position !== lastPosition) { lastPosition = position; lastAdvance = performance.now(); }
        const isBuffering = playing && (position === 0 || performance.now() - lastAdvance > 400);
        if (!cancelled) publishPlayback({ platform, trackId, isPlaying: playing, isBuffering, positionMs: position, durationMs: duration, playbackRate: 1 });
      };
      const refresh = () => {
        const version = ++revision;
        widget?.getCurrentSound((sound) => {
          if (cancelled || version !== revision) return;
          trackId = sound?.permalink_url ?? "";
          widget?.getDuration((value) => { duration = value; });
          widget?.getPosition((value) => {
            if (cancelled || version !== revision) return;
            position = value;
            widget?.isPaused((paused) => {
              if (cancelled || version !== revision) return;
              playing = !paused; emit();
            });
          });
        });
      };
      const timer = setInterval(() => {
        if (!window.SC || !iframe.current) return;
        clearInterval(timer);
        widget = window.SC.Widget(iframe.current);
        const events = window.SC.Widget.Events;
        widget.bind(events.READY, refresh);
        widget.bind(events.PLAY, refresh);
        widget.bind(events.PAUSE, () => { ++revision; playing = false; emit(); });
        widget.bind(events.FINISH, () => { ++revision; playing = false; emit(); });
        widget.bind(events.SEEK, (data) => { ++revision; position = data?.currentPosition ?? position; emit(); refresh(); });
        widget.bind(events.PLAY_PROGRESS, (data) => { position = data?.currentPosition ?? position; emit(); });
        poll = setInterval(refresh, 250);
        refresh();
      }, 100);
      return () => {
        playing = false; emit(); cancelled = true;
        clearInterval(timer); clearInterval(poll);
        if (window.SC && widget) for (const key of ["READY", "PLAY", "PAUSE", "FINISH", "SEEK", "PLAY_PROGRESS"]) widget.unbind(window.SC.Widget.Events[key]);
      };
    }

    if (!uri || !spotify.current) return;
    let cancelled = false;
    let activeController: SpotifyController | undefined;
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) setSpotifyFallback(true);
    }, 6000);
    void getSpotifyApi().then((api) => {
      if (cancelled || !spotify.current) return;
      api.createController(spotify.current, { uri }, (controller) => {
        if (cancelled) { controller.destroy(); return; }
        activeController = controller;
        setSpotifyReady(true);
        window.clearTimeout(fallbackTimer);
        controller.addListener("playback_update", ({ data = {} }) => publishPlayback({ platform, trackId: data.playingURI ?? "", isPlaying: data.isPaused === false, isBuffering: !!data.isBuffering, positionMs: data.position ?? 0, durationMs: data.duration ?? 0, playbackRate: 1 }));
      });
    });
    return () => { cancelled = true; activeController?.destroy(); publishPlayback({ platform, trackId: "", isPlaying: false, isBuffering: false, positionMs: 0, durationMs: 0, playbackRate: 1 }); window.clearTimeout(fallbackTimer); };
  }, [platform, src, uri]);
  if (platform === "spotify") {
    return (
      <div className="min-h-[352px] w-full" aria-label={`${title} Spotify player`}>
        <div ref={spotify} className={spotifyReady || !spotifyFallback ? "min-h-[352px] w-full" : "hidden"} />
        {spotifyFallback && !spotifyReady ? (
          <iframe
            src={src}
            title={`${title} Spotify player`}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full border-0"
          />
        ) : null}
      </div>
    );
  }
  return <iframe ref={iframe} src={src} title={`${title} SoundCloud player`} width="100%" height="166" allow="autoplay; encrypted-media" loading="lazy" className="w-full border-0" />;
}
