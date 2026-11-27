import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { slideshowMs } from "@/content/site";
import { variantFor, photoSizes } from "@/content/photos";
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

function PhotoImg({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
  style,
  onLoad,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  onLoad?: () => void;
}) {
  const variant = variantFor(src);
  return (
    <picture>
      {variant?.avif ? <source type="image/avif" srcSet={variant.avif} sizes={sizes} /> : null}
      {variant?.webp ? <source type="image/webp" srcSet={variant.webp} sizes={sizes} /> : null}
      <img
        src={variant?.src ?? src}
        srcSet={variant?.jpeg}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
        onLoad={onLoad}
        onError={onLoad}
      />
    </picture>
  );
}

export function Slideshow({ slides, lang }: { slides: Slide[]; lang: Lang }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [primed, setPrimed] = useState(false);
  const [follow, setFollow] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const reduced = usePrefersReducedMotion();
  const count = slides.length;

  useEffect(() => {
    setLoaded((current) => {
      const upcoming = follow || index !== 0 ? (index + 1) % count : null;
      if (current.has(index) && (upcoming == null || current.has(upcoming))) return current;
      const next = new Set(current);
      next.add(index);
      if (upcoming != null) next.add(upcoming);
      return next;
    });
  }, [index, count, follow]);

  useEffect(() => {
    if (!primed) return;
    const run = () => setFollow(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 700);
    return () => window.clearTimeout(id);
  }, [primed]);

  useEffect(() => {
    const hero = document.querySelector(".slideshow img.is-active");
    if (hero instanceof HTMLImageElement && hero.complete && hero.naturalWidth > 0) setPrimed(true);
  }, []);

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
    if (index === 0 && !follow) return;
    const upcoming = slides[(index + 1) % count];
    if (!upcoming?.src) return;
    const image = new Image();
    const upcomingVariant = variantFor(upcoming.src);
    if (upcomingVariant) {
      image.srcset = upcomingVariant.avif;
      image.sizes = photoSizes.bleed;
    }
    image.src = upcomingVariant?.src ?? upcoming.src;
  }, [index, slides, count, follow]);

  const current = slides[index];
  if (!current) return null;
  const blur = variantFor(current.src)?.blur;

  return (
    <div
      className="slideshow"
      aria-roledescription="carousel"
      style={blur ? { backgroundImage: `url("${blur}")` } : undefined}
    >
      {slides.map((slide, i) =>
        loaded.has(i) && slide.src ? (
          <PhotoImg
            key={slide.id}
            src={slide.src}
            alt={t(slide.alt, lang)}
            width={slide.width}
            height={slide.height}
            sizes={photoSizes.bleed}
            className={i === index ? "is-active" : undefined}
            style={{ objectPosition: slide.objectPosition }}
            priority={i === 0}
            onLoad={i === 0 ? () => setPrimed(true) : undefined}
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
  sizes = photoSizes.full,
}: {
  photo: Photo;
  lang: Lang;
  className?: string;
  priority?: boolean;
  ratio?: boolean;
  sizes?: string;
}) {
  const variant = variantFor(photo.src);
  const style: CSSProperties = {
    ...(ratio ? { aspectRatio: `${photo.width} / ${photo.height}` } : {}),
    ...(variant?.blur
      ? {
          backgroundImage: `url("${variant.blur}")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }
      : {}),
  };
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
      <PhotoImg
        src={photo.src}
        alt={t(photo.alt, lang)}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        style={{ objectPosition: photo.objectPosition ?? "center" }}
        priority={priority}
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
        <PhotoImg
          src={photo.src}
          alt={t(photo.alt, lang)}
          width={photo.width}
          height={photo.height}
          sizes={photoSizes.bleed}
          priority
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
