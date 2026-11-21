import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { getDictionary, type FilmLang } from "../lib/i18n";
import "../lib/globals";
import { isCoarseMobile, whenIdleOrGesture } from "../lib/defer";
import { GrainOverlay } from "./GrainOverlay";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { LoadMark } from "@/components/load-mark";

function DeferredCursor() {
  const [Cursor, setCursor] = useState<ComponentType | null>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced || !fine) return;
    let live = true;
    const load = () => {
      import("./PlayCursor").then((mod) => {
        if (live) setCursor(() => mod.PlayCursor);
      });
    };
    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(load, { timeout: 800 });
      return () => {
        live = false;
        window.cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(load, 400);
    return () => {
      live = false;
      window.clearTimeout(id);
    };
  }, []);
  return Cursor ? <Cursor /> : null;
}

export function FilmShell({ lang }: { lang: FilmLang }) {
  const dictionary = getDictionary(lang);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const booted = useRef(false);
  useLayoutEffect(() => {
    const pending = window.__filmPending;
    window.__filmReady = true;
    document.documentElement.dataset.filmReady = "1";
    if (!pending || pending.lang !== lang) return;
    window.__filmPending = null;
    void navigate({
      to: "/filmmaking/$lang",
      params: { lang },
      search: { work: pending.slug },
      mask: {
        to: "/filmmaking/$lang/work/$slug",
        params: { lang, slug: pending.slug },
        unmaskOnReload: true,
      },
      resetScroll: false,
    });
  }, [lang, navigate]);

  useEffect(() => {
    const load = () => {
      void import("../lib/flip").then((mod) => mod.loadFlip());
    };
    const cancel = isCoarseMobile()
      ? whenIdleOrGesture(load)
      : (() => {
          const idle = window.requestIdleCallback?.(load, { timeout: 1200 });
          const timer = idle == null ? window.setTimeout(load, 1200) : 0;
          return () => {
            if (idle != null && window.cancelIdleCallback) window.cancelIdleCallback(idle);
            if (timer) window.clearTimeout(timer);
          };
        })();
    return () => {
      cancel();
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
    };
  }, []);

  useEffect(() => {
    if (!document.documentElement.dataset.filmMove) return;
    window.scrollTo(0, 0);
    const timer = window.setTimeout(() => {
      delete document.documentElement.dataset.filmMove;
    }, 800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      return;
    }
    window.scrollTo(0, 0);
    const timer = window.setTimeout(() => {
      delete document.documentElement.dataset.filmMove;
    }, 800);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="film-root" lang={lang === "zh-tw" ? "zh-Hant-TW" : "en"} data-theme="film">
      <a className="film-skip" href="#content">
        {dictionary.skip}
      </a>
      <SiteHeader lang={lang} />
      <Outlet />
      <SiteFooter lang={lang} />
      <GrainOverlay />
      <DeferredCursor />
      <LoadMark tone="dark" />
    </div>
  );
}
