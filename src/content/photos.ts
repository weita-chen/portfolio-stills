import { photoManifest, type PhotoVariant } from "./photo-manifest";

export const photoSizes = {
  bleed: "100vw",
  full: "(max-width: 800px) 100vw, 92vw",
  tile: "(max-width: 700px) 100vw, (max-width: 1200px) 45vw, 25vw",
  split: "(max-width: 800px) 100vw, 46vw",
  about: "(max-width: 800px) 100vw, 42vw",
} as const;

export function variantFor(src?: string): PhotoVariant | null {
  if (!src) return null;
  return photoManifest[src] ?? null;
}

export function heroPreload(src: string | undefined, sizes: string) {
  const variant = variantFor(src);
  if (!variant && !src) return null;
  if (!variant) {
    return {
      rel: "preload" as const,
      as: "image" as const,
      href: src,
      fetchPriority: "high" as const,
    };
  }
  return {
    rel: "preload" as const,
    as: "image" as const,
    href: variant.src,
    imageSrcSet: variant.avif,
    imageSizes: sizes,
    type: "image/avif",
    fetchPriority: "high" as const,
  };
}
