import { createFileRoute, Link } from "@tanstack/react-router";
import { Slideshow } from "@/components/media";
import { heroSlideshow } from "@/content/queries";
import { site } from "@/content/site";
import { isLang, t, type Lang } from "@/content/types";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : "en";
    const description = t(site.lede, lang);
    return pageHead({
      title: `${site.name} — ${t(site.role, lang)}`,
      description,
      path: `/${lang}`,
      lang,
      enPath: "/en",
      zhPath: "/zh-tw",
    });
  },
  component: Home,
});

function Home() {
  const { lang } = Route.useParams();
  const current = (isLang(lang) ? lang : "en") as Lang;
  const slides = heroSlideshow();
  return (
    <main id="content" className="hero">
      <div className="hero-media">
        <Slideshow slides={slides} lang={current} />
      </div>
      <div className="hero-copy">
        <h1 className="display-name">
          <img className="brand-logo" src="/brand/logo-design-01.png" alt="WEITA CHEN" />
        </h1>
        <p className="role-line">{t(site.role, current)}</p>
        <p className="lede">{t(site.lede, current)}</p>
        <p className="cta-row">
          <Link className="cta" to="/$lang/work" params={{ lang: current }}>
            {t(site.viewWork, current)}
          </Link>
          <Link className="cta cta-quiet" to="/$lang/contact" params={{ lang: current }}>
            {t(site.contactCta, current)}
          </Link>
        </p>
      </div>
    </main>
  );
}
