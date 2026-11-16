import { siteOrigin } from "@/content/site";
import type { Lang } from "@/content/types";

export function pageHead(opts: {
  title: string;
  description: string;
  path: string;
  lang: Lang;
  enPath: string;
  zhPath: string;
}) {
  const links: Array<{ rel: string; href: string; hrefLang?: string }> = [];
  if (siteOrigin) {
    links.push({ rel: "canonical", href: `${siteOrigin}${opts.path}` });
    links.push({
      rel: "alternate",
      hrefLang: "en",
      href: `${siteOrigin}${opts.enPath}`,
    });
    links.push({
      rel: "alternate",
      hrefLang: "zh-Hant",
      href: `${siteOrigin}${opts.zhPath}`,
    });
    links.push({
      rel: "alternate",
      hrefLang: "x-default",
      href: `${siteOrigin}${opts.enPath}`,
    });
  }
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { name: "language", content: opts.lang === "zh-tw" ? "zh-Hant" : "en" },
    ],
    links,
  };
}
