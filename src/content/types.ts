export type Lang = "en" | "zh-tw";

export type Copy = {
  en: string;
  "zh-TW": string;
};

export type Photo = {
  id: string;
  /** Public path. Omitted while the frame is still a placeholder. */
  src?: string;
  width: number;
  height: number;
  alt: Copy;
  caption?: Copy;
  objectPosition?: string;
  placeholder?: boolean;
  /** Original Drive file, kept so replacements stay traceable. */
  drive?: { fileId: string; name: string };
};

export type LayoutSection =
  | { type: "hero"; imageId: string }
  | { type: "intro" }
  | { type: "full"; imageId: string }
  | { type: "single"; imageId: string; align?: "left" | "center" | "right" }
  | { type: "pair"; imageIds: [string, string]; offset?: "left" | "right" }
  | {
      type: "asymmetric";
      imageIds: [string, string];
      emphasis?: "left" | "right";
    }
  | { type: "text"; body: Copy };

export type Project = {
  id: string;
  slug: string;
  title: Copy;
  description: Copy;
  coverImage: string;
  images: Photo[];
  year?: string;
  client?: Copy;
  role?: Copy;
  location?: Copy;
  category?: Copy;
  /** Extra categories. The filter reads this plus `category`. */
  categories?: Copy[];
  layoutSections: LayoutSection[];
  order: number;
  published: boolean;
  /** True when photographs or final copy are not in the source folder yet. */
  awaiting?: boolean;
  index: { span: 1 | 2; shift?: boolean };
  driveFolderId?: string;
};

export const LANGS: Lang[] = ["en", "zh-tw"];

export function isLang(value: string): value is Lang {
  return value === "en" || value === "zh-tw";
}

export function t(copy: Copy, lang: Lang): string {
  return lang === "zh-tw" ? copy["zh-TW"] : copy.en;
}

export function localizePath(pathname: string, lang: Lang): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "en" || parts[0] === "zh-tw") parts[0] = lang;
  else parts.unshift(lang);
  return `/${parts.join("/")}`;
}
