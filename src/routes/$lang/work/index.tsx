import { createFileRoute } from "@tanstack/react-router";
import { WorkGrid } from "@/components/work-grid";
import { site } from "@/content/site";
import { isLang, t, type Lang } from "@/content/types";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$lang/work/")({
  head: ({ params }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : "en";
    return pageHead({
      title: `${t(site.workLabel, lang)} — ${site.name}`,
      description: t(site.workIntro, lang),
      path: `/${lang}/work`,
      lang,
      enPath: "/en/work",
      zhPath: "/zh-tw/work",
    });
  },
  component: WorkPage,
});

function WorkPage() {
  const { lang } = Route.useParams();
  const current = (isLang(lang) ? lang : "en") as Lang;
  return (
    <main id="content" className="work-page">
      <h1 className="sr">{t(site.workLabel, current)}</h1>
      <WorkGrid lang={current} />
    </main>
  );
}
