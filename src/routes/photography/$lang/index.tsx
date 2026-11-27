import { createFileRoute, Link } from "@tanstack/react-router";
import { Slideshow } from "@/components/media";
import { heroSlideshow } from "@/content/queries";
import { site } from "@/content/site";
import { isLang, t, type Lang } from "@/content/types";
import { pageHead } from "@/lib/seo";
import { heroPreload, photoSizes } from "@/content/photos";

export const Route = createFileRoute("/photography/$lang/")({
  head: ({ params }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : "en";
    const description = t(site.lede, lang);
    const head = pageHead({
      title: `${site.name} — ${t(site.role, lang)}`,
      description,
      path: `/photography/${lang}`,
      lang,
      enPath: "/photography/en",
      zhPath: "/photography/zh-tw",
    });
    const preload = heroPreload(heroSlideshow()[0]?.src, photoSizes.bleed);
    return { meta: head.meta, links: preload ? [...head.links, preload] : head.links };
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
          <img className="brand-logo" src="/brand/logo-design-01.png" alt="WEITA CHEN" fetchPriority="low" decoding="async" />
        </h1>
        <p className="role-line">{t(site.role, current)}</p>
        <p className="lede">{t(site.lede, current)}</p>
        <p className="cta-row">
          <Link className="cta" to="/photography/$lang/work" params={{ lang: current }}>
            {t(site.viewWork, current)}
          </Link>
          <Link className="cta cta-quiet" to="/photography/$lang/contact" params={{ lang: current }}>
            {t(site.contactCta, current)}
          </Link>
        </p>
        <p className="films-invite">
          {t(site.filmsInvite, current)}{" "}
          <a href={`/filmmaking/${current}`}>{t(site.filmsInviteLink, current)}</a>
        </p>
      </div>
    </main>
  );
}
