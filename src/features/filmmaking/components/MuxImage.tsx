import { muxThumbnail, muxThumbnailSrcSet } from "../lib/mux";

type MuxImageProps = {
  playbackId: string;
  time?: number;
  sizes: string;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
  srcWidth?: number;
};

export function MuxImage({
  playbackId,
  time,
  sizes,
  width,
  height,
  alt,
  priority = false,
  srcWidth = 800,
}: MuxImageProps) {
  return (
    <img
      src={muxThumbnail(playbackId, { time, width: srcWidth })}
      srcSet={muxThumbnailSrcSet(playbackId, time)}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "low"}
    />
  );
}
