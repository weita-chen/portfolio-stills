import { useRouterState } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getDictionary, type FilmLang } from "../lib/i18n";
import { BrandMark } from "./BrandMark";
import { FilmLink } from "./FilmLink";
import { LangSwitch } from "./LangSwitch";
import { RoomSwitch } from "./RoomSwitch";

type NavId = "work" | "reel" | "about" | "contact";

export function SiteHeader({ lang }: { lang: FilmLang }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const dictionary = getDictionary(lang);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const seenPath = useRef<string | null>(null);
  const base = `/filmmaking/${lang}`;

  const current = (id: NavId) => {
    if (id === "work") return pathname === base || pathname === `${base}/` || pathname.startsWith(`${base}/work`);
    return pathname === `${base}/${id}` || pathname.startsWith(`${base}/${id}/`);
  };

  useLayoutEffect(() => {
    if (window.__filmMenu) setOpen(true);
  }, []);

  useEffect(() => {
    if (open) window.__filmMenu = false;
  }, [open]);

  useEffect(() => {
    if (seenPath.current === pathname) return;
    const first = seenPath.current == null;
    seenPath.current = pathname;
    if (first) return;
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      if (open) return;
      const y = window.scrollY;
      if (y > last + 6 && y > 80) setHidden(true);
      else if (y < last - 6 || y < 12) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const toggle = toggleRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const root = document.getElementById("film-menu");
      if (!root) return;
      const items = [...root.querySelectorAll<HTMLElement>("a, button")].filter(
        (node) => !node.hasAttribute("disabled"),
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const links = (onNavigate?: () => void) => (
    <>
      <FilmLink
        to="/filmmaking/$lang"
        params={{ lang }}
        search={{ work: undefined }}
        activeOptions={{ exact: true, includeSearch: false }}
        aria-current={current("work") ? "page" : undefined}
        onClick={() => onNavigate?.()}
      >
        {dictionary.nav.work}
      </FilmLink>
      <FilmLink to="/filmmaking/$lang/reel" params={{ lang }} aria-current={current("reel") ? "page" : undefined} onClick={() => onNavigate?.()}>
        {dictionary.nav.reel}
      </FilmLink>
      <FilmLink to="/filmmaking/$lang/about" params={{ lang }} aria-current={current("about") ? "page" : undefined} onClick={() => onNavigate?.()}>
        {dictionary.nav.about}
      </FilmLink>
      <FilmLink to="/filmmaking/$lang/contact" params={{ lang }} aria-current={current("contact") ? "page" : undefined} onClick={() => onNavigate?.()}>
        {dictionary.nav.contact}
      </FilmLink>
    </>
  );

  return (
    <>
      <header className="film-header" data-hidden={hidden && !open ? "true" : "false"} data-menu={open ? "open" : "closed"}>
        <div className="film-header-bar">
          <BrandMark lang={lang} />
          <button
            ref={toggleRef}
            type="button"
            className="film-menu-btn"
            aria-expanded={open}
            aria-controls="film-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? dictionary.close : dictionary.menu}
          </button>
        </div>
        <div className="film-tools" id="film-tools">
          <RoomSwitch lang={lang} />
          <nav className="film-nav" aria-label={lang === "zh-tw" ? "主要" : "Primary"}>
            {links()}
          </nav>
          <LangSwitch lang={lang} />
        </div>
      </header>
      {open ? (
        <div className="film-menu" id="film-menu" role="dialog" aria-modal="true" aria-label={dictionary.menu}>
          <button ref={closeRef} type="button" className="film-menu-close" onClick={() => setOpen(false)}>
            {dictionary.close}
          </button>
          <nav className="film-menu-nav" aria-label={lang === "zh-tw" ? "主要" : "Primary"}>
            {links(() => setOpen(false))}
          </nav>
          <div className="film-menu-meta">
            <RoomSwitch lang={lang} />
            <LangSwitch lang={lang} />
          </div>
        </div>
      ) : null}
    </>
  );
}
