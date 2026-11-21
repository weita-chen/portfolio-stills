const LCP_WIDTHS = [480, 768, 960] as const;

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

export function thumbSet(id: string, time: number | undefined, sizes: string) {
  return {
    src: muxThumbnail(id, { time, width: 768 }),
    srcSet: muxThumbnailSrcSet(id, time),
    sizes,
  };
}

export function posterWidth(colSpan: 4 | 6 | 8 | 12): number {
  if (colSpan >= 8) return 768;
  return 480;
}

export function muxStream(id: string, options?: { maxResolution?: string }): string {
  const query = options?.maxResolution ? `?max_resolution=${options.maxResolution}` : "";
  return `https://stream.mux.com/${id}.m3u8${query}`;
}
