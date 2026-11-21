import { z } from "zod";
import { isLang, type Lang } from "@/content/types";
import enDictionary from "../dictionaries/en.json";
import zhDictionary from "../dictionaries/zh-tw.json";

export const locales = ["en", "zh-tw"] as const;
export const defaultLocale = "en" satisfies Lang;

export type FilmLang = Lang;

const roleSchema = z.object({
  director: z.string(),
  dp: z.string(),
  cinematographer: z.string(),
  editor: z.string(),
  colorist: z.string(),
  producer: z.string(),
});

const dictionarySchema = z.object({
  nav: z.object({
    work: z.string(),
    reel: z.string(),
    about: z.string(),
    contact: z.string(),
  }),
  photography: z.string(),
  filmmaking: z.string(),
  entrance: z.string(),
  skip: z.string(),
  menu: z.string(),
  close: z.string(),
  closePlayer: z.string(),
  inProgress: z.string(),
  notFoundTitle: z.string(),
  notFoundBody: z.string(),
  homeTitle: z.string(),
  play: z.string(),
  sound: z.string(),
  previous: z.string(),
  next: z.string(),
  viewProject: z.string(),
  credits: z.string(),
  client: z.string(),
  year: z.string(),
  rolesLabel: z.string(),
  specs: z.string(),
  stills: z.string(),
  nextProject: z.string(),
  previousProject: z.string(),
  camera: z.string(),
  lenses: z.string(),
  format: z.string(),
  grade: z.string(),
  aspect: z.string(),
  location: z.string(),
  duration: z.string(),
  aboutPosition: z.string(),
  aboutIntro: z.string(),
  aboutBackground: z.string(),
  aboutTags: z.string(),
  aboutRoles: z.array(z.string().min(1)).min(1).max(8),
  closing: z.string(),
  contactEmail: z.string().email(),
  contactCopy: z.string(),
  contactCopied: z.string(),
  filters: z.object({
    label: z.string(),
    all: z.string(),
    commercial: z.string(),
    musicVideo: z.string(),
    documentary: z.string(),
    narrative: z.string(),
    brandFilm: z.string(),
    event: z.string(),
    personal: z.string(),
    roles: z.string(),
    allRoles: z.string(),
    empty: z.string(),
  }),
  roles: roleSchema,
});

export type Dictionary = z.infer<typeof dictionarySchema>;

function readDictionary(data: unknown, name: string): Dictionary {
  const parsed = dictionarySchema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`filmmaking dictionary ${name} invalid\n${details}`);
  }
  return parsed.data;
}

const dictionaries: Record<FilmLang, Dictionary> = {
  en: readDictionary(enDictionary, "en"),
  "zh-tw": readDictionary(zhDictionary, "zh-tw"),
};

export function isFilmLang(value: string): value is FilmLang {
  return isLang(value);
}

export function getDictionary(lang: FilmLang): Dictionary {
  return dictionaries[lang];
}

type Localized = { en: string; "zh-tw"?: string };

export function t(copy: Localized, lang: FilmLang): string {
  if (lang === "zh-tw") {
    const zh = copy["zh-tw"]?.trim();
    if (zh) return zh;
    if (import.meta.env.DEV) console.warn(`[filmmaking] missing zh-tw for “${copy.en}”`);
    return copy.en;
  }
  return copy.en;
}
