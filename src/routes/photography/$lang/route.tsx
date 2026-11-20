import { createFileRoute, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { isLang, type Lang } from "@/content/types";

export const Route = createFileRoute("/photography/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  return <Shell lang={lang as Lang} />;
}
