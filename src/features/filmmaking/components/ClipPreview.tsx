import { useEffect, useState } from "react";
import { muxAnimated } from "../lib/mux";

/** Low-res animated still. The file is requested only once the card is hovered or in view. */
export function ClipPreview({
  playbackId,
  start,
  end,
  playing,
}: {
  playbackId: string;
  start: number;
  end: number;
  playing: boolean;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!playing || src) return;
    setSrc(muxAnimated(playbackId, { start, end, width: 320, fps: 8 }));
  }, [end, playbackId, playing, src, start]);

  if (!src) return null;

  return (
    <span className={playing ? "film-preview-layer is-on" : "film-preview-layer"} aria-hidden="true">
      <img src={src} alt="" width={320} height={180} decoding="async" fetchPriority="low" />
    </span>
  );
}
