import type { FilmLang } from "./i18n";

/** The only display name. English pages use the Latin form; zh-tw uses the Chinese form. */
export const DISPLAY_NAME: Record<FilmLang, string> = {
  en: "Weita Chen",
  "zh-tw": "陳韋達",
};

export function displayName(lang: FilmLang): string {
  return DISPLAY_NAME[lang];
}

export function pageTitle(label: string, lang: FilmLang): string {
  const name = displayName(lang);
  return lang === "zh-tw" ? `${label}｜${name}` : `${label} — ${name}`;
}

const ARTIST = /^weita\s*chen$/i;

export function creditName(name: string, lang: FilmLang): string {
  const compact = name.replace(/\s+/g, " ").trim();
  if (ARTIST.test(compact) || compact.replace(/\s+/g, "").toLowerCase() === "weitachen") {
    return displayName(lang);
  }
  return name;
}
