import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { site } from "@/content/site";
import { isLang, localizePath, t, type Lang } from "@/content/types";
import { LoadMark } from "@/components/load-mark";
import { rememberLang } from "@/lib/lang-pref";

export function Shell({ lang }: { lang: Lang }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const other: Lang = lang === "en" ? "zh-tw" : "en";

  useEffect(() => {
    const onFilter = (event: Event) => {
      const next = Boolean((event as CustomEvent<boolean>).detail);
      setFilterOpen(next);
      if (next) setOpen(false);
    };
    window.addEventListener("weita:work-filter", onFilter);
    return () => window.removeEventListener("weita:work-filter", onFilter);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (id: string) => {
    const base = `/photography/${lang}`;
    if (id === "home") return pathname === base || pathname === `${base}/`;
    return pathname === `${base}/${id}` || pathname.startsWith(`${base}/${id}/`);
  };

  const isHome = pathname === `/photography/${lang}` || pathname === `/photography/${lang}/`;

  return (
    <div className="frame-root" data-home={isHome ? "true" : "false"} data-menu={open ? "open" : "closed"}>
      <a className="skip" href="#content">
        {t(site.skip, lang)}
      </a>
      <a className="home-mark" href="/" aria-label={t(site.homeLabel, lang)}>
        <img src="/brand/icon-white.png" alt="" fetchPriority="low" decoding="async" />
      </a>
      <nav className="lang-switch" aria-label={lang === "zh-tw" ? "語言" : "Language"}>
        <LangAnchor pathname={pathname} next="zh-tw" current={lang}>
          中文
        </LangAnchor>
        <span aria-hidden="true">/</span>
        <LangAnchor pathname={pathname} next="en" current={lang}>
          EN
        </LangAnchor>
      </nav>
      <div className="page-shift">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </div>
      <div
        className="menu-root"
        data-open={open ? "true" : "false"}
        data-filter={filterOpen ? "true" : "false"}
      >
        {open ? (
          <button
            type="button"
            className="menu-catch"
            aria-label={t(site.closeMenu, lang)}
            onClick={() => setOpen(false)}
          />
        ) : null}
        <div
          className="menu-panel"
          id="site-menu"
          aria-hidden={!open}
          inert={!open}
        >
          <nav className="menu-nav" aria-label={lang === "zh-tw" ? "主要" : "Primary"}>
            <Link to="/photography/$lang" params={{ lang }} aria-current={current("home") ? "page" : undefined} onClick={() => setOpen(false)}>
              {t(site.homeLabel, lang)}
            </Link>
            <Link to="/photography/$lang/work" params={{ lang }} aria-current={current("work") ? "page" : undefined} onClick={() => setOpen(false)}>
              {t(site.workLabel, lang)}
            </Link>
            <Link to="/photography/$lang/about" params={{ lang }} aria-current={current("about") ? "page" : undefined} onClick={() => setOpen(false)}>
              {t(site.aboutLabel, lang)}
            </Link>
            <Link to="/photography/$lang/contact" params={{ lang }} aria-current={current("contact") ? "page" : undefined} onClick={() => setOpen(false)}>
              {t(site.contactLabel, lang)}
            </Link>
          </nav>
        </div>
        <span className="menu-close-label" aria-hidden="true">
          {t(site.close, lang)}
        </span>
        <button
          type="button"
          className="menu-trigger"
          aria-expanded={filterOpen || open}
          aria-controls={filterOpen ? "work-filter" : "site-menu"}
          aria-label={
            filterOpen ? t(site.close, lang) : open ? t(site.closeMenu, lang) : t(site.menu, lang)
          }
          onClick={() => {
            if (filterOpen) {
              window.dispatchEvent(new Event("weita:work-filter-close"));
              return;
            }
            setOpen((value) => !value);
          }}
        />
      </div>
      <span className="sr">{other}</span>
      <LoadMark tone={isHome ? "light" : "dark"} />
    </div>
  );
}

function LangAnchor({
  pathname,
  next,
  current,
  children,
}: {
  pathname: string;
  next: Lang;
  current: Lang;
  children: string;
}) {
  const href = localizePath(pathname, next);
  return (
    <a
      href={href}
      hrefLang={next === "zh-tw" ? "zh-Hant" : "en"}
      aria-current={current === next ? "true" : undefined}
      onClick={() => {
        if (isLang(next)) rememberLang(next);
      }}
    >
      {children}
    </a>
  );
}

export function SiteFoot({ lang }: { lang: Lang }) {
  return (
    <footer className="site-foot">
      <span>{site.name}</span>
      <span>{t(site.role, lang)}</span>
    </footer>
  );
}
