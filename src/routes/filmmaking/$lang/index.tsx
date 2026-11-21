import { createFileRoute, notFound } from "@tanstack/react-router";
import type { LinkHTMLAttributes } from "react";
import { z } from "zod";
import { FilmFilters } from "@/features/filmmaking/components/FilmFilters";
import { FilmSplit } from "@/features/filmmaking/components/FilmSplit";
import { ProjectViewer } from "@/features/filmmaking/components/ProjectViewer";
import { WorkGrid } from "@/features/filmmaking/components/WorkGrid";
import { filmSite, getProjects, type FilmCategory, type FilmRole } from "@/features/filmmaking/lib/content";
import { captureGridFlip } from "@/features/filmmaking/lib/flip";
import { getDictionary, isFilmLang, t } from "@/features/filmmaking/lib/i18n";
import { HOME_LCP_SIZES, thumbSet } from "@/features/filmmaking/lib/mux";
import { pageTitle } from "@/features/filmmaking/lib/name";
import { filmHead, muxOgImage } from "@/features/filmmaking/lib/seo";

const categoryFilter = z.enum([
  "commercial",
  "music-video",
  "documentary",
  "narrative",
  "brand-film",
  "event",
  "personal",
]);
const roleFilter = z.enum(["director", "dp", "editor"]);

export const Route = createFileRoute("/filmmaking/$lang/")({
  validateSearch: (search: Record<string, unknown>) => {
    const work = typeof search.work === "string" && search.work.length > 0 ? search.work : undefined;
    const category = categoryFilter.safeParse(search.category);
    const role = roleFilter.safeParse(search.role);
    return {
      ...(work ? { work } : {}),
      ...(category.success ? { category: category.data } : {}),
      ...(role.success ? { role: role.data } : {}),
    };
  },
  loader: ({ params }) => {
    if (!isFilmLang(params.lang)) throw notFound();
    return { projects: getProjects(params.lang) };
  },
  head: ({ params, loaderData }) => {
    const lang = isFilmLang(params.lang) ? params.lang : "en";
    const title = pageTitle(lang === "zh-tw" ? "影像作品" : "Filmmaking", lang);
    const first = loaderData?.projects[0];
    const head = filmHead({
      title,
      description: t(filmSite.description, lang),
      path: `/filmmaking/${lang}`,
      lang,
      image: first ? muxOgImage(first.playbackId, first.posterTime) : undefined,
      imageAlt: first?.title,
    });
    const links: Array<LinkHTMLAttributes<HTMLLinkElement>> = [...head.links];
    if (first) {
      const poster = thumbSet(first.playbackId, first.posterTime, HOME_LCP_SIZES);
      links.push({
        rel: "preload",
        as: "image",
        href: poster.src,
        imageSrcSet: poster.srcSet,
        imageSizes: poster.sizes,
        fetchPriority: "high",
      });
    }
    return { meta: head.meta, links, scripts: head.scripts };
  },
  component: FilmHome,
});

function FilmHome() {
  const { lang } = Route.useParams();
  const { work, role, category } = Route.useSearch();
  const navigate = Route.useNavigate();
  if (!isFilmLang(lang)) throw notFound();
  const { projects } = Route.useLoaderData();
  const dictionary = getDictionary(lang);
  const showreel = projects.find((project) => project.slug === filmSite.showreelSlug);
  const rest = projects.filter((project) => project.slug !== filmSite.showreelSlug);
  const filtered = rest.filter((project) => {
    if (category && project.category !== category) return false;
    if (role && !project.roles.includes(role)) return false;
    return true;
  });
  const visible = showreel ? [showreel, ...filtered] : filtered;
  const project = work ? projects.find((item) => item.slug === work) : undefined;
  const setCategory = (next?: FilmCategory) => {
    captureGridFlip(document.querySelector(".film-grid"));
    void navigate({
      search: (prev) => ({ ...prev, category: next }),
      resetScroll: false,
      replace: true,
    });
  };
  const setRole = (next?: FilmRole) => {
    captureGridFlip(document.querySelector(".film-grid"));
    void navigate({
      search: (prev) => ({ ...prev, role: next }),
      resetScroll: false,
      replace: true,
    });
  };
  return (
    <main id="content" className="film-home">
      <FilmSplit as="h1" className="film-home-title">
        {dictionary.homeTitle}
      </FilmSplit>
      <FilmFilters lang={lang} category={category} role={role} onCategory={setCategory} onRole={setRole} />
      <WorkGrid projects={visible} lang={lang} suspended={Boolean(project)} />
      {category || role ? filtered.length === 0 ? <p className="film-filter-empty">{dictionary.filters.empty}</p> : null : null}
      {project ? <ProjectViewer project={project} projects={visible} lang={lang} /> : null}
    </main>
  );
}
