import { MuxVideo } from "@videojs/react/media/mux-video";
import { useEffect, useRef } from "react";

type MuxPreviewProps = {
  playbackId: string;
  playing: boolean;
  onFrame: () => void;
  onError: () => void;
};

export function MuxPreview({ playbackId, playing, onFrame, onError }: MuxPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onFrameRef = useRef(onFrame);
  const onErrorRef = useRef(onError);
  const playingRef = useRef(playing);
  onFrameRef.current = onFrame;
  onErrorRef.current = onError;
  playingRef.current = playing;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reveal = () => {
      if (playingRef.current && video.currentTime > 0.04 && video.videoWidth > 0) onFrameRef.current();
    };
    const hold = () => {
      if (!playingRef.current) video.pause();
    };
    video.addEventListener("playing", reveal);
    video.addEventListener("timeupdate", reveal);
    video.addEventListener("error", () => onErrorRef.current());
    video.addEventListener("play", hold);
    return () => {
      video.removeEventListener("playing", reveal);
      video.removeEventListener("timeupdate", reveal);
      video.removeEventListener("play", hold);
    };
  }, [playbackId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!playing) {
      video.pause();
      return;
    }
    let stopped = false;
    const tryPlay = () => {
      if (stopped || !playingRef.current) return;
      video.muted = true;
      const pending = video.play();
      pending?.catch(() => {
        if (!stopped && playingRef.current) video.addEventListener("canplay", tryPlay, { once: true });
      });
    };
    tryPlay();
    const timer = window.setInterval(tryPlay, 250);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [playing, playbackId]);

  return (
    <MuxVideo
      ref={videoRef}
      className="film-preview"
      source={{ playbackId }}
      fallback={null}
      muted
      loop
      playsInline
      autoPlay={playing}
      preload="auto"
      crossOrigin="anonymous"
    />
  );
}
