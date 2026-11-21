import { createFileRoute, notFound } from "@tanstack/react-router";
import { FilmSplit } from "@/features/filmmaking/components/FilmSplit";
import { getDictionary, isFilmLang } from "@/features/filmmaking/lib/i18n";
import { displayName, pageTitle } from "@/features/filmmaking/lib/name";
import { filmHead, personObject } from "@/features/filmmaking/lib/seo";

export const Route = createFileRoute("/filmmaking/$lang/about")({
  head: ({ params }) => {
    const lang = isFilmLang(params.lang) ? params.lang : "en";
    const dictionary = getDictionary(lang);
    const path = `/filmmaking/${lang}/about`;
    return filmHead({
      title: pageTitle(lang === "zh-tw" ? "關於" : "About", lang),
      description: dictionary.aboutIntro,
      path,
      lang,
      jsonLd: personObject({
        lang,
        path,
        email: dictionary.contactEmail,
        jobTitle: dictionary.aboutRoles,
      }),
    });
  },
  component: AboutPage,
});

function AboutPage() {
  const { lang } = Route.useParams();
  if (!isFilmLang(lang)) throw notFound();
  const dictionary = getDictionary(lang);
  return (
    <main id="content" className="film-page">
      <section>
        <p className="film-kicker">{dictionary.nav.about}</p>
        <h1 className="film-page-position">
          <FilmSplit as="span" className="film-page-name">
            {displayName(lang)}
          </FilmSplit>
          <span className="film-page-roles">
            {dictionary.aboutRoles.map((role) => (
              <span className="film-role" key={role}>
                {role}
              </span>
            ))}
          </span>
        </h1>
        <p className="film-page-lede">{dictionary.aboutIntro}</p>
        <p className="film-page-body">{dictionary.aboutBackground}</p>
        <p className="film-tags">{dictionary.aboutTags}</p>
      </section>
      <section className="film-about-close">
        <p>{dictionary.closing}</p>
        <a className="film-contact-mail" href={`mailto:${dictionary.contactEmail}`}>
          {dictionary.contactEmail}
        </a>
      </section>
    </main>
  );
}
