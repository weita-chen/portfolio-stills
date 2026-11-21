import { getDictionary, isFilmLang, type FilmLang } from "../lib/i18n";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function FilmNotFound({ lang = "en" }: { lang?: string }) {
  const current: FilmLang = isFilmLang(lang) ? lang : "en";
  const dictionary = getDictionary(current);
  return (
    <div className="film-root" lang={current === "zh-tw" ? "zh-Hant-TW" : "en"} data-theme="film">
      <a className="film-skip" href="#content">
        {dictionary.skip}
      </a>
      <SiteHeader lang={current} />
      <main id="content" className="film-placeholder">
        <p className="film-kicker">404</p>
        <h1>{dictionary.notFoundTitle}</h1>
        <p>{dictionary.notFoundBody}</p>
        <p className="film-inline-links">
          <a href={`/filmmaking/${current}`}>{dictionary.nav.work}</a>
        </p>
      </main>
      <SiteFooter lang={current} />
    </div>
  );
}
