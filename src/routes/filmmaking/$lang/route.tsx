import { createFileRoute, notFound } from "@tanstack/react-router";
import { FilmNotFound } from "@/features/filmmaking/components/FilmNotFound";
import { FilmShell } from "@/features/filmmaking/components/FilmShell";
import { isFilmLang } from "@/features/filmmaking/lib/i18n";
import { filmFonts } from "@/features/filmmaking/lib/seo";
import { langRedirect, preferredLang, withPreferredLang } from "@/lib/lang-pref";
import "@/features/filmmaking/styles/film.css";

export const Route = createFileRoute("/filmmaking/$lang")({
  beforeLoad: async ({ params, location }) => {
    if (isFilmLang(params.lang)) return;
    const lang = await preferredLang();
    const next = withPreferredLang("filmmaking", location.pathname, lang);
    if (next === location.pathname.replace(/\/+$/, "")) throw notFound();
    throw langRedirect(next);
  },
  head: () => ({
    links: filmFonts,
    scripts: [
      {
        children: `(function(){function arm(e){var t=e.target&&e.target.closest&&e.target.closest(".film-card");if(t)window.__filmGesture=Date.now();}document.addEventListener("pointerdown",arm,true);document.addEventListener("click",function(e){if(window.__filmReady)return;var btn=e.target&&e.target.closest&&e.target.closest("button.film-menu-btn");if(btn){window.__filmMenu=true;return;}var a=e.target&&e.target.closest&&e.target.closest("a.film-card-hit");if(!a)return;if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var href=a.getAttribute("href")||"";var m=href.match(/\\/filmmaking\\/(en|zh-tw)\\/work\\/([^/?#]+)/);if(!m)return;e.preventDefault();e.stopPropagation();window.__filmPending={lang:m[1],slug:decodeURIComponent(m[2])};},true);function enablePrintFonts(){var links=document.querySelectorAll('link[rel="stylesheet"][media="print"]');for(var i=0;i<links.length;i++){if((links[i].href||"").indexOf("JetBrains")===-1)continue;(function(link){var apply=function(){link.media="all";};if(link.sheet)apply();else link.addEventListener("load",apply);})(links[i]);}}if(document.readyState==="complete")enablePrintFonts();else setTimeout(enablePrintFonts,0);})();`,
      },
    ],
  }),
  component: FilmLangLayout,
  notFoundComponent: FilmLangNotFound,
});

function FilmLangLayout() {
  const { lang } = Route.useParams();
  if (!isFilmLang(lang)) throw notFound();
  return <FilmShell lang={lang} />;
}

function FilmLangNotFound() {
  const params = Route.useParams();
  return <FilmNotFound lang={params.lang} />;
}
