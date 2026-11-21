import { useRouter, useRouterState } from "@tanstack/react-router";
import { rememberLang } from "@/lib/lang-pref";
import { localizePath } from "@/content/types";
import type { FilmLang } from "../lib/i18n";
import { classifyMove, playFilmExit } from "../lib/transition";

export function LangSwitch({ lang }: { lang: FilmLang }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <nav className="film-lang" aria-label={lang === "zh-tw" ? "語言" : "Language"}>
      <LangLink pathname={pathname} current={lang} target="zh-tw">
        中文
      </LangLink>
      <span aria-hidden="true">/</span>
      <LangLink pathname={pathname} current={lang} target="en">
        EN
      </LangLink>
    </nav>
  );
}

function LangLink({
  pathname,
  current,
  target,
  children,
}: {
  pathname: string;
  current: FilmLang;
  target: FilmLang;
  children: string;
}) {
  const router = useRouter();
  const href = localizePath(pathname, target);
  return (
    <a
      href={href}
      hrefLang={target === "zh-tw" ? "zh-Hant" : "en"}
      aria-current={current === target ? "true" : undefined}
      onClick={(event) => {
        rememberLang(target);
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (current === target) return;
        const kind = classifyMove(window.location.pathname, href);
        if (kind === "external") return;
        event.preventDefault();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const move = reduced ? "reduced" : kind;
        document.documentElement.dataset.filmMove = move;
        void playFilmExit(move)
          .catch(() => undefined)
          .then(() => router.navigate({ href }));
      }}
    >
      {children}
    </a>
  );
}
