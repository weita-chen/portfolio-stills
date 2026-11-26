import { z } from "zod";
import projectsJson from "../content/projects.json";
import siteJson from "../content/site.json";
import { t, type FilmLang } from "./i18n";
import { MUX_RESOLUTIONS, type MuxResolution } from "./mux";
import { creditName } from "./name";

const localized = z.object({
  en: z.string().min(1),
  "zh-tw": z.string().min(1).optional(),
});

const aspectRatio = z.enum(["16:9", "1.85:1", "2:1", "2.39:1", "4:3", "9:16", "1:1"]);
const category = z.enum([
  "showreel",
  "commercial",
  "music-video",
  "documentary",
  "narrative",
  "brand-film",
  "event",
  "personal",
]);
const role = z.enum(["director", "dp", "cinematographer", "editor", "colorist", "producer"]);

const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: localized,
  client: localized.optional(),
  campaign: localized.optional(),
  category,
  roles: z.array(role).min(1),
  year: z.number().int(),
  order: z.number().int(),
  featured: z.boolean().optional(),
  published: z.boolean(),
  summary: localized.optional(),
  description: localized.optional(),
  credits: z.array(z.object({ role: localized, name: z.string().min(1) })).min(1),
  specs: z
    .object({
      camera: z.string().optional(),
      lenses: z.string().optional(),
      format: z.string().optional(),
      aspectRatio: aspectRatio.optional(),
      grade: z.string().optional(),
      location: localized.optional(),
    })
    .optional(),
  video: z.object({
    fullPlaybackId: z.string().min(1),
    previewPlaybackId: z.string().min(1).optional(),
    previewStart: z.number().optional(),
    previewEnd: z.number().optional(),
    aspectRatio,
    durationSec: z.number().optional(),
    posterTime: z.number().optional(),
    /** Full-player ladder cap. Omitted projects stay at 1080p. */
    maxResolution: z.enum(MUX_RESOLUTIONS).optional(),
    /** Player poster width. Cards do not use this. */
    posterWidth: z.number().int().positive().optional(),
    /** Card still width. Omit to keep the layout size. */
    cardPosterWidth: z.number().int().positive().optional(),
    /** Play from 0 instead of the poster frame. */
    playFromStart: z.boolean().optional(),
    captions: z
      .array(z.object({ lang: z.enum(["en", "zh-tw"]), label: z.string() }))
      .optional(),
  }),
  poster: z.object({ src: z.string(), alt: localized }).optional(),
  stills: z
    .array(
      z.object({
        muxTime: z.number().optional(),
        src: z.string().optional(),
        alt: localized,
      }),
    )
    .optional(),
  awards: z.array(localized).optional(),
  links: z.array(z.object({ label: localized, href: z.string().url() })).optional(),
  accentColor: z.string().optional(),
  stillTimes: z.array(z.number().positive()).min(1).max(12).optional(),
});

const siteSchema = z.object({
  showreelSlug: z.string().min(1),
  chineseName: z.string().min(1),
  tagline: localized,
  description: localized,
  email: z.string(),
  socials: z.array(z.object({ label: localized, href: z.string().url() })),
  clients: z.array(z.object({ name: z.string(), src: z.string() })),
  about: localized,
  contact: localized,
});

export type FilmProject = z.infer<typeof projectSchema>;
export type FilmCategory = Exclude<FilmProject["category"], "showreel">;
export type FilmRole = "director" | "dp" | "editor";
export type FilmSite = z.infer<typeof siteSchema>;

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`filmmaking ${label} invalid\n${details}`);
  }
  return parsed.data;
}

const projects = parseOrThrow(z.array(projectSchema), projectsJson, "projects.json").slice().sort(
  (a, b) => a.order - b.order,
);
const slugs = new Set<string>();
for (const project of projects) {
  if (slugs.has(project.slug)) throw new Error(`filmmaking projects.json duplicate slug: ${project.slug}`);
  slugs.add(project.slug);
}

export const filmSite = parseOrThrow(siteSchema, siteJson, "site.json");

if (!projects.some((project) => project.slug === filmSite.showreelSlug)) {
  throw new Error(`filmmaking site.json showreelSlug not found: ${filmSite.showreelSlug}`);
}

