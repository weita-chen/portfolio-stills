import { publishedProjects } from "@/content/queries";
import { publishedSlugs } from "@/features/filmmaking/lib/content";
import { FILM_ORIGIN } from "@/features/filmmaking/lib/seo";

function xml(value: string): string {
  return value.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

/** Public URLs for the entrance, photography room, and filmmaking room. */
export function sitemapXml(): string {
  const langs = ["en", "zh-tw"] as const;
  const urls: string[] = [`${FILM_ORIGIN}/`, `${FILM_ORIGIN}/photography`, `${FILM_ORIGIN}/filmmaking`];
  const photos = publishedProjects();
  const films = publishedSlugs();
  for (const lang of langs) {
    urls.push(
      `${FILM_ORIGIN}/photography/${lang}`,
      `${FILM_ORIGIN}/photography/${lang}/about`,
      `${FILM_ORIGIN}/photography/${lang}/contact`,
      `${FILM_ORIGIN}/photography/${lang}/work`,
    );
    for (const project of photos) urls.push(`${FILM_ORIGIN}/photography/${lang}/work/${project.slug}`);
    urls.push(
      `${FILM_ORIGIN}/filmmaking/${lang}`,
      `${FILM_ORIGIN}/filmmaking/${lang}/reel`,
      `${FILM_ORIGIN}/filmmaking/${lang}/about`,
      `${FILM_ORIGIN}/filmmaking/${lang}/contact`,
    );
    for (const slug of films) urls.push(`${FILM_ORIGIN}/filmmaking/${lang}/work/${slug}`);
  }
  const body = urls.map((loc) => `  <url><loc>${xml(loc)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
