import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { langKey } from "@/content/site";
import "@/features/filmmaking/styles/film.css";
import { filmSite } from "@/features/filmmaking/lib/content";
import type { FilmLang } from "@/features/filmmaking/lib/i18n";
import { displayName } from "@/features/filmmaking/lib/name";
import { FILM_ORIGIN } from "@/features/filmmaking/lib/seo";

export const Route = createFileRoute("/filmmaking/")({
  head: () => ({
    meta: [
      { title: `Filmmaking — ${displayName("en")}` },
      { name: "description", content: `${filmSite.description.en} ${filmSite.description["zh-tw"] ?? ""}`.trim() },
      { property: "og:title", content: `Filmmaking — ${displayName("en")}` },
      { property: "og:description", content: filmSite.description.en },
      { property: "og:url", content: `${FILM_ORIGIN}/filmmaking` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: `Filmmaking — ${displayName("en")}` },
    ],
    links: [
      { rel: "canonical", href: `${FILM_ORIGIN}/filmmaking` },
      { rel: "alternate", hrefLang: "en", href: `${FILM_ORIGIN}/filmmaking/en` },
      { rel: "alternate", hrefLang: "zh-tw", href: `${FILM_ORIGIN}/filmmaking/zh-tw` },
      { rel: "alternate", hrefLang: "zh-Hant", href: `${FILM_ORIGIN}/filmmaking/zh-tw` },
      { rel: "alternate", hrefLang: "x-default", href: `${FILM_ORIGIN}/filmmaking/en` },
    ],
    scripts: [
      {
        children: `try{var l=localStorage.getItem("${langKey}");var n=l==="zh-tw"||l==="en"?l:"";if(!n){var ls=navigator.languages||[navigator.language||""];n=ls.some(function(x){return/^zh/i.test(String(x));})?"zh-tw":"en";}var p=location.pathname.replace(/\\/$/,"");if(p==="/filmmaking")location.replace("/filmmaking/"+n);}catch(e){}`,
      },
    ],
  }),
  component: FilmLanguageGate,
});

function preferredLang(): FilmLang {
  try {
    const saved = localStorage.getItem(langKey);
    if (saved === "zh-tw" || saved === "en") return saved;
    const languages = navigator.languages ?? [navigator.language ?? ""];
    if (languages.some((language) => /^zh/i.test(language))) return "zh-tw";
  } catch {
    /* ignore */
  }
  return "en";
}

function FilmLanguageGate() {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    void navigate({ to: "/filmmaking/$lang", params: { lang: preferredLang() }, replace: true });
  }, [navigate]);

  return (
    <div className="film-root" lang="en" data-theme="film">
      <main className="film-placeholder">
        <p className="film-kicker">WEITA CHEN</p>
        <h1>Filmmaking</h1>
        <p>影像</p>
        <p className="film-inline-links">
          <Link to="/filmmaking/$lang" params={{ lang: "en" }}>
            English
          </Link>
          <Link to="/filmmaking/$lang" params={{ lang: "zh-tw" }}>
            中文
          </Link>
        </p>
      </main>
    </div>
  );
}
