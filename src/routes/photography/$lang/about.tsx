import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFoot } from "@/components/shell";
import { Frame } from "@/components/media";
import { getProject, photoById } from "@/content/queries";
import { experience, site } from "@/content/site";
import { isLang, t, type Lang } from "@/content/types";
import { pageHead } from "@/lib/seo";
import { heroPreload, photoSizes } from "@/content/photos";

export const Route = createFileRoute("/photography/$lang/about")({
  head: ({ params }) => {
    const lang: Lang = isLang(params.lang) ? params.lang : "en";
    const head = pageHead({
      title: `${t(site.aboutLabel, lang)} — ${site.name}`,
      description: t(site.aboutBio, lang),
      path: `/photography/${lang}/about`,
      lang,
      enPath: "/photography/en/about",
      zhPath: "/photography/zh-tw/about",
    });
    const support = getProject("yilan-mt-taiping");
    const photo = support ? photoById(support, "yilan-02") : undefined;
    const preload = heroPreload(photo?.src, photoSizes.about);
    return { meta: head.meta, links: preload ? [...head.links, preload] : head.links };
  },
  component: AboutPage,
});

function AboutPage() {
  const { lang } = Route.useParams();
  const current = (isLang(lang) ? lang : "en") as Lang;
  const support = getProject("yilan-mt-taiping");
  const photo = support ? photoById(support, "yilan-02") : undefined;
  return (
    <main id="content" className="page">
      <p className="page-kicker">{site.name}</p>
      <h1 className="page-title">{t(site.aboutLabel, current)}</h1>
      <div className="about-grid">
        <div className="about-copy">
          <p className="role-line">{t(site.role, current)}</p>
          <p className="lede">{t(site.aboutBio, current)}</p>
          <div className="experience">
            <h2>{t(site.experienceTitle, current)}</h2>
            {experience.length ? (
              <ul>
                {experience.map((item) => (
                  <li key={item.en}>{t(item, current)}</li>
                ))}
              </ul>
            ) : (
              <p className="awaiting">{t(site.experienceEmpty, current)}</p>
            )}
          </div>
          <p className="stack-links">
            <Link className="cta" to="/photography/$lang/work" params={{ lang: current }}>
              {t(site.viewWork, current)}
            </Link>
            <Link className="cta cta-quiet" to="/photography/$lang/contact" params={{ lang: current }}>
              {t(site.contactCta, current)}
            </Link>
          </p>
        </div>
        <div className="about-photos">
          {photo ? <Frame photo={photo} lang={current} priority sizes={photoSizes.about} /> : null}
          <p className="card-note">{t(site.selectedWork, current)}</p>
          <div className="frame portrait-slot">
            <div className="placeholder">
              <div>
                <strong>01</strong>
                <span>{t(site.portraitNote, current)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFoot lang={current} />
    </main>
  );
}
