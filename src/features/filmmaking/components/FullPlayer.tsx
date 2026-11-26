import { MuxData } from "@videojs/react/extensions/mux-data";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";
import "@videojs/react/video/skin.css";
import { useEffect, useRef, useState } from "react";
import type { FilmLang } from "../lib/i18n";
import { muxThumbnail, type MuxResolution } from "../lib/mux";

function gestureStillOpen(): boolean {
  if (typeof navigator !== "undefined" && navigator.userActivation?.isActive) return true;
  const stamp = window.__filmGesture;
  return typeof stamp === "number" && Date.now() - stamp < 4000;
}

function whenFrame(video: HTMLVideoElement, minTime: number, done: () => void) {
  let pending = true;
  const finish = () => {
    if (!pending) return;
    if (video.videoWidth === 0 || video.currentTime < minTime) {
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(() => finish());
      }
      return;
    }
    pending = false;
    done();
  };
  if (typeof video.requestVideoFrameCallback === "function") {
    video.requestVideoFrameCallback(() => finish());
  } else {
    const tick = () => {
      if (!pending) {
        video.removeEventListener("timeupdate", tick);
        return;
      }
      if (video.currentTime >= minTime && video.videoWidth > 0) {
        pending = false;
        video.removeEventListener("timeupdate", tick);
        done();
      }
    };
    video.addEventListener("timeupdate", tick);
  }
}

export function FullPlayer({
  playbackId,
  title,
  slug,
  posterTime,
  autoPlay,
  lang,
  onNeedSound,
  maxResolution = "1080p",
  posterWidth = 960,
  playFromStart = false,
}: {
  playbackId: string;
  title: string;
  slug: string;
  posterTime: number;
  autoPlay: boolean;
  lang: FilmLang;
  onNeedSound?: () => void;
  maxResolution?: MuxResolution;
  posterWidth?: number;
  playFromStart?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const soundRef = useRef(onNeedSound);
  const [painted, setPainted] = useState(false);
  soundRef.current = onNeedSound;
  const posterPx = posterWidth;
  const poster = muxThumbnail(playbackId, { time: posterTime, width: posterPx });

  useEffect(() => {
    const root = frame.current;
    if (!root) return;
    const want = lang === "zh-tw" ? "zh" : "en";
    const applyTracks = (video: HTMLVideoElement) => {
      const tracks = video.textTracks;
      for (let index = 0; index < tracks.length; index += 1) {
        const track = tracks[index];
        if (!track) continue;
        if (track.kind !== "subtitles" && track.kind !== "captions") continue;
        track.mode = track.language.toLowerCase().startsWith(want) ? "showing" : "disabled";
      }
    };
    let dead = false;
    const started = new WeakSet<HTMLVideoElement>();
    const framed = new WeakSet<HTMLVideoElement>();
    const watchFrame = (video: HTMLVideoElement) => {
      if (framed.has(video)) return;
      const arm = () => {
        if (dead || framed.has(video)) return;
        framed.add(video);
        whenFrame(video, 0.04, () => {
          if (!dead) setPainted(true);
        });
      };
      if (!video.paused && video.readyState >= 2 && video.currentTime >= 0.04) arm();
      video.addEventListener("playing", arm);
    };
    const boot = (video: HTMLVideoElement) => {
      if (started.has(video)) return;
      started.add(video);
      applyTracks(video);
      video.textTracks.addEventListener("addtrack", () => applyTracks(video));
      watchFrame(video);
      if (!autoPlay) {
        const unmuteOnPlay = () => {
          if (!video.muted) return;
          if (!gestureStillOpen()) return;
          video.muted = false;
        };
        video.addEventListener("play", unmuteOnPlay);
        return;
      }
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.autoplay = true;
      const unmute = gestureStillOpen();
      const start = () => {
        if (dead) return;
        const pending = video.play();
        if (!pending) return;
        pending
          .then(() => {
            if (!unmute) {
              soundRef.current?.();
              return;
            }
            video.muted = false;
            return video.play().catch(() => {
              video.muted = true;
              soundRef.current?.();
              return video.play();
            });
          })
          .catch(() => {
            video.muted = true;
            soundRef.current?.();
            void video.play().catch(() => undefined);
          });
      };
      if (video.readyState >= 2) start();
      else video.addEventListener("canplay", start, { once: true });
    };
    const scan = () => {
      root.querySelectorAll("video").forEach((node) => boot(node));
    };
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      dead = true;
      observer.disconnect();
    };
  }, [autoPlay, lang, playbackId]);

  return (
    <div
      ref={frame}
      className="film-player"
      data-autoplay={autoPlay ? "on" : "off"}
      data-frame={painted ? "on" : "off"}
      style={{ "--media-accent-color": "var(--color-film-accent)" } as React.CSSProperties}
    >
      <VideoPlayer title={title} poster={poster}>
        <VideoSkin />
        <MuxVideo
          className="film-player-video"
          source={{
            playbackId,
            playback: { maxResolution },
            poster: { time: posterTime, width: posterPx },
            engine: !playFromStart && posterTime > 0.2 ? { hlsJs: { startPosition: posterTime } } : undefined,
          }}
          crossOrigin="anonymous"
          playsInline
          muted
          autoPlay={autoPlay}
          poster={poster}
          fallback={null}
          aria-label={title}
        />
        <MuxData metadata={{ video_title: title, video_id: slug }} />
      </VideoPlayer>
      <img className="film-hold" src={poster} alt="" width={posterPx} height={Math.round((posterPx * 540) / 960)} />
    </div>
  );
}