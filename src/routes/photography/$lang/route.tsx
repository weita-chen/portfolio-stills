import { createFileRoute, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { isLang, type Lang } from "@/content/types";
import { langRedirect, preferredLang, withPreferredLang } from "@/lib/lang-pref";

export const Route = createFileRoute("/photography/$lang")({
  beforeLoad: async ({ params, location }) => {
    if (isLang(params.lang)) return;
    const lang = await preferredLang();
    const next = withPreferredLang("photography", location.pathname, lang);
    if (next === location.pathname.replace(/\/+$/, "")) throw notFound();
    throw langRedirect(next);
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  return <Shell lang={lang as Lang} />;
}
