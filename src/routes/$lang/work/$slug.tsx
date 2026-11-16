import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProjectView } from "@/components/project-view";
import { getProject } from "@/content/queries";
import { site } from "@/content/site";
import { isLang, t, type Lang } from "@/content/types";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$lang/work/$slug")({
  beforeLoad: ({ params }) => {
    if (!getProject(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : "en";
    const project = getProject(params.slug);
    const title = project ? `${t(project.title, lang)} — ${site.name}` : site.name;
    const description = project ? t(project.description, lang) : "";
    return pageHead({
      title,
      description,
      path: `/${lang}/work/${params.slug}`,
      lang,
      enPath: `/en/work/${params.slug}`,
      zhPath: `/zh-tw/work/${params.slug}`,
    });
  },
  component: ProjectPage,
});

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
