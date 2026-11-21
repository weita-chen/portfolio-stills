import { Link, useRouter } from "@tanstack/react-router";
import type { ComponentProps, MouseEvent } from "react";
import { classifyMove, playFilmExit } from "../lib/transition";

function FilmLinkImpl({ onClick, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  return (
    <Link
      {...props}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = event.currentTarget;
        if (anchor.target === "_blank" || anchor.hasAttribute("data-no-transition")) return;
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        const dest = `${url.pathname}${url.search}`;
        if (dest === `${window.location.pathname}${window.location.search}`) return;
        const kind = classifyMove(window.location.pathname, url.pathname);
        if (kind === "external") return;
        event.preventDefault();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const move = reduced ? "reduced" : kind;
        document.documentElement.dataset.filmMove = move;
        void playFilmExit(move)
          .catch(() => undefined)
          .then(() => router.navigate({ href: dest }));
      }}
    />
  );
}

export const FilmLink = FilmLinkImpl as typeof Link;
