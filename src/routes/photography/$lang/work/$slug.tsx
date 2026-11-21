import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProjectView } from "@/components/project-view";
import { getProject, photoById } from "@/content/queries";
import { site } from "@/content/site";
import { isLang, t, type Lang, type Project } from "@/content/types";
import { pageHead } from "@/lib/seo";
import { heroPreload, photoSizes } from "@/content/photos";

export const Route = createFileRoute("/photography/$lang/work/$slug")({
  beforeLoad: ({ params }) => {
    if (!getProject(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : "en";
    const project = getProject(params.slug);
    const title = project ? `${t(project.title, lang)} — ${site.name}` : site.name;
    const description = project ? t(project.description, lang) : "";
    const head = pageHead({
      title,
      description,
      path: `/photography/${lang}/work/${params.slug}`,
      lang,
      enPath: `/photography/en/work/${params.slug}`,
      zhPath: `/photography/zh-tw/work/${params.slug}`,
    });
    const preload = heroPreload(project ? leadSrc(project) : undefined, photoSizes.bleed);
    return { meta: head.meta, links: preload ? [...head.links, preload] : head.links };
  },
  component: ProjectPage,
});

function leadSrc(project: Project) {
  for (const section of project.layoutSections) {
    if ("imageId" in section && section.type === "hero") return photoById(project, section.imageId)?.src;
  }
  for (const section of project.layoutSections) {
    if ("imageId" in section) return photoById(project, section.imageId)?.src;
  }
  return undefined;
}

function ProjectPage() {
  const { lang, slug } = Route.useParams();
  const project = getProject(slug);
  if (!project) throw notFound();
  const current = (isLang(lang) ? lang : "en") as Lang;
  return (
    <main id="content">
      <ProjectView project={project} lang={current} />
    </main>
  );
}
