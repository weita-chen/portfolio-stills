import { useEffect, useRef } from "react";
import { filmSite } from "../lib/content";
import { getDictionary, t, type FilmLang } from "../lib/i18n";
import { displayName } from "../lib/name";
import { whenIdleOrGesture } from "../lib/defer";
import { FilmLink } from "./FilmLink";

function graphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((part) => part.segment);
  }
  return Array.from(text);
}

export function SiteFooter({ lang }: { lang: FilmLang }) {
  const dictionary = getDictionary(lang);
  const year = new Date().getFullYear();
  const line = useRef<HTMLParagraphElement>(null);
  const tagline = t(filmSite.tagline, lang);

  useEffect(() => {
    const node = line.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let live = true;
    let cancel = () => {};
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        cancel = whenIdleOrGesture(() => {
          if (!live) return;
          void import("../lib/gsap").then(({ gsap }) => {
            if (!live) return;
            gsap.from(node.querySelectorAll(".film-footer-char"), {
              yPercent: 40,
              duration: 0.6,
              ease: "expo.out",
              stagger: 0.03,
            });
          });
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => {
      live = false;
      cancel();
      observer.disconnect();
    };
  }, [tagline]);

  return (
    <footer className="film-footer">
      <p className="film-footer-line" ref={line}>
        {tagline.split(/(\s+)/).map((part, index) =>
          part.trim() ? (
            <span className="film-footer-word" key={`${part}-${index}`}>
              {graphemes(part).map((glyph, glyphIndex) => (
                <span className="film-footer-char" key={`${glyph}-${glyphIndex}`}>
                  {glyph}
                </span>
              ))}
            </span>
          ) : (
            <span key={`space-${index}`}> </span>
          ),
        )}
      </p>
      <p className="film-footer-rooms">
        <a href="/">{dictionary.entrance}</a>
        <a href={`/photography/${lang}`}>{dictionary.photography}</a>
        <FilmLink to="/filmmaking/$lang" params={{ lang }} search={{ work: undefined }}>
          {dictionary.filmmaking}
        </FilmLink>
      </p>
      <p className="film-footer-copy">
        {displayName(lang)} — Photography · Filmmaking
        <span>© {year}</span>
      </p>
    </footer>
  );
}
