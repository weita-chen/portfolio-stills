import { useEffect, useId, useRef, useState } from "react";
import { slideshowMs } from "@/content/site";
import type { Lang, Photo } from "@/content/types";
import { t } from "@/content/types";
import { site } from "@/content/site";
import type { Slide } from "@/content/queries";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function Slideshow({ slides, lang }: { slides: Slide[]; lang: Lang }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1]));
  const reduced = usePrefersReducedMotion();
  const count = slides.length;

  useEffect(() => {
    setLoaded((current) => {
      const next = new Set(current);
      next.add(index);
      next.add((index + 1) % count);
      return next;
    });
  }, [index, count]);

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    let timer = 0;
    const start = () => {
      window.clearInterval(timer);
      if (document.hidden) return;
      timer = window.setInterval(() => {
        setIndex((current) => (current + 1) % count);
      }, slideshowMs);
    };
    start();
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [paused, reduced, count]);

  useEffect(() => {
    const upcoming = slides[(index + 1) % count];
    if (!upcoming?.src) return;
    const image = new Image();
    image.src = upcoming.src;
  }, [index, slides, count]);

  const current = slides[index];
  if (!current) return null;

  return (
    <div className="slideshow" aria-roledescription="carousel">
      {slides.map((slide, i) =>
        loaded.has(i) && slide.src ? (
          <img
            key={slide.id}
            src={slide.src}
            alt={t(slide.alt, lang)}
            width={slide.width}
            height={slide.height}
            className={i === index ? "is-active" : undefined}
            style={{ objectPosition: slide.objectPosition }}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
          />
        ) : null,
      )}
      <div className="slide-ui">
        <span className="tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <button
          type="button"
          aria-pressed={paused || reduced}
          onClick={() => setPaused((value) => !value)}
        >
          {paused || reduced ? t(site.play, lang) : t(site.pause, lang)}
        </button>
      </div>
    </div>
  );
}

export function Frame({
  photo,
  lang,
  className,
  priority = false,
  ratio = true,
}: {
  photo: Photo;
  lang: Lang;
  className?: string;
  priority?: boolean;
  ratio?: boolean;
}) {
  const style = ratio ? { aspectRatio: `${photo.width} / ${photo.height}` } : undefined;
  if (photo.placeholder || !photo.src) {
    return (
      <div className={`frame ${className ?? ""}`} style={style}>
        <div className="placeholder">
          <div>
            <strong>{photo.id.split("-").slice(-1)[0]}</strong>
            <span>{t(site.forthcoming, lang)}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`frame ${className ?? ""}`} style={style}>
      <img
        src={photo.src}
        alt={t(photo.alt, lang)}
        width={photo.width}
        height={photo.height}
        style={{ objectPosition: photo.objectPosition ?? "center" }}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}

export function Lightbox({
  photos,
  index,
  lang,
  onClose,
  onIndex,
}: {
  photos: Photo[];
  index: number;
  lang: Lang;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const photo = photos[index];
  const startX = useRef<number | null>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex((index + 1) % photos.length);
      if (event.key === "ArrowLeft")
        onIndex((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [index, onClose, onIndex, photos.length]);

  if (!photo?.src) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onPointerDown={(event) => {
        startX.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (startX.current == null) return;
        const delta = event.clientX - startX.current;
        startX.current = null;
        if (Math.abs(delta) < 48) return;
        if (delta < 0) onIndex((index + 1) % photos.length);
        else onIndex((index - 1 + photos.length) % photos.length);
      }}
    >
      <div className="lightbox-bar">
        <span id={titleId} className="tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button ref={closeRef} type="button" onClick={onClose}>
          {t(site.close, lang)}
        </button>
      </div>
      <div className="lightbox-stage">
        <button
          type="button"
          className="lb-nav"
          onClick={() => onIndex((index - 1 + photos.length) % photos.length)}
        >
          {t(site.previous, lang)}
        </button>
        <img
          src={photo.src}
          alt={t(photo.alt, lang)}
          width={photo.width}
          height={photo.height}
        />
        <button
          type="button"
          className="lb-nav"
          onClick={() => onIndex((index + 1) % photos.length)}
        >
          {t(site.next, lang)}
        </button>
      </div>
      <div className="lightbox-foot">
        <p className="lb-caption">{photo.caption ? t(photo.caption, lang) : t(photo.alt, lang)}</p>
        <span className="sr">
          {lang === "zh-tw" ? "左右滑動可換圖" : "Swipe sideways to change image"}
        </span>
      </div>
    </div>
  );
}
