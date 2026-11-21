import type { FilmLang } from "./i18n";
import { muxStream, muxThumbnail } from "./mux";
import { displayName } from "./name";

export const FILM_ORIGIN = "https://weitachen.pro";

export function swapLang(path: string, lang: FilmLang): string {
  return path.replace(/\/filmmaking\/(?:en|zh-tw)/, `/filmmaking/${lang}`);
}

export function muxOgImage(playbackId: string, time?: number): string {
  return muxThumbnail(playbackId, { time, width: 1200, height: 630, fitMode: "smartcrop" });
}

function isoDuration(seconds?: number): string | undefined {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return undefined;
  const whole = Math.round(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remain = whole % 60;
  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${remain}S`;
}

export function videoObject(opts: {
  title: string;
  description: string;
  playbackId: string;
  posterTime: number;
  durationSec?: number;
  year: number;
  path: string;
  lang: FilmLang;
}) {
  const pageUrl = `${FILM_ORIGIN}${opts.path}`;
  const duration = isoDuration(opts.durationSec);
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: opts.title,
    description: opts.description,
    thumbnailUrl: muxOgImage(opts.playbackId, opts.posterTime),
    uploadDate: `${opts.year}-01-01`,
    contentUrl: muxStream(opts.playbackId),
    embedUrl: pageUrl,
    url: pageUrl,
    inLanguage: opts.lang === "zh-tw" ? "zh-Hant" : "en",
    publisher: { "@type": "Organization", name: displayName(opts.lang) },
    ...(duration ? { duration } : {}),
  };
}

export function personObject(opts: {
  lang: FilmLang;
  path: string;
  email: string;
  jobTitle: readonly string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${FILM_ORIGIN}/#weita-chen`,
    name: displayName(opts.lang),
    email: opts.email,
    jobTitle: [...opts.jobTitle],
    url: `${FILM_ORIGIN}${opts.path}`,
  };
}

type HeadMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

export function filmHead(opts: {
  title: string;
  description: string;
  path: string;
  lang: FilmLang;
  image?: string;
  imageAlt?: string;
  jsonLd?: ReturnType<typeof videoObject> | ReturnType<typeof personObject>;
}) {
  const enPath = swapLang(opts.path, "en");
  const zhPath = swapLang(opts.path, "zh-tw");
  const canonical = `${FILM_ORIGIN}${opts.path}`;
  const meta: HeadMeta[] = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { name: "language", content: opts.lang === "zh-tw" ? "zh-Hant" : "en" },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:url", content: canonical },
    { property: "og:site_name", content: displayName(opts.lang) },
    { property: "og:locale", content: opts.lang === "zh-tw" ? "zh_TW" : "en_US" },
    { property: "og:locale:alternate", content: opts.lang === "zh-tw" ? "en_US" : "zh_TW" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
  ];
  if (opts.image) {
    const alt = opts.imageAlt || opts.title;
    meta.push(
      { property: "og:type", content: "video.other" },
      { property: "og:image", content: opts.image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: opts.image },
      { name: "twitter:image:alt", content: alt },
    );
  } else {
    meta.push(
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    );
  }
  return {
    meta,
    links: [
      { rel: "canonical", href: canonical },
      { rel: "alternate", hrefLang: "en", href: `${FILM_ORIGIN}${enPath}` },
      { rel: "alternate", hrefLang: "zh-tw", href: `${FILM_ORIGIN}${zhPath}` },
      { rel: "alternate", hrefLang: "zh-Hant", href: `${FILM_ORIGIN}${zhPath}` },
      { rel: "alternate", hrefLang: "x-default", href: `${FILM_ORIGIN}${enPath}` },
    ],
    scripts: opts.jsonLd
      ? [{ type: "application/ld+json", children: JSON.stringify(opts.jsonLd) }]
      : [],
  };
}

export const filmFonts = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
  { rel: "preconnect", href: "https://image.mux.com" },
  { rel: "preconnect", href: "https://stream.mux.com" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
    media: "print",
  },
];