const LCP_WIDTHS = [480, 768, 960] as const;

export const MUX_RESOLUTIONS = ["270p", "360p", "480p", "540p", "720p", "1080p", "1440p", "2160p"] as const;
export type MuxResolution = (typeof MUX_RESOLUTIONS)[number];

type ThumbOptions = {
  time?: number;
  width?: number;
  height?: number;
  fitMode?: string;
};

export const HOME_LCP_SIZES = "(max-width: 767px) 100vw, min(100vw, 90rem)";

export function heroLcpSizes(aspect: number) {
  const ratio = Number.isFinite(aspect) && aspect > 0 ? Math.round(aspect * 1000) / 1000 : 1.778;
  return `(max-width: 800px) 100vw, min(100vw, calc(78vh * ${ratio}))`;
}

export function muxThumbnail(id: string, options: ThumbOptions = {}): string {
  const url = new URL(`https://image.mux.com/${id}/thumbnail.webp`);
  if (options.time != null) url.searchParams.set("time", String(options.time));
  if (options.width) url.searchParams.set("width", String(options.width));
  if (options.height) url.searchParams.set("height", String(options.height));
  if (options.fitMode) url.searchParams.set("fit_mode", options.fitMode);
  return url.toString();
}

export function muxThumbnailSrcSet(id: string, time?: number): string {
  return LCP_WIDTHS.map((width) => `${muxThumbnail(id, { time, width })} ${width}w`).join(", ");
}

export function thumbSet(
  id: string,
  time: number | undefined,
  sizes: string,
  extra?: { widths?: readonly number[]; srcWidth?: number },
) {
  const widths = extra?.widths ?? LCP_WIDTHS;
  const srcWidth = extra?.srcWidth ?? 768;
  return {
    src: muxThumbnail(id, { time, width: srcWidth }),
    srcSet: widths.map((width) => `${muxThumbnail(id, { time, width })} ${width}w`).join(", "),
    sizes,
  };
}

/** Player poster. Wider than 960 only when a project asks for it; cards stay on the small set. */
export function playerThumb(id: string, time: number | undefined, sizes: string, posterWidth = 960) {
  if (posterWidth > 960) return thumbSet(id, time, sizes, { widths: [960, posterWidth], srcWidth: posterWidth });
  return thumbSet(id, time, sizes);
}

export function posterWidth(colSpan: 4 | 6 | 8 | 12): number {
  if (colSpan >= 8) return 768;
  return 480;
}

export function muxStream(id: string, options?: { maxResolution?: string }): string {
  const query = options?.maxResolution ? `?max_resolution=${options.maxResolution}` : "";
  return `https://stream.mux.com/${id}.m3u8${query}`;
}

/** Short muted hover loop. Width stays well under 540p; nothing is fetched until the card calls this. */
export function muxAnimated(
  id: string,
  options: { start: number; end: number; width?: number; fps?: number },
): string {
  const url = new URL(`https://image.mux.com/${id}/animated.webp`);
  url.searchParams.set("start", String(options.start));
  url.searchParams.set("end", String(options.end));
  url.searchParams.set("width", String(options.width ?? 320));
  url.searchParams.set("fps", String(options.fps ?? 8));
  return url.toString();
}
