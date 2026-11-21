import { useEffect, useState } from "react";
import { MuxPreview } from "./MuxPreview";

export function PreviewVideo({
  playbackId,
  armed,
  playing,
}: {
  playbackId: string;
  armed: boolean;
  playing: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (armed) setMounted(true);
  }, [armed]);

  if (!mounted || failed) return null;

  return (
    <span className={shown ? "film-preview-layer is-on" : "film-preview-layer"} aria-hidden="true">
      <MuxPreview
        playbackId={playbackId}
        playing={playing}
        onFrame={() => {
          if (playing) setShown(true);
        }}
        onError={() => {
          setShown(false);
          setFailed(true);
        }}
      />
    </span>
  );
}
