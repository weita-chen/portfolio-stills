import { useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProjectCopy } from "../lib/content";
import { getDictionary, type FilmLang } from "../lib/i18n";
import { consumeOpenFlip, restoreOpenFlip, runFlip, stashCloseFlip } from "../lib/flip";
import { videoFrameVars } from "../lib/motion";
import { FilmLink } from "./FilmLink";
import { FilmPlayer } from "./FilmPlayer";

export function ProjectViewer({
  project,
  projects,
  lang,
}: {
  project: ProjectCopy;
  projects: ProjectCopy[];
  lang: FilmLang;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const router = useRouter();
  const dictionary = getDictionary(lang);
  const [muted, setMuted] = useState(false);
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null;
  const frame = videoFrameVars(project.aspectRatio);
  const zh = lang === "zh-tw";
  const [slide, setSlide] = useState<{ slug: string; dir: "next" | "prev" | "none" }>({
    slug: project.slug,
    dir: "none",
  });
  if (slide.slug !== project.slug) {
    const from = projects.findIndex((item) => item.slug === slide.slug);
    setSlide({ slug: project.slug, dir: index >= from ? "next" : "prev" });
    setMuted(false);
  }
  const dir = slide.slug === project.slug ? slide.dir : "none";

  const go = (slug: string) => {
    void navigate({
      to: "/filmmaking/$lang",
      params: { lang },
      search: (prev) => ({ ...prev, work: slug }),
      mask: {
        to: "/filmmaking/$lang/work/$slug",
        params: { lang, slug },
        unmaskOnReload: true,
      },
      replace: true,
      resetScroll: false,
    });
  };

  const close = () => {
    const slug = project.slug;
    const frame = dialog.current?.querySelector(".film-viewer-frame");
    const card = document.querySelector(`[data-slug="${slug}"]`);
    if (card instanceof HTMLElement && frame) {
      const rect = card.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) stashCloseFlip(slug, frame);
    }
    if (router.history.canGoBack()) router.history.back();
    else {
      void navigate({
        to: "/filmmaking/$lang",
        params: { lang },
        search: (prev) => ({ ...prev, work: undefined }),
        replace: true,
        resetScroll: false,
      });
    }
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(`[data-slug="${slug}"] .film-card-hit`)?.focus();
    }, 40);
  };

  useLayoutEffect(() => {
    const state = consumeOpenFlip();
    if (!state) return;
    let played = false;
    const id = window.requestAnimationFrame(() => {
      played = true;
      const frame = dialog.current?.querySelector(".film-viewer-frame");
      if (!frame || !dialog.current) return;
      dialog.current.dataset.flip = "on";
      runFlip(state, frame, 0.7);
    });
    return () => {
      window.cancelAnimationFrame(id);
      if (!played) restoreOpenFlip(state);
    };
  }, []);

  useEffect(() => {
    const y = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      window.scrollTo(0, y);
    };
  }, []);

  const closeRef = useRef(close);
  const goRef = useRef(go);
  closeRef.current = close;
  goRef.current = go;

  useEffect(() => {
    const root = dialog.current;
    if (!root) return;
    const opened = root.dataset.opened === "true";
    if (!opened) {
      root.dataset.opened = "true";
      root.querySelector<HTMLButtonElement>(".film-viewer-close")?.focus();
    }
    const videoOf = () => root.querySelector("video");
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      } else if (event.key === "ArrowRight" && next) {
        event.preventDefault();
        goRef.current(next.slug);
      } else if (event.key === "ArrowLeft" && previous) {
        event.preventDefault();
        goRef.current(previous.slug);
      } else if (event.key === " ") {
        event.preventDefault();
        const video = videoOf();
        if (!video) return;
        if (video.paused) void video.play();
        else video.pause();
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        const stage = root.querySelector(".film-viewer-stage");
        if (!stage) return;
        if (document.fullscreenElement) void document.exitFullscreen();
        else void stage.requestFullscreen?.();
      } else if (event.key === "m" || event.key === "M") {
        event.preventDefault();
        const video = videoOf();
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
        if (!video.muted) void video.play();
      } else if (event.key === "Tab") {
        const items = [...root.querySelectorAll<HTMLElement>("a, button")].filter(
          (item) => !item.hasAttribute("disabled"),
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
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [project.slug, next, previous]);

  const specs = [
    [zh ? "比例" : "Aspect", project.aspectRatio],
    [zh ? "地點" : "Location", project.location],
    [zh ? "相機" : "Camera", project.camera],
    [zh ? "鏡頭" : "Lenses", project.lenses],
    [zh ? "格式" : "Format", project.format],
    [zh ? "調光" : "Grade", project.grade],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div
      ref={dialog}
      className="film-viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="film-viewer-title"
    >
      <div
        className="film-viewer-stage"
        onPointerDown={(event) => {
          event.currentTarget.dataset.x = String(event.clientX);
        }}
        onPointerUp={(event) => {
          const start = Number(event.currentTarget.dataset.x ?? event.clientX);
          const delta = event.clientX - start;
          if (delta > 70 && previous) go(previous.slug);
          if (delta < -70 && next) go(next.slug);
        }}
      >
        <div
          key={project.slug}
          className="film-viewer-frame"
          data-dir={dir}
          style={
            {
              "--film-video-aspect": frame.aspect,
              "--film-video-ar": frame.ar,
            } as React.CSSProperties
          }
        >
          <FilmPlayer
            key={project.slug}
            playbackId={project.playbackId}
            title={project.title}
            slug={project.slug}
            posterTime={project.posterTime}
            aspectRatio={project.aspectRatio}
            autoPlay
            lang={lang}
            maxResolution={project.maxResolution}
            posterWidth={project.posterWidth}
            playFromStart={project.playFromStart}
            onNeedSound={() => setMuted(true)}
          />
        </div>
        {muted ? (
          <button
            className="film-sound"
            type="button"
            onClick={() => {
              const video = dialog.current?.querySelector("video");
              if (!video) return;
              video.muted = false;
              void video.play();
              setMuted(false);
            }}
          >
            {dictionary.sound}
          </button>
        ) : null}
      </div>
      <aside className="film-viewer-info">
        <button className="film-viewer-close" type="button" onClick={close} aria-label={dictionary.closePlayer}>
          ×
        </button>
        <h2 id="film-viewer-title" className="film-viewer-title">
          {project.title}
        </h2>
        <p className="film-viewer-kicker">
          {[project.client, project.year].filter(Boolean).join(" · ")}
        </p>
        <p className="film-viewer-meta">{project.roles.map((role) => dictionary.roles[role]).join(" · ")}</p>
        {project.description || project.summary ? (
          <p className="film-viewer-body">{project.description || project.summary}</p>
        ) : null}
        {project.credits.length ? (
          <>
            <p className="film-viewer-label">{dictionary.credits}</p>
            {project.credits.map((credit) => (
              <p className="film-viewer-credit" key={`${credit.role}-${credit.name}`}>
                <strong>{credit.role}</strong> {credit.name}
              </p>
            ))}
          </>
        ) : null}
        {specs.length ? (
          <>
            <p className="film-viewer-label">{zh ? "規格" : "Specs"}</p>
            {specs.map(([label, value]) => (
              <p className="film-viewer-spec" key={label}>
                {label} {value}
              </p>
            ))}
          </>
        ) : null}
        <FilmLink
          className="film-viewer-project"
          to="/filmmaking/$lang/work/$slug"
          params={{ lang, slug: project.slug }}
        >
          {dictionary.viewProject} →
        </FilmLink>
        <div className="film-viewer-nav">
          <button type="button" disabled={!previous} onClick={() => previous && go(previous.slug)} aria-label={dictionary.previous}>
            ←
          </button>
          <button type="button" disabled={!next} onClick={() => next && go(next.slug)} aria-label={dictionary.next}>
            →
          </button>
        </div>
      </aside>
    </div>
  );
}