export type ProjectCopy = {
  slug: string;
  title: string;
  client?: string;
  summary?: string;
  description?: string;
  year: number;
  category: FilmProject["category"];
  roles: FilmProject["roles"];
  order: number;
  aspectRatio: FilmProject["video"]["aspectRatio"];
  posterTime: number;
  playbackId: string;
  durationSec?: number;
  maxResolution: MuxResolution;
  posterWidth: number;
  cardPosterWidth?: number;
  previewClip?: { start: number; end: number };
  playFromStart: boolean;
  credits: { role: string; name: string }[];
  location?: string;
  camera?: string;
  lenses?: string;
  format?: string;
  grade?: string;
  stills: StillFrame[];
};

export type StillFrame = {
  time?: number;
  src?: string;
  alt: string;
};

function autoStillTimes(duration: number): number[] {
  const span = Math.max(duration, 1);
  const min = Math.max(1, span * 0.1);
  const max = Math.max(min, span * 0.9);
  return [0.2, 0.4, 0.6, 0.8].map((ratio) => {
    const time = Math.round(Math.min(max, Math.max(min, span * ratio)));
    return Math.max(1, time);
  });
}

function stillFrames(project: FilmProject, lang: FilmLang, title: string): StillFrame[] {
  const altAt = (index: number) =>
    lang === "zh-tw" ? `${title}，劇照 ${index}` : `${title}, still ${index}`;
  if (project.stills?.length) {
    return project.stills.flatMap((still, index): StillFrame[] => {
      const alt = t(still.alt, lang);
      if (still.src) return [{ src: still.src, time: still.muxTime, alt }];
      if (still.muxTime == null) return [];
      return [{ time: still.muxTime, alt: alt || altAt(index + 1) }];
    });
  }
  const times = project.stillTimes?.length
    ? project.stillTimes
    : autoStillTimes(project.video.durationSec ?? 48);
  return times.map((time, index) => ({ time, alt: altAt(index + 1) }));
}

function present(project: FilmProject, lang: FilmLang): ProjectCopy {
  return {
    slug: project.slug,
    title: t(project.title, lang),
    client: project.client ? creditName(t(project.client, lang), lang) : undefined,
    summary: project.summary ? t(project.summary, lang) : undefined,
    description: project.description ? t(project.description, lang) : undefined,
    year: project.year,
    category: project.category,
    roles: project.roles,
    order: project.order,
    aspectRatio: project.video.aspectRatio,
    posterTime: project.video.posterTime ?? 0,
    playbackId: project.video.fullPlaybackId,
    durationSec: project.video.durationSec,
    maxResolution: project.video.maxResolution ?? "1080p",
    posterWidth: project.video.posterWidth ?? 960,
    cardPosterWidth: project.video.cardPosterWidth,
    previewClip:
      project.video.previewStart != null && project.video.previewEnd != null
        ? { start: project.video.previewStart, end: project.video.previewEnd }
        : undefined,
    playFromStart: project.video.playFromStart ?? false,
    credits: project.credits.map((credit) => ({
      role: t(credit.role, lang),
      name: creditName(credit.name, lang),
    })),
    location: project.specs?.location ? t(project.specs.location, lang) : undefined,
    camera: project.specs?.camera,
    lenses: project.specs?.lenses,
    format: project.specs?.format,
    grade: project.specs?.grade,
    stills: stillFrames(project, lang, t(project.title, lang)),
  };
}

export function getProjects(lang: FilmLang): ProjectCopy[] {
  const showreel = projects.find((project) => project.slug === filmSite.showreelSlug);
  const rest = projects.filter(
    (project) =>
      project.published &&
      project.featured !== false &&
      project.slug !== filmSite.showreelSlug,
  );
  const ordered = [showreel, ...rest].filter((project): project is FilmProject =>
    Boolean(project?.published),
  );
  return ordered.map((project) => present(project, lang));
}

export function getProject(slug: string, lang: FilmLang): ProjectCopy | undefined {
  const project = projects.find((item) => item.slug === slug && item.published);
  return project ? present(project, lang) : undefined;
}

export function getAdjacent(slug: string): { prev: FilmProject | null; next: FilmProject | null } {
  const published = projects.filter((project) => project.published);
  const index = published.findIndex((project) => project.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: published[index - 1] ?? null,
    next: published[index + 1] ?? null,
  };
}

export function getAdjacentProjects(
  slug: string,
  lang: FilmLang,
): { prev: ProjectCopy | null; next: ProjectCopy | null } {
  const { prev, next } = getAdjacent(slug);
  return {
    prev: prev ? present(prev, lang) : null,
    next: next ? present(next, lang) : null,
  };
}

export function publishedSlugs(): string[] {
  return projects.filter((project) => project.published).map((project) => project.slug);
}

export function getShowreel(lang: FilmLang): ProjectCopy | undefined {
  return getProject(filmSite.showreelSlug, lang);
}
